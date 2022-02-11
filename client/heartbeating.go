package main

import (
	"client/config"
	"client/packets"
	"client/policies"
	"client/server"
	"context"
	"encoding/json"
	"fmt"
	"github.com/tevino/abool/v2"
	"time"
)

var lastBackoff = -1
var numberErrors = 0
var backoffUntil time.Time
var PauseHeartbeat = abool.New()

func getCurrentBackoff() time.Duration {
	minIndex := len(getBackoffs()) - 1
	if lastBackoff < minIndex {
		lastBackoff++
		minIndex = lastBackoff
	}

	return getBackoffs()[minIndex]
}

func getBackoffs() []time.Duration {
	return []time.Duration{
		time.Minute * 5,
		time.Minute * 10,
		time.Minute * 30,
		time.Hour,
	}
}

type HeartbeatAck struct {
	OpCode   packets.InnerMessageOpCode `json:"op_code"`
	Policies []policies.Policy          `json:"policies"`
	Message  string                     `json:"message"`
}

func heartbeat(ctx context.Context) {
	if PauseHeartbeat.IsSet() {
		logger.Debug("heartbeat paused. not sending")
		return
	}

	logger.Info("sending heartbeat...")
	PauseHeartbeat.Set()
	defer func() { PauseHeartbeat.UnSet() }()

	if !backoffUntil.IsZero() {

		if !(time.Until(backoffUntil) <= 0) {
			logger.Info(fmt.Sprintf("heartback backoff active for %s", time.Until(backoffUntil).Round(time.Second)))
			return
		}

		backoffUntil = time.Time{}
	}

	data, err := server.RunTcpActions([]server.TcpAction{server.SendHello, server.RecieveHelloAck, server.SendHeartbeat, server.RecieveData})

	if err != nil {
		logger.Error("error in attempting to send heartbeat:", err.Error())
		numberErrors++

		if numberErrors >= 3 {
			backoffDuration := getCurrentBackoff()
			backoffUntil = time.Now().Add(backoffDuration)
			logger.Info(fmt.Sprintf("heartbeat failed 3 times. backing off for %s", backoffDuration))
		}

		return
	}

	numberErrors = 0

	var heartbeatAck HeartbeatAck

	byteData, ok := data.([]byte)

	if !ok {
		logger.Error("did not receive response from heartbeat")
		return
	}

	err = json.Unmarshal(byteData, &heartbeatAck)
	if err != nil {
		logger.Error("error unmarshalling heartbeat: %s", err)
		return
	}

	if heartbeatAck.OpCode == packets.OpCodeError {
		logger.Error("could not heartbeat. error:", heartbeatAck.Message)
		return
	}

	if heartbeatAck.OpCode == packets.OpCodeInvalidClient {
		logger.Warn("client marked as invalid. attempting to register...")
		registerClient(config.GetConfigInstance())
		return
	}

	if heartbeatAck.OpCode == packets.OpCodeHeartbeatAck {
		logger.Info("heartbeat acknowledged")

		if heartbeatAck.Policies != nil {
			logger.Debugf("received %d policies", len(heartbeatAck.Policies))

			polStore := policies.GetPolicyStorage()

			for _, policy := range heartbeatAck.Policies {
				if storedPolicy, ok := polStore.Policies[policy.Id.String()]; ok {
					logger.Debugf("(p_id: %s): Stored policy found", policy.Id)
					if policy.LastUpdated.After(storedPolicy.LastUpdated) {
						logger.Debugf("(p_id: %s): Stored policy is out of date, evaluating...", policy.Id)
					} else {
						logger.Debugf("(p_id: %s): Stored policy is latest version, skipping policy", policy.Id)
						continue
					}
				}

				policy.EvaluatePolicy()
			}
		}

	} else {
		logger.Error("unexpected response from heartbeat. opcode:", heartbeatAck.OpCode)
	}

}
