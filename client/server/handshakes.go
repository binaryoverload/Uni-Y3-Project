package server

import (
	"client/encryption"
	"client/packets"
	"encoding/binary"
	"errors"
	"io"
	"net"
)

func SendHello(conn *net.Conn, _ interface{}) (interface{}, error) {
	data := encryption.EncryptAes([]byte("{}"))

	packet := (&packets.HelloPacket{
		PublicKey: encryption.GetPublicKey(),
		AesData:   data,
	}).Encode()

	return nil, WriteWithLength(conn, packet)
}

func RecieveHelloAck(conn *net.Conn, _ interface{}) (interface{}, error) {
	length := make([]byte, 4)
	_, err := io.ReadFull(*conn, length)
	if err != nil {
		return nil, err
	}

	data := make([]byte, binary.BigEndian.Uint32(length))
	_, err = io.ReadFull(*conn, data)
	if err != nil {
		return nil, err
	}

	decodedData, _ := packets.Decode(data)

	helloAck, ok := decodedData.(*packets.HelloAckPacket)

	if !ok {
		return nil, errors.New("expected packet was not helloack")
	}

	decryptedData := encryption.DecryptAes(helloAck.AesData)

	return decryptedData, nil
}