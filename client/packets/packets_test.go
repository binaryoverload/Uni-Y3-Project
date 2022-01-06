package packets

import (
	"bytes"
	"testing"
)

const publicKey = "kbzn0B83wpKzQhJMmhRE5S1d5AtCn0wwW"
const aesData = "ajD65IjjRpRAyauVcqmo0rwuEXn7XUc22"

// Testing to ensure all packet types implement the interface!
var _ IPacket = &HelloPacket{}
var _ IPacket = &HelloAckPacket{}
var _ IPacket = &HelloNAckPacket{}
var _ IPacket = &DataPacket{}

func TestHelloPacket_Encode(t *testing.T) {
	packet := &HelloPacket{
		PublicKey: []byte(publicKey),
		AesData:   []byte(aesData),
	}
	dPacket := packet.Encode()

	if dPacket[0] != Hello {
		t.Fatalf("op code does not match hello (%d) got %d", Hello, dPacket[0])
	}

	if !bytes.Equal(dPacket[1:34], []byte(publicKey)) {
		t.Fatal("public key does not match")
	}

	if !bytes.Equal(dPacket[34:], []byte(aesData)) {
		t.Fatal("aes data does not match")
	}

}

func TestHelloAckPacket_Encode(t *testing.T) {
	packet := &HelloAckPacket{
		PublicKey: []byte(publicKey),
		AesData:   []byte(aesData),
	}
	dPacket := packet.Encode()

	if dPacket[0] != HelloAck {
		t.Fatalf("op code does not match hello ack (%d) got %d", HelloAck, dPacket[0])
	}

	if !bytes.Equal(dPacket[1:34], []byte(publicKey)) {
		t.Fatal("public key does not match")
	}

	if !bytes.Equal(dPacket[34:], []byte(aesData)) {
		t.Fatal("aes data does not match")
	}
}

func TestHelloNAckPacket_Encode(t *testing.T) {
	packet := &HelloNAckPacket{}
	dPacket := packet.Encode()

	if dPacket[0] != HelloNAck {
		t.Fatalf("op code does not match hello nack (%d) got %d", HelloNAck, dPacket[0])
	}
}

func TestDataPacket_Encode(t *testing.T) {
	packet := &DataPacket{
		AesData:   []byte(aesData),
	}
	dPacket := packet.Encode()

	if dPacket[0] != Data {
		t.Fatalf("op code does not match data (%d) got %d", Data, dPacket[0])
	}

	if !bytes.Equal(dPacket[1:], []byte(aesData)) {
		t.Fatal("aes data does not match")
	}
}
