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
```bash
ifconfig # get ip address
nmap -sn 192.168.0.0/24
ssh pi@192.168.1.88
username= pi
password= raspberry
```

##### Configure
```
sudo raspi-config
username= pi
password= typical
```

##### Install useful programs
```bash
sudo apt-get update
sudo apt-get upgrade
sudo apt-get autoremove
sudo apt-get install -y gcc g++ autoconf automake
sudo apt-get install -y tightvncserver unzip git vim python-pip
```
Node
```bash
sudo apt-get purge nodejs npm node
curl -sLS https://apt.adafruit.com/add | sudo bash
sudo apt-get install -y node
/usr/local/bin/node -v
```

##### Set locality settings

`sudo vim /etc/default/locale`
```
LANG=en_GB.UTF-8
LANGUAGE=en_GB:en
LC_ALL=en_GB.UTF-8
```

##### Setup Wifi
WPA security

`sudo cp /etc/wpa_supplicant/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf.bak`
`sudo vim /etc/wpa_supplicant/wpa_supplicant.conf`
```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
        ssid="your_ssid"
        psk="your_pass"
}
```
or WEP security
```
network={
        ssid="YourSSID"
        wep_key0="password12345"
        key_mgmt=NONE
}
```

`sudo reboot`


##### Setup Git
```bash
ssh-keygen -t rsa -C "babraham42@gmail.com"
cat .ssh/id_rsa.pub
# copy into github account
sudo chmod 700 ~/.ssh
sudo chmod 600 ~/.ssh/id_rsa
```

##### Clone SD card for backup 
(Optional) Plug in SD into computer.
```bash
diskutil list
sudo dd if=/dev/disk1 of=/Users/babraham/Desktop/clone1.dmg
```
