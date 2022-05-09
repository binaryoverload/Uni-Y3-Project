package server

import (
	"client/config"
	"client/encryption"
	"client/packets"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"net"
	"time"
)

type TcpAction func(conn *net.Conn, env *config.Environment, prevData interface{}) (interface{}, error)

func RunTcpActions(env *config.Environment, actions []TcpAction) (interface{}, error) {
	c, err := net.DialTimeout("tcp", fmt.Sprintf("%s:%d", env.ServerHost, env.ServerPort), 10*time.Second)
	if err != nil {
		return nil, fmt.Errorf("connecting: %w", err)
	}
	var currentData interface{} = nil
	for i := 0; i < len(actions); i++ {
		err := c.SetDeadline(time.Now().Add(10 * time.Second))
		if err != nil {
			return nil, fmt.Errorf("setting tcp ttl: %w", err)
		}
		currentData, err = actions[i](&c, env, currentData)
		if err != nil {
			return nil, err
		}
	}
	err = c.Close()
	if err != nil {
		return nil, fmt.Errorf("closing connection: %w", err)
	}
	return currentData, nil
}

func GetSendDataFunction(env *config.Environment, data interface{}) TcpAction {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil
	}

	return func(conn *net.Conn, env *config.Environment, _ interface{}) (interface{}, error) {
		data, err := encryption.EncryptAes(env, jsonData)
		if err != nil {
			return nil, err
		}

		packet := (&packets.DataPacket{
			AesData: data,
		}).Encode()

		return nil, WriteWithLength(conn, packet)
	}
}

func WriteWithLength(conn *net.Conn, data []byte) error {
	length := make([]byte, 4)
	binary.BigEndian.PutUint32(length, uint32(len(data)))

	connection := *conn
	_, err := connection.Write(length)
	if err != nil {
		return fmt.Errorf("writing data length: %w", err)
	}
	_, err = connection.Write(data)
	if err != nil {
		return fmt.Errorf("writing data: %w", err)
	}
	return nil
}
