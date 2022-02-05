package policies

import (
	"encoding/json"
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
	Command          string      `json:"command"`
	Args             CommandArgs `json:"args"`
	WorkingDirectory string      `json:"working_directory"`
}

type PackagePolicy struct {
	Packages []string `json:"packages"`
}
