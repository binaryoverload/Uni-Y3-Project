package utils

import "os/user"

func IsRoot() bool {
	currentUser, err := user.Current()
	if err != nil {
		GetLogger().Fatalf("[isRoot] Unable to get current user: %s", err)
	}
	return currentUser.Username == "root"
}
