package main

import (
	"client/config"
	"client/data"
	"client/packets"
	"client/policies"
	"client/server"
	"client/utils"
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
	index := utils.Min(lastBackoff+1, len(getBackoffs())-1)
	lastBackoff = index

	return getBackoffs()[index]
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
	Policies []data.Policy              `json:"policies"`
	Message  string                     `json:"message"`
}

func heartbeat(ctx context.Context, env *config.Environment) {
	if PauseHeartbeat.IsSet() {
		env.Logger.Debug("heartbeat paused. not sending")
		return
	}

	env.Logger.Info("sending heartbeat...")
	PauseHeartbeat.Set()
	defer func() { PauseHeartbeat.UnSet() }()

	if !backoffUntil.IsZero() {

		if !(time.Until(backoffUntil) <= 0) {
			env.Logger.Info(fmt.Sprintf("heartback backoff active for %s", time.Until(backoffUntil).Round(time.Second)))
			return
		}

		backoffUntil = time.Time{}
	}

	tcpData, err := server.RunTcpActions(env, []server.TcpAction{server.SendHello, server.RecieveHelloAck, server.SendHeartbeat, server.RecieveData})

	if err != nil {
		env.Logger.Error("error in attempting to send heartbeat:", err.Error())
		numberErrors++

		if numberErrors >= 3 {
			backoffDuration := getCurrentBackoff()
			backoffUntil = time.Now().Add(backoffDuration)
			env.Logger.Info(fmt.Sprintf("heartbeat failed 3 times. backing off for %s", backoffDuration))
		}

		return
	}

	numberErrors = 0

	var heartbeatAck HeartbeatAck

	byteData, ok := tcpData.([]byte)

	if !ok {
		env.Logger.Error("did not receive response from heartbeat")
		return
	}

	err = json.Unmarshal(byteData, &heartbeatAck)
	if err != nil {
		env.Logger.Error("error unmarshalling heartbeat: %s", err)
		return
	}

	if heartbeatAck.OpCode == packets.OpCodeError {
		env.Logger.Error("could not heartbeat. error:", heartbeatAck.Message)
		return
	}

	if heartbeatAck.OpCode == packets.OpCodeInvalidClient {
		env.Logger.Warn("client marked as invalid. attempting to register...")
		registerClient(env)
		return
	}

	if heartbeatAck.OpCode == packets.OpCodeHeartbeatAck {
		env.Logger.Info("heartbeat acknowledged")

		if heartbeatAck.Policies != nil {
			env.Logger.Debugf("received %d policies", len(heartbeatAck.Policies))

			polStore := data.GetPolicyStorage(env)

			for _, policy := range heartbeatAck.Policies {
				if storedPolicy, ok := polStore.Policies[policy.Id.String()]; ok {
					env.Logger.Debugf("(p_id: %s): Stored policy found", policy.Id)
					if policy.LastUpdated.After(storedPolicy.LastUpdated) {
						env.Logger.Debugf("(p_id: %s): Stored policy is out of date, evaluating...", policy.Id)
					} else {
						env.Logger.Debugf("(p_id: %s): Stored policy is latest version, skipping policy", policy.Id)
						continue
					}
				}

				policies.EvaluatePolicy(env, policy)
			}
		}

	} else {
		env.Logger.Error("unexpected response from heartbeat. opcode:", heartbeatAck.OpCode)
	}

}
