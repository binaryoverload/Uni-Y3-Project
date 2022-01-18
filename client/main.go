package main

import (
	config "client/config"
	"client/encryption"
	"client/server"
	"client/utils"
	"crypto/elliptic"
	"crypto/rand"
	"github.com/google/uuid"
	"log"
)

var logger = utils.GetLogger()

func main() {
	conf := config.GetConfigInstance()

	configInitValidation(conf)

	if !conf.ClientId.Valid {
		data, err := server.RunTcpActions([]server.TcpAction{server.SendHello, server.RecieveHelloAck, server.SendClientRegistration, server.RecieveData})
		if err != nil {
			logger.Fatal("Error in attempting to register client:", err.Error())
		}

		jsonData, ok := data.(map[string]interface{})

		if !ok {
			logger.Fatal("Did not receive response from client registration")
		}

		if jsonData["op_code"].(float64) == 100 {
			logger.Fatal("Could not register client. Error:", jsonData["message"])
		}

		if jsonData["op_code"].(float64) == 2 {
			clientId, err := uuid.Parse(jsonData["client_id"].(string))
			if err != nil {
				log.Fatalln(err)
			}
			conf.ClientId = uuid.NullUUID{
				UUID:  clientId,
				Valid: true,
			}
			conf.SaveConfig()
			logger.Info("Registered client! ID:", jsonData["client_id"])
		} else {
			logger.Fatal("Unexpected response from registering client")
		}
	}

	logger.Infof("Client public key: %x", encryption.GetPublicKey())



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
		logger.Fatal("Server Public Key is invalid! Please consult your administrator.")
	}

	if len(conf.ServerHost) == 0 {
		logger.Fatal("Server address is invalid! Please consult your administrator.")
	}

	if len(conf.EnrolmentToken) == 0 {
		logger.Fatal("Enrolment token is invalid! Please consult your administrator.")
	}
}