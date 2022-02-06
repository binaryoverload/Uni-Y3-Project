package policies

import "client/utils"

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

	return nil
}

func evalCommandPolicy(policy Policy) error {

	return nil
}
