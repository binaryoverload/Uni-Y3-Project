package policies

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"strings"
)

type FilePolicy struct {
	FileId      uuid.UUID `json:"file_id"`
	Destination string    `json:"destination"`
	Permissions int       `json:"permissions"`
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

func structFromPolicyItem(policyItem map[string]interface{}) (interface{}, error) {
	policyItemJson, err := json.Marshal(policyItem)
	if err != nil {
		return nil, fmt.Errorf("could not decode policy item type %s: %w", policyItem["type"], err)
	}

	switch policyItem["type"] {
	case "command":
		commandPolicy := CommandPolicy{}
		err := json.Unmarshal(policyItemJson, &commandPolicy)
		return commandPolicy, err
	case "package":
		packagePolicy := PackagePolicy{}
		err := json.Unmarshal(policyItemJson, &packagePolicy)
		return packagePolicy, err
	case "file":
		filePolicy := FilePolicy{}
		err := json.Unmarshal(policyItemJson, &filePolicy)
		return filePolicy, err
	}

	return nil, fmt.Errorf("could not find policy item type %s", policyItem["type"])
}
