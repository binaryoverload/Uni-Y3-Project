package policies

import (
	"client/utils"
	"errors"
	"os/exec"
	"sort"
	"strings"
)

var logger = utils.GetLogger()

func (policy Policy) EvaluatePolicy() {
	logger.Debugf("(p_id: %s): begin eval", policy.Id)

	policyItems := make([]PolicyItem, len(policy.PolicyItems))
	copy(policyItems, policy.PolicyItems)
	sort.Slice(policyItems, func(i, j int) bool {
		return policyItems[i].Order < policyItems[j].Order
	})

	for index, policyItem := range policyItems {
		logger.Debugf("(p_id: %s, pi_id: %s, #: %d): begin eval ", policy.Id, policyItem.Id, index)

		function, ok := choosePolicyEvalFunction(policyItem)

		if !ok {
			logger.Errorf("could not determine policy type to evaluate. got: %s", policyItem.Type)
			return
		}

		err := policyItem.ParseData()
		if err != nil {
			logger.Errorf("(pi_id: %s, #: %d): policy item decode failed: %s", policyItem.Id, index, err)
			return
		}

		err = function(policyItem)

		if err != nil {
			logger.Errorf("(pi_id: %s, #: %d): policy item eval failed: %s", policyItem.Id, index, err)
			if policyItem.StopOnError {
				logger.Errorf("(pi_id: %s, #: %d): policy item has stop on failed, stopping", policyItem.Id, index)
				return
			}
		} else {
			logger.Infof("(pi_id: %s, #: %d): policy item eval successed ", policyItem.Id, index)
		}
	}

	polStore := GetPolicyStorage()
	polStore.Policies[policy.Id.String()] = policy
	SavePolicyStorage()
}

func choosePolicyEvalFunction(policyItem PolicyItem) (func(policyItem PolicyItem) error, bool) {
	switch policyItem.Type {
	case "command":
		return evalCommandPolicy, true
	case "package":
		return evalPackagePolicy, true
	case "file":
		return evalFilePolicy, true
	default:
		logger.Errorf("could not find policy item type %s", policyItem.Type)
		return nil, false
	}
}

func evalFilePolicy(policyItem PolicyItem) error {

	return nil
}

func evalPackagePolicy(policyItem PolicyItem) error {
	packagePolicy, ok := policyItem.Data.(PackagePolicy)
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
			logger.Errorf("(pi_id: %s): command \"%s\" failed with exit code %d: %s", policyItem.Id, fullCommand, exitError.ExitCode(), exitError.Error())
			return nil
		}
		return err
	}

	logger.Debugf("(pi_id: %s): command \"%s\" completed with exit code 0", policyItem.Id, fullCommand)
	return nil
}

func evalCommandPolicy(policyItem PolicyItem) error {
	commandPolicy, ok := policyItem.Data.(CommandPolicy)
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
			logger.Errorf("(pi_id: %s): command \"%s\"  failed with exit code %d: %s", policyItem.Id, commandPolicy.Command, exitError.ExitCode(), exitError.Error())
			return nil
		}
		return err
	}

	logger.Debugf("(pi_id: %s): command \"%s\" completed with exit code 0", policyItem.Id, commandPolicy.Command)
	return nil
}
