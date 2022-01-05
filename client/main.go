package main

import (
	config "client/config"
	"client/encryption"
	"crypto/elliptic"
	"crypto/rand"
	"log"
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

	println(encryption.CalculateSharedSecret(conf.ServerPublicKey))
}
