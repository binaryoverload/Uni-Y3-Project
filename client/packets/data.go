package packets

import (
	"errors"
	"github.com/google/uuid"
)

type DataPacket struct {
	AesData []byte
}

type InnerMessageOpCode uint8

const (
	OpCodeHeartbeat             InnerMessageOpCode = 1
	OpCodeHeartbeatAck                             = 2
	OpCodeClientRegistration                       = 5
	OpCodeClientRegistrationAck                    = 6
	OpCodeFileInfoReq                              = 7
	OpCodeFileInfoRes                              = 8
	OpCodeFileChunkReq                             = 9
	OpCodeFileChunkRes                             = 10
	OpCodeInvalidClient                            = 99
	OpCodeError                                    = 100
)

type FileChunkReq struct {
	FileId      uuid.UUID `json:"file_id"`
	ChunkNumber int       `json:"chunk_number"`
}

type FileInfoReq struct {
	FileId uuid.UUID `json:"file_id"`
}

type FileInfoRes struct {
	FileId    uuid.UUID `json:"file_id"`
	Filename  string    `json:"filename"`
	NumChunks int       `json:"num_chunks"`
	Hash      string    `json:"hash"`
	TotalSize int64     `json:"total_size"`
}

func (packet DataPacket) Encode() []byte {
	opCode := make([]byte, 1)
	opCode[0] = Data

	return append(opCode, packet.AesData...)
}

func (packet *DataPacket) decode(data []byte) error {
	if len(data) <= (32) {
		return errors.New("data must be at least 32 bytes")
	}
	packet.AesData = data
	return nil
}
