package packets

import "errors"

type DataPacket struct {
	AesData   []byte
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