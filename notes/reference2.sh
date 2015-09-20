
#!/bin/bash
#
# Interface checker
# Checks to see whether interface has an IP address, if it doesn't assume it's down and start hostapd
# Author : SirLagz
#
Interface='wlan0'
HostAPDIP='10.0.0.1'
echo "-----------------------------------"
echo "Checking connectivity of $Interface"
NetworkUp=`/sbin/ifconfig $Interface`
IP=`echo "$NetworkUp" | grep inet | wc -l`
if [[ $IP -eq 0 ]]; then
echo "Connection is down"
hostapd=`pidof hostapd`
if [[ -z $hostapd ]]; then
# If there are any more actions required when the interface goes down, add them here
echo "Attempting to start hostapd"
/etc/init.d/hostapd start
echo "Attempting to start dnsmasq"
/etc/init.d/dnsmasq start
echo "Setting IP Address for wlan0"
/sbin/ifconfig wlan0 $HostAPDIP netmask 255.255.255.0 up
fi
elif [[ $IP -eq 1 && $NetworkUp =~ $HostAPDIP ]]; then
echo "IP is $HostAPDIP - hostapd is running"
else
echo "Connection is up"
hostapd=`pidof hostapd`
if [[ ! -z $hostapd ]]; then
echo "Attempting to stop hostapd"
/etc/init.d/hostapd stop
echo "Attempting to stop dnsmasq"
/etc/init.d/dnsmasq stop
echo "Renewing IP Address for $Interface"
/sbin/dhclient wlan0
fi
fi
echo "-----------------------------------"

