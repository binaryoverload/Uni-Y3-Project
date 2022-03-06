package server

import (
	"client/packets"
	"client/utils"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"io/ioutil"
	"os"
	"sync"
)

const fileRequestRetries = 3
const numWorkers = 3

var logger = utils.GetLogger()

type FileChunkReq struct {
	FileId      uuid.UUID `json:"file_id"`
	ChunkNumber int       `json:"chunk_number"`
}

type FileInfoReq struct {
	FileId uuid.UUID `json:"file_id"`
}

func RequestFileChunk(fileId uuid.UUID, chunkNum int) error {
	fileChunkReq := FileChunkReq{
		FileId:      fileId,
		ChunkNumber: chunkNum,
	}

	data, err := RunTcpActions([]TcpAction{SendHello, RecieveHelloAck, SendFileChunkReq(fileChunkReq), RecieveData})

	if err != nil {
		return err
	}

	dataBytes, ok := data.([]byte)

	if !ok {
		return errors.New("data returned is not []byte")
	}

	if dataBytes[0] != packets.OpCodeFileChunkRes {
		return errors.New("opcode returned is not correct")
	}

	dataBytes = dataBytes[1:]

	file, err := os.Create(fmt.Sprintf("temp/%s.%d.chunk", fileId, chunkNum))
	if err != nil {
		return err
	}

	numBytes, err := file.Write(dataBytes)
	if err != nil {
		return err
	}

	logger.Debugf("(f_id: %s, c: %d) written %d bytes to files", fileId, chunkNum, numBytes)
	return nil
}

func FileRequestWorker(wg *sync.WaitGroup, jobs <-chan int, outputErrors *map[int]error, fileId uuid.UUID) {
	defer wg.Done()

	for chunkNum := range jobs {
		var err error

		for retry := 1; retry <= fileRequestRetries; retry++ {
			logger.Debugf("(f_id: %s, r: %d, c: %d) starting chunk download", fileId, retry, chunkNum)
			err = RequestFileChunk(fileId, chunkNum)
			if err != nil {
				logger.Debugf("(f_id: %s, r: %d, c: %d) error with chunk download: %w", fileId, retry, chunkNum, err)
			} else {
				break
			}
		}

		if err != nil {
			(*outputErrors)[chunkNum] = err
		}
	}
}

func RequestFileChunks(fileId uuid.UUID, numChunks int, totalSize int64) {
	logger.Infof("(f_id: %s) starting download of file with %d chunks", fileId, numChunks)
	jobs := make(chan int, numChunks)
	outputErrors := make(map[int]error)

	var wg sync.WaitGroup
	wg.Add(numChunks)

	for i := 0; i < numChunks; i++ {
		jobs <- i
	}
	close(jobs)

	numberWorkers := numChunks
	if numberWorkers > numWorkers {
		numberWorkers = numWorkers
	}

	for workerNum := 0; workerNum < numberWorkers; workerNum++ {
		go FileRequestWorker(&wg, jobs, &outputErrors, fileId)
	}

	wg.Wait()

	if len(outputErrors) > 0 {
		logger.Errorf("(f_id: %s) could not download all file chunks", fileId)
		for chunk, err := range outputErrors {
			logger.Errorf("(f_id: %s, c: %d) %s", fileId, chunk, err.Error())
		}
		return
	}

	combinedFile, err := os.Create(fmt.Sprintf("%s.combined", fileId))
	defer func(combinedFile *os.File) {
		err := combinedFile.Close()
		if err != nil {
			logger.Errorf("(f_id: %s) could not close combined file", fileId)
		}
	}(combinedFile)
	if err != nil {
		logger.Errorf("(f_id: %s) could not created combined file", fileId)
	}

	if err := combinedFile.Truncate(totalSize); err != nil {
		logger.Errorf("(f_id: %s) could not set combined file size", fileId)
	}

	var numBytes int64 = 0
	for chunkNum := 0; chunkNum < numChunks; chunkNum++ {
		logger.Debugf("(f_id: %s, c: %d) writing chunk to combined file", fileId, chunkNum)
		chunkBytes, err := ioutil.ReadFile(fmt.Sprintf("%s.%d.chunk", fileId, chunkNum))
		if err != nil {
			logger.Errorf("(f_id: %s, c: %d) could not read chunk, combined file is corrupted", fileId, chunkNum)
			break
		}

		_, err = combinedFile.WriteAt(chunkBytes, numBytes)
		if err != nil {
			logger.Errorf("(f_id: %s, c: %d) could not write chunk to combined file", fileId, chunkNum)
			return
		}
		numBytes += int64(len(chunkBytes))
	}

}

func SendFileChunkReq(req FileChunkReq) TcpAction {
	reqData := struct {
		OpCode      int       `json:"op_code"`
		FileId      uuid.UUID `json:"file_id"`
		ChunkNumber int       `json:"chunk_number"`
	}{
		OpCode:      packets.OpCodeFileChunkReq,
		FileId:      req.FileId,
		ChunkNumber: req.ChunkNumber,
	}

	return GetSendDataFunction(reqData)
}

func SendFileInfoReq(req FileInfoReq) TcpAction {
	reqData := struct {
		OpCode int       `json:"op_code"`
		FileId uuid.UUID `json:"file_id"`
	}{
		OpCode: packets.OpCodeFileInfoReq,
		FileId: req.FileId,
	}

	return GetSendDataFunction(reqData)
}
