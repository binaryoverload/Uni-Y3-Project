package main

import (
	config "client/config"
	"client/encryption"
	"client/packets"
	"client/policies"
	"client/server"
	"client/utils"
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

	policies.EvaluatePolicy(policies.Policy{
		Id:          uuid.New(),
		PolicyType:  "package",
		LastUpdated: time.Now(),
		PolicyItems: []map[string]interface{}{
			{"type": "package", "packages": []string{"rolldice"}, "action": "uninstall"},
		},
	})

	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered", r)
		}
	}()

	_, err := taskScheduler.ScheduleAtFixedRate(heartbeat, 30*time.Second)
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
