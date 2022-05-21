package config

import (
	"encoding/json"
	"os"

	"github.com/google/uuid"
	"github.com/withmandala/go-log"
)

type Config struct {
	filePath         string
	ServerPublicKey  HexEncodedByteArray `json:"server_public_key"`
	ClientPrivateKey HexEncodedByteArray `json:"client_private_key"`
	ClientId         uuid.NullUUID       `json:"client_id"`
	ServerHost       string              `json:"server_host"`
	ServerPort       int                 `json:"server_port"`
	EnrolmentToken   string              `json:"enrolment_token"`
	DebugLogging     bool                `json:"debug_logging"`
	TempDownloadPath string              `json:"temp_download_path"`
}

var configLogger = log.New(os.Stdout).WithColor()

func CreateConfig(path string) Config {
	newConfig := Config{
		filePath:         path,
		ServerHost:       "localhost",
		ServerPort:       9000,
		DebugLogging:     false,
		TempDownloadPath: "/tmp",
	}
	loadConfigFile(path, &newConfig)
	return newConfig
}

func loadConfigFile(path string, config *Config) {
	file, err := os.OpenFile(path, os.O_CREATE|os.O_RDONLY, 660)
	if err != nil {
		configLogger.Fatal("Could not open settings file to load!", err)
	}

	fileInfo, err := file.Stat()
	if err != nil {
		configLogger.Fatal("Could not stat settings file", err)
	}

	if fileInfo.Size() == 0 {
		return
	}

	jsonDecoder := json.NewDecoder(file)
	err = jsonDecoder.Decode(config)
	if err != nil {
		configLogger.Fatal("Could not decode JSON!", err)
	}

	return
}

func (c Config) SaveConfig() {
	file, err := os.OpenFile(c.filePath, os.O_CREATE|os.O_WRONLY, 660)
	if err != nil {
		configLogger.Error("Could not open settings file to save!", err)
	}

	jsonEncoder := json.NewEncoder(file)
	jsonEncoder.SetIndent("", "  ")
	err = jsonEncoder.Encode(c)
	if err != nil {
		configLogger.Error("Could not encode JSON!", err)
	}
}
