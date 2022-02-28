package packets

import "errors"

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
