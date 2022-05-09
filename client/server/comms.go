package server

import (
	"client/config"
	"client/encryption"
	"client/packets"
	"client/utils"
	"encoding/binary"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/matishsiao/goInfo"
	"io"
	"net"
)

func SendClientRegistration(conn *net.Conn, env *config.Environment, _ interface{}) (interface{}, error) {
	type ClientRegistration struct {
		OpCode         int                 `json:"op_code"`
		EnrolmentToken string              `json:"enrolment_token"`
		PublicKey      string              `json:"public_key"`
		Name           string              `json:"name"`
		OSInformation  goInfo.GoInfoObject `json:"os_information"`
		MACAddress     string              `json:"mac_address"`
	}

	osInfo := utils.GetOSInfo()

	inputData := ClientRegistration{
		OpCode:         packets.OpCodeClientRegistration,
		EnrolmentToken: env.EnrolmentToken,
		PublicKey:      encryption.GetPublicKey(env).Hex(),
		Name:           osInfo.Hostname,
		OSInformation:  osInfo,
		MACAddress:     utils.GetMACAddress(),
	}

	jsonData, _ := json.Marshal(inputData)
	data, err := encryption.EncryptAes(env, jsonData)
	if err != nil {
		return nil, err
	}

	packet := (&packets.DataPacket{
		AesData: data,
	}).Encode()

	return nil, WriteWithLength(conn, packet)
}

func SendHeartbeat(conn *net.Conn, env *config.Environment, _ interface{}) (interface{}, error) {
	type Heartbeat struct {
		OpCode        packets.InnerMessageOpCode `json:"op_code"`
		OSInformation goInfo.GoInfoObject        `json:"os_information"`
		MACAddress    string                     `json:"mac_address"`
	}

	osInfo := utils.GetOSInfo()

	inputData := Heartbeat{
		OpCode:        packets.OpCodeHeartbeat,
		OSInformation: osInfo,
		MACAddress:    utils.GetMACAddress(),
	}

	jsonData, _ := json.Marshal(inputData)
	data, err := encryption.EncryptAes(env, jsonData)
	if err != nil {
		return nil, err
	}

	packet := (&packets.DataPacket{
		AesData: data,
	}).Encode()

	return nil, WriteWithLength(conn, packet)
}

func RecieveData(conn *net.Conn, env *config.Environment, _ interface{}) (interface{}, error) {
	length := make([]byte, 4)
	_, err := io.ReadFull(*conn, length)
	if err != nil {
		return nil, fmt.Errorf("err while reading data length: %w", err)
	}

	data := make([]byte, binary.BigEndian.Uint32(length))
	_, err = io.ReadFull(*conn, data)
	if err != nil {
		return nil, fmt.Errorf("err while reading data: %w", err)
	}

	decodedData, err := packets.Decode(data)
	if err != nil {
		return nil, fmt.Errorf("err while decoding data: %w", err)
	}

	dataPacket, ok := decodedData.(*packets.DataPacket)

	if !ok {
		return nil, errors.New("expected packet was not a datapacket")
	}

	decryptedData, err := encryption.DecryptAes(env, dataPacket.AesData)
	if err != nil {
		return nil, fmt.Errorf("err while decrypting data: %w", err)
	}

	return decryptedData, nil
}
