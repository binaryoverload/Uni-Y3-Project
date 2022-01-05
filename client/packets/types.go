package packets

type OpCode uint8

const (
	Hello = 1
	HelloAck = 2
	HelloNAck = 3
	Data = 4
)

type DataPacket interface {}