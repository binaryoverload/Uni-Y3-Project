package main

import (
	config "client/config"
	"client/encryption"
	"client/packets"
	"client/server"
	"client/utils"
	"context"
	"crypto/elliptic"
	"crypto/rand"
	"fmt"
	"github.com/google/uuid"
	"github.com/procyon-projects/chrono"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
)

var logger = utils.GetLogger()
var taskScheduler = chrono.NewDefaultTaskScheduler()

var Finished = make(chan bool)

func main() {
	defer func() { <-taskScheduler.Shutdown() }()
	conf := config.GetConfigInstance()
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigs
		fmt.Println(sig)
		Finished <- true
	}()

	configInitValidation(conf)

	if !conf.ClientId.Valid {
		registerClient(conf)
	}

	logger.Infof("ecdh client public key: %x", encryption.GetPublicKey())

	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered", r)
		}
	}()

	_, err := taskScheduler.ScheduleAtFixedRate(heartbeat, 20*time.Second)
	if err != nil {
		logger.Fatal("failed to setup heartbeat scheduler. error")
	}

	<-Finished
}

func registerClient(conf *config.Config) {
	data, err := server.RunTcpActions([]server.TcpAction{server.SendHello, server.RecieveHelloAck, server.SendClientRegistration, server.RecieveData})
	if err != nil {
		logger.Fatal("error in attempting to register client:", err.Error())
	}

	jsonData, ok := data.(map[string]interface{})

	if !ok {
		logger.Fatal("did not receive response from client registration")
	}

	if jsonData["op_code"].(float64) == packets.OpCodeError {
		logger.Fatal("could not register client. error:", jsonData["message"])
	}

	if jsonData["op_code"].(float64) == packets.OpCodeClientRegistrationAck {
		clientId, err := uuid.Parse(jsonData["client_id"].(string))
		if err != nil {
			log.Fatalln(err)
		}
		conf.ClientId = uuid.NullUUID{
			UUID:  clientId,
			Valid: true,
		}
		conf.SaveConfig()
		logger.Info("registered client! id:", jsonData["client_id"])
	} else {
		logger.Fatal("unexpected response from registering client. opcode:", jsonData["op_code"])
	}
}

var lastBackoff = -1

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

var numberErrors = 0
var backoffUntil time.Time

func heartbeat(ctx context.Context) {
	logger.Info("sending heartbeat...")

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
		logger.Error("did not receive response from heartbeat")
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
	} else {
		logger.Error("unexpected response from heartbeat. opcode:", jsonData["op_code"])
	}

}

func configInitValidation(conf *config.Config) {
	if len(conf.ClientPrivateKey) == 0 {
		privateKey, _, _, err := elliptic.GenerateKey(elliptic.P256(), rand.Reader)
		if err != nil {
			return
		}
		conf.ClientPrivateKey = privateKey
		conf.SaveConfig()
	}

	if len(conf.ServerPublicKey) != 33 {
		logger.Fatal("Server Public Key is invalid! Please consult your administrator.")
	}

	if len(conf.ServerHost) == 0 {
		logger.Fatal("Server address is invalid! Please consult your administrator.")
	}

	if len(conf.EnrolmentToken) == 0 {
		logger.Fatal("Enrolment token is invalid! Please consult your administrator.")
	}
}
