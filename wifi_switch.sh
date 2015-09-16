#!/bin/bash
# ...
# RPi Network Conf Bootstrapper
 
createAdHocNetwork(){
    ifconfig wlan0 down
    iwconfig wlan0 mode ad-hoc
    # iwconfig wlan0 key testpswd #WEP key
    iwconfig wlan0 key off
    iwconfig wlan0 essid RaspberryPi      #SSID
    ifconfig wlan0 10.0.0.200 netmask 255.255.255.0 up
    /usr/sbin/dhcpd wlan0
    echo "Ad-hoc network created"
    python /home/babraham/rasp-wifi/self_config.py
}
 
echo "================================="
echo "RPi Network Conf Bootstrapper 0.1"
echo "================================="
echo "Scanning for known WiFi networks"
connected=false

while read ssid; do
    if iwlist wlan0 scan | grep $ssid > /dev/null
    then
        echo "First WiFi in range has SSID:" $ssid
        echo "Starting supplicant for WPA/WPA2"
        wpa_supplicant -B -i wlan0 -c /etc/wpa_supplicant/wpa_supplicant.conf > /dev/null 2>&1
        echo "Obtaining IP from DHCP"
        if dhclient -1 wlan0
        then
            echo "Connected to WiFi"
            connected=true
            break
        else
            echo "DHCP server did not respond with an IP lease (DHCPOFFER)"
            wpa_cli terminate
            break
        fi
    else
        echo "Not in range, WiFi with SSID:" $ssid
    fi
done </home/babraham/known_networks.conf
 
if ! $connected; then
    createAdHocNetwork
fi
exit 0
