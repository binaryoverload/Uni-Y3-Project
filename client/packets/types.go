package packets

type OpCode uint8

const (
	Hello = 1
	HelloAck = 2
	HelloNAck = 3
	Data = 4
)

type IPacket interface {
	Encode() []byte
	decode([]byte) error
}

func Decode(data []byte) (IPacket, error) {
	var packet IPacket = nil
	switch data[0] {
	case Hello:
		packet = &HelloPacket{}
	case HelloAck:
		packet = &HelloAckPacket{}
	case HelloNAck:
		packet = &HelloNAckPacket{}
	case Data:
		packet = &DataPacket{}
	}
	err := packet.decode(data[1:])
	if err != nil {
		return nil, err
	}
	return packet, nil
}