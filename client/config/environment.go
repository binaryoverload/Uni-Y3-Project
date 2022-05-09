package config

import (
	"client/utils"
	"github.com/withmandala/go-log"
)

type Environment struct {
	Config
	CommandLineFlags
	Logger *log.Logger
}

func CreateEnvironment() Environment {
	cmdFlags := ParseCommandLineFlags()
	config := CreateConfig(cmdFlags.ConfigFilePath)

	env := Environment{
		Config:           config,
		CommandLineFlags: cmdFlags,
	}

	env.Logger = utils.GetLogger(env.DebugLogging)

	return env
}
