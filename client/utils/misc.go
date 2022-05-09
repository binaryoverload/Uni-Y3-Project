package utils

import (
	"github.com/withmandala/go-log"
	"os/user"
)

func IsRoot(logger *log.Logger) bool {
	currentUser, err := user.Current()
	if err != nil {
		logger.Fatalf("[isRoot] Unable to get current user: %s", err)
	}
	return currentUser.Username == "root"
}
