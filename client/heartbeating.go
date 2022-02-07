package main

import (
	"client/config"
	"client/packets"
	"client/server"
	"context"
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
	OpCode packets.InnerMessageOpCode
	Policies []Polic
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

	jsonData, ok := data.(map[string]interface{})

	if !ok {
		logger.Error("did not receive json response from heartbeat")
		return
	}

	if jsonData["op_code"].(float64) == packets.OpCodeError {
		logger.Error("could not heartbeat. error:", jsonData["message"])
		return
	}

	if jsonData["op_code"].(float64) == packets.OpCodeInvalidClient {
		logger.Warn("client marked as invalid. attempting to register...")
		registerClient(config.GetConfigInstance())
		return
	}

	if jsonData["op_code"].(float64) == packets.OpCodeHeartbeatAck {
		logger.Info("heartbeat acknowledged")

		if jsonData["policies"] != nil


	} else {
		logger.Error("unexpected response from heartbeat. opcode:", jsonData["op_code"])
	}

}
