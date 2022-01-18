package main

import (
	config "client/config"
	"client/encryption"
	"client/server"
	"crypto/elliptic"
	"crypto/rand"
	"encoding/hex"
	"log"
)

func main() {
	conf := config.GetConfigInstance()

	configInitValidation(conf)

	if !conf.ClientId.Valid {
		_, err := server.RunTcpActions([]server.TcpAction{server.SendHello, server.RecieveHelloAck, server.SendClientRegistration, server.RecieveData})
		if err != nil {
			log.Println("Error in TCP: ", err.Error())
		}



	}

	log.Println(hex.EncodeToString(encryption.GetPublicKey()))



	//length := make([]byte, 4)
	//_, err := c.Read(length)
	//if err != nil {
	//	log.Fatalln("Could not read from TCP")
	//}
	//
	//data = make([]byte, binary.BigEndian.Uint32(length))
	//c.Read(data)
	//
	//helloAck, _ := packets.Decode(data)
	//
	//decryptedData := encryption.DecryptAes(encryption.CalculateSharedSecret(conf.ServerPublicKey), helloAck.(*packets.HelloAckPacket).AesData)
	//
	//fmt.Printf("%s", decryptedData)
	//
	//c.Close()

}

func configInitValidation(conf *config.Config) {
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

	if len(conf.ServerHost) == 0 {
		log.Fatalln("Server address is invalid! Please consult your administrator.")
	}
}