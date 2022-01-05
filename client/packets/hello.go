package packets

import "errors"

type HelloPacket struct {
	PublicKey []byte
	AesData   []byte
}

func EncodeHello(packet HelloPacket) []byte {
	opCode := make([]byte, 1)
	opCode[0] = Hello

	output := append(opCode, packet.PublicKey...)
	output = append(output, packet.AesData...)

	return output
}

func decodeHello(data []byte) (DataPacket, error) {
	if len(data) <= (1 + 33 + 32) {
		return nil, errors.New("hello data must be at least 66 bytes")
	}
	return HelloPacket{
		data[1:33],
		data[33:],
	}, nil
}