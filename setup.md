# Setup

Check that OS detects wifi dongle

`dmesg | grep usb`

##### Install wifi driver
```bash
sudo apt-get autoremove hostapd
wget https://github.com/jenssegers/RTL8188-hostapd/archive/v1.1.tar.gz
tar -zxvf v1.1.tar.gz
cd RTL8188-hostapd-1.1/hostapd
sudo make
sudo make install
sudo service hostapd restart
```

##### Configure dhcp and hostapd

```bash
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

##### Configure DNS

Append hostname to hosts file
`sudo vim /etc/hosts` >> 
`127.0.1.1  rasp`

```bash
echo "rasp" | sudo tee /etc/hostname
sudo /etc/init.d/hostname.sh
```

Configure PowerDNS
```bash
sudo apt-get install -y pdns-server dnsutils
sudo vim /etc/powerdns/pdns.conf
```
Edit the following lines, default to Google nameservers
```
recursor=8.8.8.8
allow-recursion=127.0.0.1,192.168.0.0/24,192.168.10.0/24
allow-recursion-override=on
lazy-recursion=yes
```

`sudo service pdns restart`

Add the dns conf file, then the actual zone

`sudo vim /etc/powerdns/bindbackend.conf`
```
zone "rasp.com" {
        type master;
        file "/etc/powerdns/bind/rasp.com.zone";
        allow-update { none; };
};
```

```bash
sudo mkdir /etc/powerdns/bind
sudo vim /etc/powerdns/bind/rasp.com.zone
```
```
$ORIGIN rasp.com     ; base for unqualified names
$TTL 1h                 ; default time-to-live
@                       IN      SOA ns.rasp.com hostmaster.rasp.com (
                                1; serial
                                1d; refresh
                                2h; retry
                                4w; expire
                                1h; minimum time-to-live
                        )
                        IN      NS      ns
                        IN      A       192.168.10.1
ns                      IN      A       192.168.10.1
www                     IN      A       192.168.10.1
```
```bash
sudo service pdns restart
# test dns
nslookup rasp.com localhost
nslookup google.com localhost
```

##### Configure DHCP

```bash
sudo apt-get install -y isc-dhcp-server
sudo vim /etc/dhcp/dhcpd.conf
```
Comment out
```
#option domain-name "example.org";
#option domain-name-servers ns1.example.org, ns2.example.org;
```
Uncomment `authoritative;`

Add at the end:
```
subnet 192.168.10.0 netmask 255.255.255.0 {
  range 192.168.10.10 192.168.10.20;
  option broadcast-address 192.168.10.255;
  option routers 192.168.10.1;
  default-lease-time 600;
  max-lease-time 7200;
  option domain-name "rasp.com";
  option domain-name-servers 192.168.10.1; # 127.0.0.1
#  option domain-name-servers 8.8.8.8, 8.8.4.4;
}
```

`sudo vim /etc/default/isc-dhcp-server`

Update this line to say: 
`INTERFACES="wlan0"`


##### Configure http webserver

```bash
sudo apt-get install -y nginx
git clone git@github.com:babraham123/light-table-code.git raspsocketio
cd raspsocketio
git checkout ad_hoc
npm install
ls node_modules
```

Change `worker_processes` to 1 
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


##### Configure socket.io server

```bash
sudo npm install forever -g
sudo cp /home/pi/raspsocketio/rasp-socketio.sh /etc/init.d/rasp-socketio
sudo chmod a+x /etc/init.d/rasp-socketio
sudo update-rc.d rasp-socketio defaults

# test with:
node /home/pi/raspsocketio/socketio_server.js --port 8002 --debug
```

##### Start and enable on boot 

Start up wifi and ad hoc network
```bash
sudo su
ifup wlan0
service nginx restart
service pdns restart
service isc-dhcp-server restart
service hostapd restart
```

Enable on boot 
```bash
update-rc.d rasp-socketio enable
update-rc.d nginx enable 
update-rc.d pdns enable
update-rc.d isc-dhcp-server enable
update-rc.d hostapd enable 
reboot
```

