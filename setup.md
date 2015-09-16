# Setup

### DNS Server::
`sudo apt-get install avahi-daemon`
Local network queries now map to raspberrypi.local

change hostname
`sudo vim /etc/hosts`
```
127.0.1.1           rpicast
```

`echo "rpicast" > /etc/hostname`
`sudo /etc/init.d/hostname.sh`
`sudo reboot`

### Connect to WiFi::
`ifconfig`
`wpa_cli -p /var/run/wpa_supplicant -i wlan0 [command]`
```
wpa_cli
> scan
scan_results
add_network
	0
set_network 0 ssid "mySSID"
set_network 0 psk "mykey"
enable_network 0
save_config
quit
# may need to manually request ip
sudo dhclient -l wlan0
```

### Ad Hoc Network::
`sudo apt-get install isc-dhcp-server`
`sudo vim /etc/default/isc-dhcp-server`
```
# On what interfaces should the DHCP server (dhcpd) serve DHCP requests?
# Separate multiple interfaces with spaces, e.g. "eth0 eth1".
INTERFACES="wlan0"
```

`sudo vim /etc/dhcp/dhcpd.conf`
```
DHCPDARGS=wlan0; # limit DHCP to the wlan0 interface
default-lease-time 600;
max-lease-time 7200;
 
option subnet-mask 255.255.255.0;
option broadcast-address 10.0.0.255;
option domain-name "RPi-network";
option routers 10.0.0.1; #default gateway
 
subnet 10.0.0.0 netmask 255.255.255.0 {
    range 10.0.0.2 10.0.0.20; #IP range to offer
}
 
#static IP-assignment
host myLaptop {
    hardware ethernet 11:aa:22:bb:33:cc;
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

### WiFi vs Ad Hoc::
`sudo update-rc.d -f isc-dhcp-server remove`

`sudo vim /etc/rc.local`
```
#!/bin/bash
...
# RPi Network Conf Bootstrapper
 
createAdHocNetwork(){
    ifconfig wlan0 down
    iwconfig wlan0 mode ad-hoc
    # iwconfig wlan0 key testpswd #WEP key
    iwconfig wlan0 key off
    iwconfig wlan0 essid RPi      #SSID
    ifconfig wlan0 10.0.0.200 netmask 255.255.255.0 up
    /usr/sbin/dhcpd wlan0
    echo "Ad-hoc network created"
}
 
echo "================================="
echo "RPi Network Conf Bootstrapper 0.1"
echo "================================="
echo "Scanning for known WiFi networks"
ssids=( 'MyWlan' 'MyOtherWlan' )
connected=false
for ssid in "${ssids[@]}"
do
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
done
 
if ! $connected; then
    createAdHocNetwork
fi
exit 0
```
```
# or loop through file
while read p; do
  echo $p
done <known_networks.conf
```

`sudo reboot`


### Configuration Webpage::
`sudo pip install flask`

`sudo vim self_config.py`
```
from flask import Flask
app = Flask(__name__)

@app.route("/")
def index():
    return "Hello World!"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80)
```

`python self_config.py`
