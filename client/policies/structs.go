package policies

import (
	"encoding/json"
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

type PackagePolicy struct {
	Packages []string `json:"packages"`
}
