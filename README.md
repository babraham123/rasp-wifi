# rasp-wifi

### Title: Diagnostics and Webserving on the Raspberry Pi
How to setup a Raspberry Pi as an access point for its own wireless network. This solves a number of problems that come up with embedded devices, including cost, portability, security, ease of use and ease of setup. The discussion below serves as a design review of some of the ways to interact with these devices.


### Talk Outline

#### Raspberry Pi
 * A credit card sized computer that’s significantly cheaper than most of its rivals (~$35)
 * Applications: media center, cloud server, smart TV, game emulator, robotics brain, cheap educational tool, home automation, etc
 * Great comumunity, including numerous blogs, tutorials and libraries

#### The Problem
 * How to easily and wirelessly interact with the Pi. Even for non-interactive projects, you need to diagnose issues, check system health. 
 * Need a UI of some kind for an embedded, headless PC

#### Potential Solutions - Physical Link
 * External monitor
   * requires expensive screen, requires Pi enter display mode
   * cost defeats the purpose of buying a low-cost Pi
 * Ethernet
   * HTTP allows us to use the web browser to display information, receive input. A great cross-device platform
   * cumbersome cords, bad for outdoor applications
 * WiFi
   * looks better but has signal range issues. Difficult to configure
 * Bluetooth
   * Requires a dedicated client-side application in order to receive and display signals

#### Potential Solutions - Network
 * SSH onto the Pi
   * Requires specialized knowledge to operate, not user friendly
 * Pi connects to remote server
   * Hosting costs
   * Security concerns
 * Pi becomes a web server that user connects over home network
   * User must somehow detect local ip address (too hard for enduser)
   * Or open port on home network and use dynamic ip stuff (not secure)

#### My Solution
Create your own local network with the Raspberry Pi as the router, DNS, and web server.

#### Advantages
 * Instant wireless connectivity wherever you go
 * If internet access becomes available, you can choose to forward remote requests
 * No security problems due to limited range
 * Leverages web browser as a cross device platform
 * Can create custom domain names, network name
 * Fairly simple for enduser
 * Same method used by Chromecast to configure its wifi connection

#### Technologies used in demo
 * hostapd: wifi device mode (access point), network security (WPA2)
 * dnsmasq: DHCP and DNS
 * nginx: webserving
 * socket.io: 2 way communication
 * init scripts: automatically stop and start on reboot

#### Few projects I’ve built
 * Interactive LED table: individually addressable, multicolor LEDs
 * Smartphone enabled TV remote: chromecast and IR commands
 * Weather station: collection of environmental sensors

#### Future Improvements
 * Try a different WiFi mode. For example, ad hoc or mesh networks (multiple masters)
 * Try using Multicast DNS to broadcast domain name over home network
 * Try to access webpages over bluetooth
   * Forward http requests over bluetooth PAN
   * [Bluetooth PAN](http://notes.pitfall.org/ip-over-bluetooth-to-a-raspberry-pi.html)


Author: Bereket Abraham
