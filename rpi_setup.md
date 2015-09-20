### Raspberry Pi Setup

The plan: You'll connect to its initial ad-hoc wireless network and teach it about your wireless network. Then it'll reboot and jump sideways onto your network and most of your config work is done. The only way to change the Chromecast at this point is to hard reset it. The wireless setup process is very similar to other embedded wireless devices like the Nest Thermostat, FitBit Aria Scale, or Twine Wi-Fi device - connect to ad-hoc, setup locally, jump.

##### Initialization

On computer, flash SD card with the latest raspian OS image.
plug in SD card
open Disk Utility and erase card. Set the name and the format to "MS-DOS (FAT)"

find a RPi OS image to use. I used 2014-06-20-wheezy-raspbian.img
in terminal, type cmds

`diskutil list`

find the SD card folder, ex /dev/disk2

`diskutil unmountdisk /dev/disk2`

Download your pi OS image and cd to folder. Flash OS image onto card, if=source, of=target, bs=size

`sudo dd if=2014-06-20-wheezy-raspbian.img of=/dev/disk2 bs=2m`

Plug in peripherals, like keyboard, network cable, and power. Install [nmap](https://nmap.org/download.html#macosx) on setup computer. Use it to locate pi on network, and ssh into it.
```
ifconfig # get ip address
nmap -sn 192.168.1.0/24
ssh pi@192.168.1.88
username= pi
password= raspberry
```

##### Configure
```
sudo raspi-config
username= pi
password= typical
# startx (for GUI)
```

##### Install useful programs
```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get autoremove
sudo apt-get install -y gcc g++ autoconf automake
sudo apt-get install upstart
sudo apt-get install -y tightvncserver unzip git vim python-pip
# node
sudo apt-get purge nodejs npm
curl -sL https://deb.nodesource.com/setup | sudo bash -
sudo apt-get install -y nodejs
```

##### DNS Server
Map local network queries to raspberrypi.local
`sudo apt-get install -y avahi-daemon`

Change hostname to raspwifi
`sudo vim /etc/hosts`

`127.0.1.1           raspwifi`

```
echo "raspwifi" | sudo tee /etc/hostname
sudo /etc/init.d/hostname.sh
sudo reboot
# on computer
ssh pi@raspwifi.local
```

##### Ad Hoc Network
```
sudo apt-get install -y isc-dhcp-server
sudo vim /etc/default/isc-dhcp-server
```
`INTERFACES="wlan0"`

On computer, locate ethernet hardware (MAC) address. Insert address into dhcpd config located below.

`ifconfig | grep en0 -A3 | grep ether`

`sudo vim /etc/dhcp/dhcpd.conf`
```
# limit DHCP to the wlan0 interface
DHCPDARGS=wlan0;
default-lease-time 600;
max-lease-time 7200;
 
option subnet-mask 255.255.255.0;
option broadcast-address 10.0.0.255;
option domain-name "Rasp-network";
option routers 10.0.0.1; #default gateway

# IP range to offer
subnet 10.0.0.0 netmask 255.255.255.0 {
    range 10.0.0.2 10.0.0.20;
}
 
# static IP-assignment, get from ifconfig
host myLaptop {
    hardware ethernet 34:36:3b:c7:97:5e;
    fixed-address 10.0.0.100;
}
```

`sudo vim /etc/network/interfaces`
```
# start interfaces upon start of the system
auto lo wlan0

# register loopback interface
iface lo inet loopback

# use dhcp and allow interface to be started when kernel detects a hotplug event
allow-hotplug eth0
iface eth0 inet dhcp

# use manual ip configuration for wlan0 interface and allow hotplug as well
allow-hotplug wlan0
iface wlan0 inet manual
```

##### WiFi & Ad Hoc switching
```
sudo mkdir /usr/local/scripts
sudo pip install flask
sudo update-rc.d -f isc-dhcp-server remove
```

`sudo vim /usr/local/scripts/wifi_switch.sh`
```
#!/bin/bash
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
    /usr/bin/python2.7 /etc/local/scripts/rasp_wifi_config/rasp_wifi_config.py
}
 
echo "================================="
echo "RPi Network Conf Bootstrapper 0.1"
echo "================================="
echo "Scanning for known WiFi networks"
connected=false

if iwlist wlan0 scan | grep $ssid > /dev/null
then
    # wpa_supplicant -B -i wlan0 -c /etc/wpa_supplicant/wpa_supplicant.conf > /dev/null 2>&1
    echo "Obtaining IP from DHCP"
    if dhclient -1 wlan0
    then
        echo "Connected to WiFi"
        connected=true
    else
        echo "DHCP server did not respond with an IP lease (DHCPOFFER)"
        # wpa_cli terminate
    fi
else
    echo "Not in WiFi range"
fi
 
if ! $connected; then
    createAdHocNetwork
fi
```

// >
Append to bottom before 'exit 0' `sudo vim /etc/rc.local`
```
if [ -f /usr/local/scripts/wifi_switch.sh ]; then
    . /usr/local/scripts/wifi_switch.sh >> /usr/local/scripts/wifi_switch.log 2>&1
fi
```

Download repo and install folders
```
git clone git@github.com:babraham123/rasp-wifi.git
sudo cp rasp-wifi/rasp_wifi_config /usr/local/scripts/
```


`sudo reboot`


Clone SD card for backup (Optional). Plug in SD into computer.
```
diskutil list
sudo dd if=/dev/disk1 of=/Users/babraham/Desktop/clone1.dmg
```

