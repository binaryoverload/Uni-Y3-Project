package server

import (
	"client/config"
	"client/encryption"
	"client/packets"
	"encoding/binary"
	"errors"
	"io"
	"net"
)

func SendHello(conn *net.Conn, env *config.Environment, _ interface{}) (interface{}, error) {
	data, err := encryption.EncryptAes(env, []byte("{}"))
	if err != nil {
		return nil, err
	}

	packet := (&packets.HelloPacket{
		PublicKey: encryption.GetPublicKey(env),
		AesData:   data,
	}).Encode()

	return nil, WriteWithLength(conn, packet)
}

func RecieveHelloAck(conn *net.Conn, env *config.Environment, _ interface{}) (interface{}, error) {
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

	decodedData, err := packets.Decode(data)
	if err != nil {
		return nil, err
	}

	helloAck, ok := decodedData.(*packets.HelloAckPacket)

	if !ok {
		return nil, errors.New("expected packet was not helloack")
	}

	decryptedData, err := encryption.DecryptAes(env, helloAck.AesData)
	if err != nil {
		return nil, err
	}

	return decryptedData, nil
}
