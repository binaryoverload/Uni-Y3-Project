package main

import (
	config "client/config"
	"client/encryption"
	"client/packets"
	"client/server"
	"context"
	"crypto/elliptic"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"github.com/google/uuid"
	"github.com/procyon-projects/chrono"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"
)

var environment = config.CreateEnvironment()
var taskScheduler = chrono.NewDefaultTaskScheduler()

var Finished = make(chan bool)

func main() {
	defer func() { <-taskScheduler.Shutdown() }()
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		sig := <-sigs
		fmt.Println(sig)
		Finished <- true
	}()

	configInitValidation(&environment)

	if !environment.ClientId.Valid {
		registerClient(&environment)
	}

	environment.Logger.Infof("ecdh client public key: %x", encryption.GetPublicKey(&environment))

	defer func() {
		if r := recover(); r != nil {
			fmt.Println("Recovered", r)
		}
	}()

	_, err := taskScheduler.ScheduleAtFixedRate(func(ctx context.Context) {
		heartbeat(ctx, &environment)
	}, 30*time.Second)
	if err != nil {
		environment.Logger.Fatal("failed to setup heartbeat scheduler. error")
	}

	<-Finished
}

func registerClient(env *config.Environment) {
	data, err := server.RunTcpActions(env, []server.TcpAction{server.SendHello, server.RecieveHelloAck, server.SendClientRegistration, server.RecieveData})
	if err != nil {
		env.Logger.Fatal("error in attempting to register client:", err.Error())
	}

	dataBytes, ok := data.([]byte)
	if !ok {
		env.Logger.Fatal("did not receive response from client registration")
	}

	var jsonData map[string]interface{}

	err = json.Unmarshal(dataBytes, &jsonData)
	if err != nil {
		env.Logger.Fatal("did not parse response from client registration")
	}

	if jsonData["op_code"].(float64) == packets.OpCodeError {
		env.Logger.Fatal("could not register client. error:", jsonData["message"])
	}

	if jsonData["op_code"].(float64) == packets.OpCodeClientRegistrationAck {
		clientId, err := uuid.Parse(jsonData["client_id"].(string))
		if err != nil {
			log.Fatalln(err)
		}
		env.ClientId = uuid.NullUUID{
			UUID:  clientId,
			Valid: true,
		}
		env.SaveConfig()
		env.Logger.Info("registered client! id:", jsonData["client_id"])
	} else {
		env.Logger.Fatal("unexpected response from registering client. opcode:", jsonData["op_code"])
	}
}

func configInitValidation(env *config.Environment) {
	if len(env.ClientPrivateKey) == 0 {
		privateKey, _, _, err := elliptic.GenerateKey(elliptic.P256(), rand.Reader)
		if err != nil {
			return
		}
		env.ClientPrivateKey = privateKey
		env.SaveConfig()
	}

	if len(env.ServerPublicKey) != 33 {
		env.Logger.Fatal("Server Public Key is invalid! Please consult your administrator.")
	}

	if len(env.ServerHost) == 0 {
		env.Logger.Fatal("Server address is invalid! Please consult your administrator.")
	}

	if len(env.EnrolmentToken) == 0 {
		env.Logger.Fatal("Enrolment token is invalid! Please consult your administrator.")
	}
}
