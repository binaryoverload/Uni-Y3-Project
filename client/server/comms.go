package server

import (
	"client/encryption"
	"client/packets"
	"encoding/binary"
	"encoding/json"
	"errors"
	"io"
	"net"
)



func SendClientRegistration(conn *net.Conn, _ interface{}) (interface{}, error) {
	type ClientRegistration struct {
		OpCode         int    `json:"op_code"`
		EnrolmentToken string `json:"enrolment_token"`
		PublicKey      string `json:"public_key"`
		Name           string `json:"name"`
	}

	inputData := ClientRegistration{
		OpCode: 1,
		EnrolmentToken: conf.EnrolmentToken,
		PublicKey: encryption.GetPublicKeyHex(),
		Name: "HI",
	}
    jsonData, _ := json.Marshal(inputData)
	data, err := encryption.EncryptAes(jsonData)
	if err != nil {
		return nil, err
	}

	packet := (&packets.DataPacket{
		AesData: data,
	}).Encode()

	return nil, WriteWithLength(conn, packet)
}

func RecieveData(conn *net.Conn, _ interface{}) (interface{}, error) {
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

	dataPacket, ok := decodedData.(*packets.DataPacket)

	if !ok {
		return nil, errors.New("expected packet was not a datapacket")
	}

	decryptedData, err := encryption.DecryptAes(dataPacket.AesData)
	if err != nil {
		return nil, err
	}

	var jsonData interface{}

	err = json.Unmarshal(decryptedData, &jsonData)
	if err != nil {
		return nil, err
	}

	return jsonData, nil
}
