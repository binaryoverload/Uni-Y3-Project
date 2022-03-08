package server

import (
	"bytes"
	"client/config"
	"client/packets"
	"client/policies"
	"client/utils"
	"crypto/md5"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"sync"
)

const fileRequestRetries = 3
const numWorkers = 3

var logger = utils.GetLogger()
var conf = config.GetConfigInstance()

func RequestFileChunk(fileId uuid.UUID, workerNum int, chunkNum int) error {
	fileChunkReq := packets.FileChunkReq{
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

func CombineFileChunks(fileId uuid.UUID, hash string, numChunks int, totalSize int64) error {
	var buf bytes.Buffer
	for chunkNum := 0; chunkNum < numChunks; chunkNum++ {
		logger.Debugf("(f_id: %s, c: %d) reading chunk to memory", fileId, chunkNum)
		chunkBytes, err := ioutil.ReadFile(filepath.Join(conf.TempDownloadPath, fmt.Sprintf("%s.%d.chunk", fileId, chunkNum)))
		if err != nil {
			return fmt.Errorf("(f_id: %s, c: %d) could not read chunk, aborting write", fileId, chunkNum)
		}

		buf.Write(chunkBytes)
	}

	combinedHash := fmt.Sprintf("%x", md5.Sum(buf.Bytes()))

	if hash != combinedHash {
		return fmt.Errorf("(f_id: %s) hash comparison failed, aborting write", fileId)
	}

	combinedFile, err := os.Create(filepath.Join(conf.TempDownloadPath, fmt.Sprintf("%s.combined", fileId)))
	defer func(combinedFile *os.File) {
		err := combinedFile.Close()
		if err != nil {
			logger.Errorf("(f_id: %s) could not close combined file: %w", fileId, err)
		}
	}(combinedFile)
	if err != nil {
		return fmt.Errorf("(f_id: %s) could not created combined file: %w", fileId, err)
	}

	if err := combinedFile.Truncate(totalSize); err != nil {
		return fmt.Errorf("(f_id: %s) could not set combined file size: %s", fileId, err)
	}

	_, err = combinedFile.Write(buf.Bytes())
	if err != nil {
		return fmt.Errorf("(f_id: %s) could not write chunks to combined file: %w", fileId, err)
	}
	logger.Debugf("(f_id: %s) wrote %d bytes to combined file", fileId, buf.Len())
	logger.Infof("(f_id: %s) successfully downloaded file", fileId)
	return nil
}

func MoveCombinedFile(fileId uuid.UUID, totalSize int64, policy policies.FilePolicy) error {
	srcFile := filepath.Join(conf.TempDownloadPath, fmt.Sprintf("%s.combined", fileId))

	sourceFileStat, err := os.Stat(srcFile)
	if err != nil {
		return err
	}

	if !sourceFileStat.Mode().IsRegular() {
		return nil
	}

	source, err := os.Open(srcFile)
	if err != nil {
		return fmt.Errorf("could not open src for reading: %w", err)
	}
	defer func(source *os.File) {
		_ = source.Close()
	}(source)

	destination, err := os.OpenFile(policy.Destination, os.O_RDWR|os.O_CREATE|os.O_TRUNC, os.FileMode(policy.Permissions))
	if err != nil {
		return fmt.Errorf("could not open dst for writing: %w", err)
	}
	defer func(destination *os.File) {
		_ = destination.Close()
	}(destination)
	nBytes, err := io.Copy(destination, source)

	if nBytes != totalSize {
		return fmt.Errorf("num bytes written (%d) != total file size (%d)", nBytes, totalSize)
	}

	return nil
}

func RequestFileChunks(fileId uuid.UUID, numChunks int) error {
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

		errString := ""
		for chunk, err := range outputErrors {
			errString += fmt.Sprintf("(f_id: %s, c: %d) %s\n", fileId, chunk, err.Error())
		}

		return fmt.Errorf("(f_id: %s) could not download all file chunks\n%s", fileId, errString)
	}
	return nil
}

func SendFileChunkReq(req packets.FileChunkReq) TcpAction {
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

func SendFileInfoReq(req packets.FileInfoReq) TcpAction {
	reqData := struct {
		OpCode int       `json:"op_code"`
		FileId uuid.UUID `json:"file_id"`
	}{
		OpCode: packets.OpCodeFileInfoReq,
		FileId: req.FileId,
	}

	return GetSendDataFunction(reqData)
}
