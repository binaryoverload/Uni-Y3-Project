package utils

import (
	"github.com/withmandala/go-log"
	"os"
)

var instance *log.Logger

func GetLogger(debugLogging bool) *log.Logger {

	if instance == nil {
		instance = log.New(os.Stdout).WithColor()
		if debugLogging {
			instance = instance.WithDebug()
		}

		instance.Infof("debug logging enabled: %t", instance.IsDebug())
	}

	return instance
}
