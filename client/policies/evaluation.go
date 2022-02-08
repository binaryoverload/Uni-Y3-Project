package policies

import (
	"client/utils"
	"errors"
	"os/exec"
	"strings"
)

var logger = utils.GetLogger()

func EvaluatePolicy(policy Policy) {
	for _, policyItem := range policy.PolicyItems {

		function, ok := choosePolicyEvalFunction(policyItem)

		if !ok {
			logger.Errorf("could not determine policy type to evaluate. got: %s", policy.PolicyType)
			return
		}

		policyItemStruct, ok := structFromPolicyItem(policyItem)
		if !ok {
			return
		}

		err := function(policy, policyItemStruct)

		if err != nil {
			logger.Errorf("error in evaluating policy with id %s: %s", policy.Id, err)
			return
		}
	}

}

func structFromPolicyItem(policyItem map[string]interface{}) (interface{}, bool) {
	var data interface{}
	switch policyItem["type"] {
	case "command":
		data = CommandPolicy{
			Command:          policyItem["command"].(string),
			Args:             strings.Split(policyItem["args"].(string), " "),
			WorkingDirectory: policyItem["working_directory"].(string),
			Env:              policyItem["working_directory"].(map[string]string),
		}
	case "package":
		var action PackageAction
		switch policyItem["action"] {
		case "install":
			action = Install
		case "uninstall":
			action = Uninstall
		}
		data = PackagePolicy{
			Packages: strings.Split(policyItem["packages"].(string), " "),
			Action:   action,
		}
	case "file":
		data = FilePolicy{}
	default:
		logger.Errorf("could not find policy item type %s", policyItem["type"])
		return nil, false
	}
	return data, true
}

func choosePolicyEvalFunction(policyItem map[string]interface{}) (func(policy Policy, policyItem interface{}) error, bool) {
	switch policyItem["type"] {
	case "command":
		return evalCommandPolicy, true
	case "package":
		return evalPackagePolicy, true
	case "file":
		return evalFilePolicy, true
	default:
		logger.Errorf("could not find policy item type %s", policyItem["type"])
		return nil, false
	}
}

func evalFilePolicy(policy Policy, policyItem interface{}) error {

	return nil
}

func evalPackagePolicy(policy Policy, policyItem interface{}) error {
	packagePolicy, ok := policyItem.(PackagePolicy)
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

func evalCommandPolicy(policy Policy, policyItem interface{}) error {
	commandPolicy, ok := policyItem.(CommandPolicy)
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
