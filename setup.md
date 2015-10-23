# Setup Instructions
#### Table of contents
  * [Configure wireless interface](#configure-wireless-interface)
  * [Install Hostapd](#install-hostapd)
  * [Configure dnsmasq](#configure-dnsmasq)
  * [Configure webserver](#configure-webserver)
  * [Configure socket.io server](#configure-socketio-server)
  * [Start on boot](#start-on-boot)

## Configure wireless interface

Check that the OS detects the wifi adapter, then turn it on
```bash
dmesg | grep usb

sudo ifdown wlan0
sudo mv /etc/network/interfaces /etc/network/interfaces.bak
sudo vim /etc/network/interfaces
```
Replace default configurations with the below:
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
```
sudo mv /etc/hostapd/hostapd.conf /etc/hostapd/hostapd.conf.bak
sudo vim /etc/hostapd/hostapd.conf
```
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
More info on hostapd settings in `hostapd.conf.bak`

## Configure dnsmasq
dnsmasq = DNS + DHCP

```bash
sudo apt-get install -y dnsmasq
echo "127.0.1.1 rasp" | sudo tee -a /etc/hosts

sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.bak
sudo vim /etc/dnsmasq.conf
```
```
domain-needed
bogus-priv
no-resolv
no-poll
server=8.8.8.8
server=8.8.4.4
address=/rasp.net/192.168.10.1
no-hosts
addn-hosts=/etc/dnsmasq.d/hosts.conf
expand-hosts
domain=embed.local
dhcp-range=192.168.10.20,192.168.10.50,72h
#dhcp-option=42,0.0.0.0
```
More info on dnsmasq settings in `/etc/dnsmasq.conf.bak`

```bash
sudo service dnsmasq restart
sudo touch /etc/dnsmasq.d/hosts.conf
```

Test dns
```bash
nslookup rasp.net localhost
nslookup google.com localhost
```

## Configure webserver

```bash
sudo apt-get install -y nginx
git clone git@github.com:babraham123/rasp-wifi.git raspserver
cd raspserver
npm install
ls node_modules
```

Change `worker_processes` to 1 in 
`sudo vim /etc/nginx/nginx.conf`

`sudo vim /etc/nginx/conf.d/raspserver.conf`
```
server {
    listen       80;
    server_name  rasp.net;

    access_log  /var/log/nginx/server.log;
    error_log   /var/log/nginx/server.error.log;

    location / {
        root /home/pi/raspserver/static;
    }
}

server {
    listen 8080;
    server_name  rasp.net;

    access_log  /var/log/nginx/socketio.log;
    error_log  /var/log/nginx/socketio.error.log;

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
More info on [socket.io/nginx settings](http://nginx.com/blog/nginx-nodejs-websockets-socketio/)

`sudo nginx -s reload`


## Configure socket.io server
socket.io = bidirectional, event based communication

```bash
sudo npm install forever -g

# test with:
node socketio_server.js --port 8002 --debug

sudo cp /home/pi/raspserver/setup/rasp-socketio.sh /etc/init.d/rasp-socketio
sudo chmod a+x /etc/init.d/rasp-socketio
sudo update-rc.d rasp-socketio defaults
```

## Start on boot 

Start up wifi and ad hoc network
```bash
sudo su
ifup wlan0
service rasp-socketio restart
service nginx restart
service dnsmasq restart
service hostapd restart
```

Enable on boot 
```bash
update-rc.d rasp-socketio enable
update-rc.d nginx enable 
update-rc.d dnsmasq enable
ln -s /etc/init.d/hostapd /etc/rc2.d/S02hostapd
update-rc.d hostapd enable 
reboot
```

On your laptop or smartphone, connect to the `raspwifi` network and go to the `rasp.net` website you setup earlier. 


