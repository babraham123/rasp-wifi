# Raspberry Pi Setup
The plan: You'll connect to its initial ad-hoc wireless network and teach it about your wireless network. Then it'll reboot and jump sideways onto your network and most of your config work is done. The only way to change the Chromecast at this point is to hard reset it. The wireless setup process is very similar to other embedded wireless devices like the Nest Thermostat, FitBit Aria Scale, or Twine Wi-Fi device - connect to ad-hoc, setup locally, jump.

#### Table of Contents
  * [Install OS](#install-os)
  * [Initialize Pi](#initialize-pi)
  * [Install useful programs](#install-useful-programs)
  * [Setup WiFi](#setup-wifi)
  * [Setup Git](#setup-git)
  * [Clone SD card](#Clone-SD-card)

## Install OS

On computer, flash SD card with the latest raspian OS image.
Plug in SD card.
Open Disk Utility and erase card. Set the name and the format to "MS-DOS (FAT)"

Find a RPi OS image to use. I used 2014-06-20-wheezy-raspbian.img
In Mac terminal, type cmd

`diskutil list`

Find the SD card folder, ex /dev/disk2

`diskutil unmountdisk /dev/disk2`

Download your pi OS image and cd to folder. Flash OS image onto card (if=source, of=target, bs=size)

`sudo dd if=2014-06-20-wheezy-raspbian.img of=/dev/disk2 bs=2m`

Plug in peripherals, like keyboard, network cable, and power. Install [nmap](https://nmap.org/download.html#macosx) on setup computer. Use it to locate pi on network, and ssh into it.
```bash
ifconfig # get ip address
nmap -sn 192.168.0.0/24
ssh pi@192.168.1.88
# username= pi
# password= raspberry
```

## Initialize Pi
After ssh'ing onto raspberry pi:

Under the config menu, use 
1. Expand Filesystem
2. Change User Password
4. Internationalisation Options
8. Advanced Options >> A5 SPI (enable)
```bash
sudo raspi-config
# username= pi
# password= [custom]
```

Set locality settings
`sudo vim /etc/default/locale`
```bash
LANG=en_GB.UTF-8
LANGUAGE=en_GB:en
LC_ALL=en_GB.UTF-8
```

## Install useful programs

```bash
sudo apt-get update
sudo apt-get upgrade
sudo apt-get autoremove
sudo apt-get install -y gcc g++ autoconf automake
sudo apt-get install -y tightvncserver unzip git vim python-pip
```

NodeJS
```bash
sudo apt-get purge nodejs npm node
curl -sLS https://apt.adafruit.com/add | sudo bash
sudo apt-get install -y node
/usr/local/bin/node -v
```

## Setup WiFi
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
        ssid="your_ssid"
        wep_key0="your_pass"
        key_mgmt=NONE
}
```

`sudo reboot`


## Setup Git

```bash
ssh-keygen -t rsa -C "babraham42@gmail.com"
cat .ssh/id_rsa.pub
# copy into github account
sudo chmod 700 ~/.ssh
sudo chmod 600 ~/.ssh/id_rsa
```

## Clone SD card
Optional step to create a backup image. Plug in SD into computer. From Mac Terminal:
```bash
diskutil list
sudo dd if=/dev/disk2 of=/Users/babraham/Desktop/clone1.dmg
```
