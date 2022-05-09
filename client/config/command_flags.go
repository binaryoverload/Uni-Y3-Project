package config

import "flag"

type CommandLineFlags struct {
	ConfigFilePath        string
	PolicyStorageFilePath string
}

func ParseCommandLineFlags() CommandLineFlags {
	cmdLineFlags := CommandLineFlags{}

	flag.StringVar(&cmdLineFlags.ConfigFilePath, "config", "client_settings.json", "The JSON config file to load")
	flag.StringVar(&cmdLineFlags.PolicyStorageFilePath, "policy-storage", "policy_storage.json", "The JSON file to store policy information in")

	flag.Parse()

	return cmdLineFlags
}
