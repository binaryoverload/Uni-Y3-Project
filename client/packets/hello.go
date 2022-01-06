package packets

import (
	"errors"
)

type HelloPacket struct {
	PublicKey []byte
	AesData   []byte
}

type HelloAckPacket struct {
	PublicKey []byte
	AesData   []byte
}

type HelloNAckPacket struct {}

func (packet *HelloPacket) Encode() []byte {
	var output = make([]byte, 1 + len(packet.PublicKey) + len(packet.AesData))
	output[0] = Hello
	copy(output[1:], packet.PublicKey)
	copy(output[(len(packet.PublicKey) + 1):], packet.AesData)

	return output
}

func (packet *HelloPacket) decode(data []byte) error {
	if len(data) <= (33 + 32) {
		return errors.New("hello data must be at least 66 bytes")
	}
	packet.PublicKey = data[0:33]
	packet.AesData = data[33:]
	return nil
}

func (packet *HelloAckPacket) Encode() []byte {
	opCode := make([]byte, 1)
	opCode[0] = HelloAck

	output := append(opCode, packet.PublicKey...)
	output = append(output, packet.AesData...)

	return output
}

func (packet *HelloAckPacket) decode(data []byte) error {
	if len(data) <= (33 + 32) {
		return errors.New("helloack data must be at least 66 bytes")
	}
	packet.PublicKey = data[0:33]
	packet.AesData = data[33:]
	return nil
}

func (packet *HelloNAckPacket) Encode() []byte {
	output := make([]byte, 1)
	output[0] = HelloNAck
	return output
}

func (packet *HelloNAckPacket) decode(_ []byte) error {
	return nil
}