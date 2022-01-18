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
	data := encryption.EncryptAes([]byte("{\"op_code\":1,\"enrolment_token\":\"6212abe6a1aee40a\",\"public_key\":\"02738d0a56bcf554e7829c8dc18c1f8a9a128b5b0842896c2f95c1fd770906e045\",\"name\":\"test\"}"))

	packet := (&packets.DataPacket{
		AesData:   data,
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
