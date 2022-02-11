package policies

import (
	"client/utils"
	"encoding/json"
	"github.com/google/uuid"
	"os"
	"sync"
	"time"
)

type Policy struct {
	Id          uuid.UUID    `json:"id"`
	Name        string       `json:"name"`
	PolicyType  string       `json:"type"`
	LastUpdated time.Time    `json:"updated_at"`
	PolicyItems []PolicyItem `json:"policy_items"`
}

type PolicyItem struct {
	Id          uuid.UUID   `json:"id"`
	Order       int         `json:"policy_order"`
	Type        string      `json:"type"`
	StopOnError bool        `json:"stop_on_error"`
	Data        interface{} `json:"data"`
}

type PolicyStorage struct {
	Policies map[string]Policy
}

var storageLock = &sync.Mutex{}
var policyStorage *PolicyStorage

const policyStorageFilename = "policy_storage.json"

func GetPolicyStorage() *PolicyStorage {
	storageLock.Lock()
	defer storageLock.Unlock()

	if policyStorage == nil {
		loadedStorage, existing := loadPolicyStorage()
		policyStorage = &loadedStorage
		if !existing {
			SavePolicyStorage()
		}
	}

	return policyStorage
}

func loadPolicyStorage() (PolicyStorage, bool) {
	policies := make(map[string]Policy)

	logger := utils.GetLogger()

	file, err := os.OpenFile(policyStorageFilename, os.O_CREATE|os.O_RDONLY, 660)
	if err != nil {
		logger.Fatal("Could not open settings file to load!", err)
	}

	fileInfo, err := file.Stat()
	if err != nil {
		logger.Fatal("Could not stat settings file", err)
	}

	if fileInfo.Size() == 0 {
		return PolicyStorage{
			Policies: policies,
		}, false
	}

	jsonDecoder := json.NewDecoder(file)
	err = jsonDecoder.Decode(&policies)
	if err != nil {
		logger.Fatal("Could not decode JSON!", err)
	}

	return PolicyStorage{
		Policies: policies,
	}, true
}

func SavePolicyStorage() {
	logger := utils.GetLogger()
	file, err := os.OpenFile(policyStorageFilename, os.O_CREATE|os.O_WRONLY, 660)
	if err != nil {
		logger.Error("Could not open settings file to save!", err)
	}

	jsonEncoder := json.NewEncoder(file)
	jsonEncoder.SetIndent("", "  ")
	err = jsonEncoder.Encode(policyStorage.Policies)
	if err != nil {
		logger.Error("Could not encode JSON!", err)
	}
}
