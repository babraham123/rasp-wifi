# rasp-wifi

## Title: Diagnostics and Webserving on the Raspberry Pi
How to setup a Raspberry Pi as an access point for its own wireless network. This solves a number of problems that come up with embedded devices, including cost, portability, security, ease of use and ease of setup. The talk serves as a design review of some of the ways to interact with these devices.

## Talk Outline
Extol the virtues of the Raspberry Pi
     A credit card sized computer that’s significantly cheaper than most of its rivals
     Applications: media center, cloud server, smart TV, game emulator, robotics brain, cheap educational tool, home automation, etc
Few projects I’ve built
     Interactive LED table: individually addressable, multicolor LEDs
     Smartphone enabled TV remote: chromecast and IR commands
     Weather station: collection of environmental sensors
Problem
     How to easily and wirelessly interact with the Pi, diagnose issues, check system health. Need a UI of some kind for an embedded, headless PC
Review of the solutions I’ve tried
     SSH onto the Pi
          flexible, difficult, not accessible to enduser
     Connect Pi to a display
          requires expensive screen, requires Pi enter display mode
     Pi connects to remote server over ethernet or wifi (1 or 2 way comm)
          Requires hosted server, constant internet connection, security concerns
          wifi looks better but has signal range issues
     Pi becomes a web server that user connects to
          User must somehow detect local ip address (too hard for enduser)
          Or open port on home network and server using dynamic ip stuff
     Pi connects to laptop/smartphone over bluetooth
          Requires a custom desktop/IOS/Android app to receive and display signals
Explain my general idea
     Need Internet: using multicast DNS to broadcast your domain to all other devices on your local network. However, you still to be within range of your router
     If you don’t actually need internet access, why bother? Instead, create your own local network with the Raspberry Pi as the router, DNS, and web server.
Explain why its better
     Instant wireless connectivity wherever you go
     If internet access becomes available, you can forward remote requests dynamically
     No security problems due to limited range
     Leverages web browser as a cross device platform
     Can create custom domain names, network name
     Fairly simple for enduser
Go into detail
     hostapd: wifi device mode (access point), network security (WPA2)
     dnsmasq: DHCP and DNS
     nginx: webserving
     socket.io: 2 way communication
     init scripts: automatically stop and start on reboot
Demo: setup LED chain and let audience connect to the UI
     sample: http://bereketabraham.com/table/public/table.html
Future Improvements
     Try a different WiFi mode. For example, ad hoc networks or mesh networks (multiple masters)
     Try to access webpages over bluetooth
          Forward http requests over bluetooth PAN
          http://notes.pitfall.org/ip-over-bluetooth-to-a-raspberry-pi.html
