package server

import (
	"client/packets"
	"client/utils"
	"errors"
	"fmt"
	"github.com/google/uuid"
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

	data, err := RunTcpActions([]TcpAction{SendFileChunkReq(fileChunkReq), RecieveData})

	if err != nil {
		return err
	}

	dataBytes, ok := data.([]byte)

	if !ok {
		return errors.New("data returned is not []byte")
	}

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

func FileRequestWorker(wg *sync.WaitGroup, jobs <-chan int, outputErrors *map[int]bool, fileId uuid.UUID) {
	defer wg.Done()

	for chunkNum := range jobs {
		var err error

		for retry := 0; retry < fileRequestRetries; retry++ {
			logger.Debugf("(f_id: %s, r: %d, c: %d) starting chunk download", fileId, retry, chunkNum)
			err = RequestFileChunk(fileId, chunkNum)
			if err != nil {
				logger.Debugf("(f_id: %s, r: %d, c: %d) error with chunk download: %w", fileId, retry, chunkNum, err)
			} else {
				break
			}
		}

		if err != nil {
			(*outputErrors)[chunkNum] = true
		}
	}
}

func RequestFileChunks(fileId uuid.UUID, numChunks int) {
	logger.Infof("(f_id: %s) starting download of file with %d chunks", fileId, numChunks)
	jobs := make(chan int, numChunks)
	outputErrors := make(map[int]bool)

	var wg sync.WaitGroup
	wg.Add(numChunks)

	for workerNum := 0; workerNum < numWorkers; workerNum++ {
		go FileRequestWorker(&wg, jobs, &outputErrors, fileId)
	}

	wg.Wait()
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
