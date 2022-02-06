package utils

import (
	"client/config"
	"github.com/withmandala/go-log"
	"os"
)

var instance *log.Logger

func GetLogger() *log.Logger {
	debugLogging := config.GetConfigInstance().DebugLogging

	if instance == nil {
		instance = log.New(os.Stdout).WithColor()
		if debugLogging {
			instance = instance.WithDebug()
		}
	}

	return instance
}
