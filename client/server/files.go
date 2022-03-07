package server

import (
	"bytes"
	"client/config"
	"client/packets"
	"client/utils"
	"crypto/md5"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"io/ioutil"
	"os"
	"path/filepath"
	"sync"
)

const fileRequestRetries = 3
const numWorkers = 3

var logger = utils.GetLogger()
var conf = config.GetConfigInstance()

type FileChunkReq struct {
	FileId      uuid.UUID `json:"file_id"`
	ChunkNumber int       `json:"chunk_number"`
}

type FileInfoReq struct {
	FileId uuid.UUID `json:"file_id"`
}

func RequestFileChunk(fileId uuid.UUID, workerNum int, chunkNum int) error {
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

	file, err := os.Create(filepath.Join(conf.TempDownloadPath, fmt.Sprintf("%s.%d.chunk", fileId, chunkNum)))
	if err != nil {
		return err
	}

	numBytes, err := file.Write(dataBytes)
	if err != nil {
		return err
	}

	logger.Debugf("(f_id: %s, w: %d, c: %d) written %d bytes to files", fileId, workerNum, chunkNum, numBytes)
	return nil
}

func FileRequestWorker(wg *sync.WaitGroup, workerNum int, jobs <-chan int, outputErrors *map[int]error, fileId uuid.UUID) {
	for chunkNum := range jobs {
		var err error

		for retry := 1; retry <= fileRequestRetries; retry++ {
			logger.Debugf("(f_id: %s, w: %d, r: %d, c: %d) starting chunk download", fileId, workerNum, retry, chunkNum)
			err = RequestFileChunk(fileId, workerNum, chunkNum)
			if err != nil {
				logger.Debugf("(f_id: %s, w: %d, r: %d, c: %d) error with chunk download: %w", fileId, workerNum, retry, chunkNum, err)
			} else {
				break
			}
		}

		if err != nil {
			(*outputErrors)[chunkNum] = err
		}
		wg.Done()
	}
}

func ChunkDownloadCleanup(fileId uuid.UUID, numChunks int) {
	logger.Infof("(f_id: %s) starting cleanup of temp files with %d chunks", fileId, numChunks)
	for chunkNum := 0; chunkNum < numChunks; chunkNum++ {
		err := os.Remove(filepath.Join(conf.TempDownloadPath, fmt.Sprintf("%s.%d.chunk", fileId, chunkNum)))
		if err == nil {
			logger.Debugf("(f_id: %s, c: %d) successfully deleted chunk file", fileId, chunkNum)
		} else {
			logger.Debugf("(f_id: %s, c: %d) error deleting chunk file: %s", fileId, chunkNum, err.Error())
		}
	}
}

func RequestFileChunks(fileId uuid.UUID, hash string, numChunks int, totalSize int64) string {
	defer ChunkDownloadCleanup(fileId, numChunks)

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
		go FileRequestWorker(&wg, workerNum, jobs, &outputErrors, fileId)
	}

	wg.Wait()

	if len(outputErrors) > 0 {
		logger.Errorf("(f_id: %s) could not download all file chunks", fileId)
		for chunk, err := range outputErrors {
			logger.Errorf("(f_id: %s, c: %d) %s", fileId, chunk, err.Error())
		}
		return ""
	}

	var buf bytes.Buffer
	failed := false
	for chunkNum := 0; chunkNum < numChunks; chunkNum++ {
		logger.Debugf("(f_id: %s, c: %d) reading chunk to memory", fileId, chunkNum)
		chunkBytes, err := ioutil.ReadFile(filepath.Join(conf.TempDownloadPath, fmt.Sprintf("%s.%d.chunk", fileId, chunkNum)))
		if err != nil {
			logger.Errorf("(f_id: %s, c: %d) could not read chunk", fileId, chunkNum)
			failed = true
			break
		}

		buf.Write(chunkBytes)
	}

	if failed {
		logger.Errorf("(f_id: %s) one or more chunks failed to read, aborting write", fileId)
		return ""
	}

	combinedHash := fmt.Sprintf("%x", md5.Sum(buf.Bytes()))

	if hash != combinedHash {
		logger.Errorf("(f_id: %s) hash comparison failed, aborting write", fileId)
		return ""
	}

	combinedFile, err := os.Create(filepath.Join(conf.TempDownloadPath, fmt.Sprintf("%s.combined", fileId)))
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

	_, err = combinedFile.Write(buf.Bytes())
	if err != nil {
		logger.Errorf("(f_id: %s) could not write chunks to combined file", fileId)
		return ""
	}
	logger.Debugf("(f_id: %s) wrote %d bytes to combined file", fileId, buf.Len())
	logger.Infof("(f_id: %s) successfully downloaded file", fileId)
	return combinedFile.Name()
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
