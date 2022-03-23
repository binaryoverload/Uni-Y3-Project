package policies

import (
	"client/data"
	"client/packets"
	"client/server"
	"client/utils"
	"encoding/json"
	"errors"
	"fmt"
	"os/exec"
	"sort"
	"strings"
)

var logger = utils.GetLogger()

func EvaluatePolicy(policy data.Policy) {
	logger.Debugf("(p_id: %s): begin eval", policy.Id)

	policyItems := make([]data.PolicyItem, len(policy.PolicyItems))
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

	polStore := data.GetPolicyStorage()
	polStore.Policies[policy.Id.String()] = policy
	data.SavePolicyStorage()
}

func ChoosePolicyEvalFunction(policyItem data.PolicyItem) (func(policyItem data.PolicyItem) error, bool) {
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

func evalFilePolicy(policyItem data.PolicyItem) error {
	filePolicy, ok := policyItem.Data.(data.FilePolicy)
	if !ok {
		return errors.New("policy data was not expected package type")
	}

	if !utils.IsRoot() {
		return errors.New("copying files requires the client should be running as root")
	}

	tcpData, err := server.RunTcpActions([]server.TcpAction{server.SendHello, server.RecieveHelloAck, server.SendFileInfoReq(packets.FileInfoReq{FileId: filePolicy.FileId}), server.RecieveData})

	if err != nil {
		return fmt.Errorf("(pi_id: %s, f: %s) failed to request file info: %w", policyItem.Id, filePolicy.FileId, err)
	}

	dataBytes, ok := tcpData.([]byte)
	if !ok {
		return fmt.Errorf("(pi_id: %s, f: %s) data response is not byte array", policyItem.Id, filePolicy.FileId)
	}

	var dataResponse packets.FileInfoRes
	err = json.Unmarshal(dataBytes, &dataResponse)
	if err != nil {
		return fmt.Errorf("(pi_id: %s, f: %s) could not convert response from json: %w", policyItem.Id, filePolicy.FileId, err)
	}

	err = server.RequestFileChunks(dataResponse.FileId, dataResponse.NumChunks)
	if err != nil {
		return err
	}

	err = server.CombineFileChunks(dataResponse.FileId, dataResponse.Hash, dataResponse.NumChunks, dataResponse.TotalSize)
	if err != nil {
		return err
	}

	err = server.MoveCombinedFile(dataResponse.FileId, dataResponse.TotalSize, filePolicy)
	if err != nil {
		return fmt.Errorf("(pi_id: %s, f: %s) error moving combined file: %w", policyItem.Id, dataResponse.FileId, err)
	}

	server.ChunkDownloadCleanup(dataResponse.FileId, dataResponse.NumChunks)

	return nil
}

func evalPackagePolicy(policyItem data.PolicyItem) error {
	packagePolicy, ok := policyItem.Data.(data.PackagePolicy)
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

func evalCommandPolicy(policyItem data.PolicyItem) error {
	commandPolicy, ok := policyItem.Data.(data.CommandPolicy)
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
