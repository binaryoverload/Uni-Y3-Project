package encryption

import (
	"client/config"
	"crypto/aes"
	"crypto/elliptic"
	"crypto/rand"
	ecdh "github.com/aead/ecdh"
)

var curve = elliptic.P256()

var ecdhInstance = ecdh.Generic(curve)
var privateKey = []byte(config.GetConfigInstance().ClientPrivateKey)

func GetPublicKey() []byte {
	var publicKey = ecdhInstance.PublicKey(privateKey).(ecdh.Point)
	return elliptic.MarshalCompressed(curve, publicKey.X, publicKey.Y)
}

func CalculateSharedSecret(publicKey []byte) []byte {
	var x, y = elliptic.UnmarshalCompressed(curve, publicKey)
	var point = ecdh.Point{X: x, Y: y}
	return ecdhInstance.ComputeSecret(privateKey, point)
}

func EncryptAes(secret []byte, data []byte) {
	var iv = make([]byte, 16)
	rand.Read(iv)
	aes.NewCipher(secret)
}