package utils

import (
	"github.com/matishsiao/goInfo"
	"net"
)

func GetOSInfo() goInfo.GoInfoObject {
	osInfo, _ := goInfo.GetInfo()
	return osInfo
}

func GetMACAddress() string {
	interfaces, err := net.Interfaces()
	if err != nil {
		return "00:00:00:00:00:00"
	}

	for _, netInterface := range interfaces {
		// Skip loopback interfaces
		if netInterface.Flags & net.FlagLoopback != 0 {
			continue
		}

		// Skip locally administered MACs
		if netInterface.HardwareAddr[1] & 2 != 0 {
			continue
		}

		return netInterface.HardwareAddr.String()
	}

	return "00:00:00:00:00:00"
}