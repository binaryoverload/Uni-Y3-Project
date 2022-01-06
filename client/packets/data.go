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

func (packet *DataPacket) Decode(data []byte) error {
	if len(data) <= (1 + 32) {
		return errors.New("data must be at least 33 bytes")
	}
	packet.AesData = data[1:]
	return nil
}