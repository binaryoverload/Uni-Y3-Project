package server

import (
	"client/packets"
	"github.com/google/uuid"
)

type FileChunkReq struct {
	FileId      uuid.UUID `json:"file_id"`
	ChunkNumber int       `json:"chunk_number"`
}

type FileInfoReq struct {
	FileId uuid.UUID `json:"file_id"`
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
