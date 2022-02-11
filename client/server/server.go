package server

import (
	"client/config"
	"encoding/binary"
	"fmt"
	"net"
	"time"
)

var conf = config.GetConfigInstance()

type TcpAction func(conn *net.Conn, prevData interface{}) (interface{}, error)

func RunTcpActions(actions []TcpAction) (interface{}, error) {
	conf := config.GetConfigInstance()
	c, err := net.Dial("tcp", fmt.Sprintf("%s:%d", conf.ServerHost, conf.ServerPort))
	if err != nil {
		return nil, fmt.Errorf("connecting: %w", err)
	}
	var currentData interface{} = nil
	for i := 0; i < len(actions); i++ {
		err := c.SetDeadline(time.Now().Add(15 * time.Second))
		if err != nil {
			return nil, fmt.Errorf("setting tcp ttl: %w", err)
		}
		currentData, err = actions[i](&c, currentData)
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
