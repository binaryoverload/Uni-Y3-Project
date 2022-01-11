package config

import (
	"encoding/json"
	"github.com/google/uuid"
	"log"
	"os"
	"sync"
)

type Config struct {
	ServerPublicKey  HexEncodedByteArray `json:"server_public_key"`
	ClientPrivateKey HexEncodedByteArray `json:"client_private_key"`
	ClientId uuid.NullUUID `json:"client_id"`
	ServerHost string `json:"server_host"`
	ServerPort int `json:"server_port"`
}

var instanceLock = &sync.Mutex{}
var instance *Config

func GetConfigInstance() *Config {
	instanceLock.Lock()
	defer instanceLock.Unlock()

	if instance == nil {
		loadedConfig := loadConfig()
		instance = &loadedConfig
	}
	return instance
}

func loadConfig() Config {
	var config Config

	file, err := os.OpenFile("client_settings.json", os.O_CREATE | os.O_RDONLY, 660)
	if err != nil {
		log.Fatalln("Could not open settings file to load!", err)
	}

	fileInfo, err := file.Stat()
	if err != nil {
		log.Fatalln("Could not stat settings file", err)
	}

	if fileInfo.Size() == 0 {
		return config
	}

	jsonDecoder := json.NewDecoder(file)
	err = jsonDecoder.Decode(&config)
	if err != nil {
		log.Fatalln("Could not decode JSON!", err)
	}

	if config.ServerPort == 0 {
		config.ServerPort = 9000
	}

	return config
}

func (c Config) SaveConfig() {
	file, err := os.OpenFile("client_settings.json", os.O_CREATE | os.O_WRONLY, 660)
	if err != nil {
		log.Fatalln("Could not open settings file to save!", err)
	}

	jsonEncoder := json.NewEncoder(file)
	jsonEncoder.SetIndent("", "  ")
	err = jsonEncoder.Encode(c)
	if err != nil {
		log.Println("Could not encode JSON!", err)
	}
}