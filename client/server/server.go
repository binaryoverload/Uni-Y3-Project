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

func RunTcpActions(actions []TcpAction) error {
	conf := config.GetConfigInstance()
	c, err := net.Dial("tcp", fmt.Sprintf("%s:%d", conf.ServerHost, conf.ServerPort))
	if err != nil {
		return err
	}
	var currentData interface{} = nil
	for i := 0; i < len(actions); i++ {
		err := c.SetDeadline(time.Now().Add(15 * time.Second))
		if err != nil {
			return err
		}
		currentData, err = actions[i](&c, currentData)
		if err != nil {
			return err
		}
	}
	err = c.Close()
	return err
}

func WriteWithLength(conn *net.Conn, data []byte) error {
	length := make([]byte, 4)
	binary.BigEndian.PutUint32(length, uint32(len(data)))

	connection := *conn
	_, err := connection.Write(length)
	if err != nil {
		return err
	}
	_, err = connection.Write(data)
	return err
}