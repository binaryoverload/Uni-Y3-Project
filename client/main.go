package main

import (
	config "client/config"
	"client/encryption"
	"client/packets"
	"crypto/elliptic"
	"crypto/rand"
	"encoding/binary"
	"log"
	"net"
)

func main() {
	conf := config.GetConfigInstance()

	if len(conf.ClientPrivateKey) == 0 {
		privateKey, _, _, err := elliptic.GenerateKey(elliptic.P256(), rand.Reader)
		if err != nil {
			return
		}
		conf.ClientPrivateKey = privateKey
		conf.SaveConfig()
	}

	if len(conf.ServerPublicKey) != 33 {
		log.Fatalln("Server Public Key is invalid! Please consult your administrator.")
	}

	data := encryption.EncryptAes(encryption.CalculateSharedSecret(conf.ServerPublicKey), []byte("{}"))

	packet := packets.EncodeHello(packets.HelloPacket{
		PublicKey: encryption.GetPublicKey(),
		AesData:   data,
	})

	c, _ := net.Dial("tcp", "localhost:9000")

	length := make([]byte, 4)
	binary.BigEndian.PutUint32(length, uint32(len(packet)))

	c.Write(length)
	c.Write(packet)

	c.Close()

}
