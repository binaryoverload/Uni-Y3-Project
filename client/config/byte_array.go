package config

import (
	"encoding/hex"
	"encoding/json"
)

type HexEncodedByteArray []byte

func (b HexEncodedByteArray) MarshalJSON() ([]byte, error) {
	hexString := hex.EncodeToString(b)
	return json.Marshal(hexString)
}

func (b *HexEncodedByteArray) UnmarshalJSON(data []byte) (err error) {
	var hexString string

	if err = json.Unmarshal(data, &hexString); err != nil {
		return
	}

	*b, err = hex.DecodeString(hexString)
	return
}
