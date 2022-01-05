package packets

import "errors"

type HelloAckPacket struct {
	PublicKey []byte
	AesData   []byte
}

func EncodeHelloAck(packet HelloAckPacket) []byte {
	opCode := make([]byte, 1)
	opCode[0] = HelloAck

	output := append(opCode, packet.PublicKey...)
	output = append(output, packet.AesData...)

	return output
}

func DecodeHelloAck(data []byte) (DataPacket, error) {
	if len(data) <= (1 + 33 + 32) {
		return nil, errors.New("hello data must be at least 66 bytes")
	}
	return HelloAckPacket{
		data[1:34],
		data[34:],
	}, nil
}