package utils

import (
	"github.com/withmandala/go-log"
	"os"
)

var instance *log.Logger

func GetLogger() *log.Logger {
	if instance == nil {
		instance = log.New(os.Stdout).WithColor()
	}

	return instance
}