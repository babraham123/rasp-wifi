# Setup Instructions
#### Table of contents
  * [Configure wireless interface](#configure-wireless-interface)
  * [Install Hostapd](#install-hostapd)
  * [Configure dnsmasq](#configure-dnsmasq)
  * [Configure webserver](#configure-webserver)
  * [Configure socket.io server](#configure-socketio-server)
  * [Start on boot](#start-on-boot)

## Configure wireless interface

```bash
# Check that OS detects wifi dongle
dmesg | grep usb

sudo ifdown wlan0
sudo cp /etc/network/interfaces /etc/network/interfaces.bak
sudo vim /etc/network/interfaces
```
Enter this instead:
```
auto lo 
iface lo inet loopback
iface eth0 inet dhcp 

allow-hotplug wlan0

iface wlan0 inet static
  address 192.168.10.1
  netmask 255.255.255.0
```

## Install Hostapd
Hostapd = network access controls + security

```bash
sudo apt-get autoremove hostapd
wget https://github.com/jenssegers/RTL8188-hostapd/archive/v1.1.tar.gz
tar -zxvf v1.1.tar.gz
cd RTL8188-hostapd-1.1/hostapd
sudo make
sudo make install
sudo service hostapd restart
```

Set your desired network name (ssid) and password (wpa_passphrase).
`sudo vim /etc/hostapd/hostapd.conf`
```
# Basic configuration
interface=wlan0
ssid=raspwifi
channel=1
#bridge=br0

# WPA and WPA2 configuration
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=3
wpa_passphrase=abcdefg123
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP

# Hardware configuration
driver=rtl871xdrv
ieee80211n=1
hw_mode=g
device_name=RTL8192CU
manufacturer=Realtek
```

## Configure dnsmasq
dnsmasq = DNS + DHCP

```bash
sudo apt-get install -y dnsmasq
echo "127.0.1.1 rasp" | sudo tee -a /etc/hosts

sudo vim /etc/dnsmasq.conf
```
```
domain-needed
bogus-priv
no-resolv
no-poll
server=/rasp.local/192.168.10.1
server=8.8.8.8
server=8.8.4.4
local=/rasp.local/
#address=/doubleclick.net/127.0.0.1
no-hosts
addn-hosts=/etc/dnsmasq.d/hosts.conf
expand-hosts
domain=rasp.local
dhcp-range=192.168.10.10,192.168.10.30,72h
#dhcp-range=tftp,192.168.0.250,192.168.0.254  
#hcp-host=babraham,192.168.10.21,36h
dhcp-option=option:router,192.168.10.1
#dhcp-option=option:ntp-server,192.168.0.5
```

```bash
sudo service dnsmasq restart
sudo vim/etc/dnsmasq.d/hosts.conf
```
```
192.168.10.1 rasp.local
```

Test dns
```bash
nslookup rasp.local localhost
nslookup google.com localhost:8002
```

## Configure webserver

```bash
sudo apt-get install -y nginx
git clone git@github.com:babraham123/light-table-code.git raspsocketio
cd raspsocketio
git checkout ad_hoc
npm install
ls node_modules
```

Change `worker_processes` to 1 in 
`sudo vim /etc/nginx/nginx.conf`

`sudo vim /etc/nginx/conf.d/raspserver.conf`
```
server {
    listen       80;
    server_name  rasp.com;

    access_log  /var/log/nginx/raspserver.log;
    error_log   /var/log/nginx/raspserver.error.log;

    location / {
        root /home/pi/raspsocketio/static;
    }
}

server {
    listen 8080;
    server_name  rasp.com;

    access_log  /var/log/nginx/raspsocketio.log;
    error_log  /var/log/nginx/raspsocketio.error.log;

    location / {
        proxy_pass http://localhost:8002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```
More info on [socket.io settings](http://nginx.com/blog/nginx-nodejs-websockets-socketio/)

`sudo nginx -s reload`


## Configure socket.io server
socket.io = bidirectional, event based communication

```bash
sudo npm install forever -g
sudo cp /home/pi/raspsocketio/setup/rasp-socketio.sh /etc/init.d/rasp-socketio
sudo chmod a+x /etc/init.d/rasp-socketio
sudo update-rc.d rasp-socketio defaults

# test with:
node socketio_server.js --port 8002 --debug
```

## Start on boot 

Start up wifi and ad hoc network
```bash
sudo su
ifup wlan0
service nginx restart
service dnsmasq restart
service hostapd restart
```

Enable on boot 
```bash
update-rc.d rasp-socketio enable
update-rc.d nginx enable 
update-rc.d dnsmasq enable
update-rc.d hostapd enable 
reboot
```
