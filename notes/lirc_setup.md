Setup homemade IR emitter (Optional)

`sudo apt-get install lirc lirc-x`

Append to /etc/modules
```
lirc_dev
lirc_rpi gpio_in_pin=23 gpio_out_pin=22
```

sudo vim /etc/lirc/hardware.conf
```
# /etc/lirc/hardware.conf
#
# Arguments which will be used when launching lircd
LIRCD_ARGS="--uinput"

# Don't start lircmd even if there seems to be a good config file
# START_LIRCMD=false

# Don't start irexec, even if a good config file seems to exist.
# START_IREXEC=false

# Try to load appropriate kernel modules
LOAD_MODULES=true

# Run "lircd --driver=help" for a list of supported drivers.
DRIVER="default"
# usually /dev/lirc0 is the correct setting for systems using udev
DEVICE="/dev/lirc0"
MODULES="lirc_rpi"

# Default configuration files for your hardware if any
LIRCD_CONF=""
LIRCMD_CONF=""
```

`sudo /etc/init.d/lirc stop`
`sudo /etc/init.d/lirc start`


