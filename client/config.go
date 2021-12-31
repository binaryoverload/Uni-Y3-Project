package main

import (
	"encoding/json"
	"log"
	"os"
	"sync"
)

type Config struct {
	ServerPublicKey		[]byte	`json:"server_public_key"`
	ClientPrivateKey	[]byte	`json:"client_private_key"`
	Test				string	`json:"test"`
}

var instance_lock = &sync.Mutex{}
var instance *Config

func getConfigInstance() Config {
	instance_lock.Lock()
	defer instance_lock.Unlock()

	if instance == nil {
		loadedConfig := loadConfig()
		instance = &loadedConfig
	}
	return *instance
}

func loadConfig() Config {
	var config Config

	file, err := os.Open("client_settings.json")
	if err != nil {
		log.Fatalln("Could not open settings file!", err)
	}
	jsonDecoder := json.NewDecoder(file)
	err = jsonDecoder.Decode(&config)
	if err != nil {
		log.Fatalln("Could not decode JSON!", err)
	}
	return config
}