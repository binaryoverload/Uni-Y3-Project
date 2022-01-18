package encryption

import (
	"client/config"
	"crypto/aes"
	"crypto/cipher"
	"crypto/elliptic"
	"crypto/rand"
	ecdh "github.com/aead/ecdh"
)

var curve = elliptic.P256()

var ecdhInstance = ecdh.Generic(curve)
var privateKey = []byte(config.GetConfigInstance().ClientPrivateKey)

var conf = config.GetConfigInstance()

func GetPublicKey() []byte {
	var publicKey = ecdhInstance.PublicKey(privateKey).(ecdh.Point)
	return elliptic.MarshalCompressed(curve, publicKey.X, publicKey.Y)
}

func CalculateSharedSecret(publicKey []byte) []byte {
	var x, y = elliptic.UnmarshalCompressed(curve, publicKey)
	var point = ecdh.Point{X: x, Y: y}
	return ecdhInstance.ComputeSecret(privateKey, point)
}

func encryptAes(secret []byte, data []byte) ([]byte, error) {
	iv := make([]byte, 16)
	rand.Read(iv)
	block, err := aes.NewCipher(secret)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCMWithNonceSize(block, 16)
	if err != nil {
		return nil, err
	}

	cipherText := gcm.Seal(nil, iv, data, nil)

	return append(iv, cipherText...), nil
}


func decryptAes(secret []byte, data []byte) ([]byte, error) {
	iv := data[:16]

	block, err := aes.NewCipher(secret)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCMWithNonceSize(block, 16)
	if err != nil {
		return nil, err
	}

	plaintext, err := gcm.Open(nil, iv, data[16:], nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}

func EncryptAes(data []byte) ([]byte, error) {
	return encryptAes(CalculateSharedSecret(conf.ServerPublicKey), data)
}

func DecryptAes(data []byte) ([]byte, error) {
	return decryptAes(CalculateSharedSecret(conf.ServerPublicKey), data)
}
