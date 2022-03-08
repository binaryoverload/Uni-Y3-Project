package policies

import (
	"client/utils"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"sort"
	"strings"
)

var logger = utils.GetLogger()

type FilePolicy struct {
	FileId      uuid.UUID `json:"file_id"`
	Destination string    `json:"destination"`
	Permissions uint32    `json:"permissions"`
}

type CommandArgs []string

func (args CommandArgs) MarshalJSON() ([]byte, error) {
	joinedString := strings.Join(args, " ")
	return json.Marshal(joinedString)
}

func (args *CommandArgs) UnmarshalJSON(data []byte) (err error) {
	convertedString := string(data)
	*args = strings.Split(convertedString, " ")
	return nil
}

type CommandPolicy struct {
	Command          string            `json:"command"`
	Args             CommandArgs       `json:"args"`
	WorkingDirectory string            `json:"working_directory"`
	Env              map[string]string `json:"env"`
}

func (p CommandPolicy) GetProcessEnv() []string {
	if p.Env == nil {
		return make([]string, 0)
	}

	output := make([]string, len(p.Env))
	i := 0
	for key, value := range p.Env {
		output[i] = fmt.Sprintf("%s=%s", key, value)
		i++
	}
	return output
}

type PackageAction int64

const (
	Install   PackageAction = 0
	Uninstall               = 1
)

func (action PackageAction) MarshalJSON() ([]byte, error) {
	actionString := action.String()
	if actionString == "" {
		return nil, errors.New("illegal package action")
	}
	return json.Marshal(actionString)
}

func (action *PackageAction) UnmarshalJSON(data []byte) error {
	var convertedString string
	err := json.Unmarshal(data, &convertedString)
	if err != nil {
		return fmt.Errorf("error unmarshalling packageaction: %w", err)
	}
	switch convertedString {
	case "install":
		*action = Install
		return nil
	case "uninstall":
		*action = Uninstall
		return nil
	}
	return errors.New("illegal package action")
}

func (action PackageAction) String() string {
	switch action {
	case Install:
		return "install"
	case Uninstall:
		return "uninstall"
	default:
		return ""
	}
}

func (action PackageAction) Command() string {
	switch action {
	case Install:
		return "install"
	case Uninstall:
		return "remove"
	default:
		return ""
	}
}

type PackagePolicy struct {
	Packages []string      `json:"packages"`
	Action   PackageAction `json:"action"`
}

func (policyItem *PolicyItem) ParseData() error {
	policyItemDataJson, err := json.Marshal(policyItem.Data)
	if err != nil {
		return fmt.Errorf("could not decode policy item type %s: %w", policyItem.Type, err)
	}

	switch policyItem.Type {
	case "command":
		commandPolicy := CommandPolicy{}
		err := json.Unmarshal(policyItemDataJson, &commandPolicy)
		policyItem.Data = commandPolicy
		return err
	case "package":
		packagePolicy := PackagePolicy{}
		err := json.Unmarshal(policyItemDataJson, &packagePolicy)
		policyItem.Data = packagePolicy
		return err
	case "file":
		filePolicy := FilePolicy{}
		err := json.Unmarshal(policyItemDataJson, &filePolicy)
		policyItem.Data = filePolicy
		return err
	}

	return fmt.Errorf("could not find policy item type %s", policyItem.Type)
}

func (policy Policy) EvaluatePolicy() {
	logger.Debugf("(p_id: %s): begin eval", policy.Id)

	policyItems := make([]PolicyItem, len(policy.PolicyItems))
	copy(policyItems, policy.PolicyItems)
	sort.Slice(policyItems, func(i, j int) bool {
		return policyItems[i].Order < policyItems[j].Order
	})

	for index, policyItem := range policyItems {
		logger.Debugf("(p_id: %s, pi_id: %s, #: %d): begin eval ", policy.Id, policyItem.Id, index)

		function, ok := ChoosePolicyEvalFunction(policyItem)

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
