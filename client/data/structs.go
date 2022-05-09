package data

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/google/uuid"
)

type FilePolicy struct {
	FileId      uuid.UUID `json:"file_id"`
	Destination string    `json:"destination"`
	Permissions uint32    `json:"permissions"`
}

type CommandPolicy struct {
	Command          string            `json:"command"`
	Args             []string          `json:"args"`
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
