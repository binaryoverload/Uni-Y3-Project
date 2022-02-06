package policies

import (
	"client/utils"
	"errors"
	"os/exec"
	"strings"
)

var logger = utils.GetLogger()

func EvaluatePolicy(policy Policy) {
	function, ok := choosePolicyEvalFunction(policy)

	if !ok {
		logger.Errorf("could not determine policy type to evaluate. got: %s", policy.PolicyType)
		return
	}

	err := function(policy)

	if err != nil {
		logger.Errorf("error in evaluating policy with id %s: %s", policy.Id, err)
		return
	}
}

func choosePolicyEvalFunction(policy Policy) (func(policy Policy) error, bool) {
	switch policy.Data.(type) {
	case CommandPolicy:
		if policy.PolicyType != "command" {
			return nil, false
		}
		return evalCommandPolicy, true
	case FilePolicy:
		if policy.PolicyType != "file" {
			return nil, false
		}
		return evalFilePolicy, true
	case PackagePolicy:
		if policy.PolicyType != "package" {
			return nil, false
		}
		return evalPackagePolicy, true
	}
	return nil, false
}

func evalFilePolicy(policy Policy) error {

	return nil
}

func evalPackagePolicy(policy Policy) error {
	packagePolicy, ok := policy.Data.(PackagePolicy)
	if !ok {
		return errors.New("policy data was not expected package type")
	}

	if !utils.IsRoot() {
		return errors.New("package management requires the client should be running as root")
	}

	commandArgs := []string{"-y", packagePolicy.Action.Command()}
	commandArgs = append(commandArgs, packagePolicy.Packages...)

	cmd := exec.Command("/usr/bin/apt-get", commandArgs...)
	fullCommand := strings.Join(cmd.Args, " ")

	err := cmd.Run()

	if err != nil {
		exitError, isExitError := err.(*exec.ExitError)
		if isExitError {
			logger.Errorf("command \"%s\" for policy %s failed with exit code %d: %s", fullCommand, policy.Id, exitError.ExitCode(), exitError.Error())
			return nil
		}
		return err
	}

	logger.Debugf("command \"%s\" for policy %s completed with exit code 0", fullCommand, policy.Id)
	return nil
}

func evalCommandPolicy(policy Policy) error {
	commandPolicy, ok := policy.Data.(CommandPolicy)
	if !ok {
		return errors.New("policy data was not expected command type")
	}

	cmd := exec.Command(commandPolicy.Command, commandPolicy.Args...)
	cmd.Dir = commandPolicy.WorkingDirectory
	cmd.Env = commandPolicy.GetProcessEnv()

	err := cmd.Run()

	if err != nil {
		exitError, isExitError := err.(*exec.ExitError)
		if isExitError {
			logger.Errorf("command \"%s\" for policy %s failed with exit code %d: %s", commandPolicy.Command, policy.Id, exitError.ExitCode(), exitError.Error())
			return nil
		}
		return err
	}

	logger.Debugf("command \"%s\" for policy %s completed with exit code 0", commandPolicy.Command, policy.Id)
	return nil
}
