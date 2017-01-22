Site: [https://zlapser.herokuapp.com](https://zlapser.herokuapp.com)

# Camera - Canon 20D
My camera is an oldie: [Canon 20D](http://www.dpreview.com/reviews/canoneos20d) and the remote shutter is uncommon. Look [here](http://www.doc-diy.net/photo/remote_pinout/#canon), but I found a cheap remote shutter at dealextreme.com. I bought [this](http://dx.com/p/rs-80n3-remote-shutter-switch-for-canon-dslr-camera-118865) and [this](http://dx.com/p/wired-remote-shutter-for-canon-109cm-length-72104). Both tested ok on the 20D.

## Schematic
[![CircuitLab Schematic eeemb8](https://www.circuitlab.com/circuit/eeemb8/screenshot/540x405/)](https://www.circuitlab.com/circuit/eeemb8/zlapser/)

## Requirements
- Rasperry Pi
- Electronic circuit or something. Check the schematic above
- Lots of nerd power. :-)

# Raspberry Pi
## Raspbian “wheezy” distribution
### Initial setup

When the [SD card](http://elinux.org/RPi_Easy_SD_Card_Setup) has been creted, configure the PI using

    $ sudo raspi-config

I set up the keyboard layout, enabled the SSH and set memory split to 16MB.

### Static IP address of wired (eth0)

    $ sudo nano /etc/network/interfaces

Change to this

	#iface eth0 inet dhcp
	iface eth0 inet static
	address 10.10.10.23 		# ip address
	netmask 255.255.255.128 	# network
	gateway 10.10.10.1 			# gateway. Your router typically
	nameserver 10.10.10.1 		# DNS. Use can use: 8.8.8.8 and 4.4.2.2

Update the package manger and other stuff

	$ sudo apt-get update
	$ sudo apt-get upgrade		# This can take a while.
	$ sudo apt-get clean
	$ sudo usermod -aG staff pi
	$ sudo reboot

### NodeJs
#### Install node

You can look for the latest version [here](http://nodejs.org/dist) or [here](http://nodejs.org/dist/latest). Look for the newest version (ex. v0.11.0), and grab the [node-v0.11.0-linux-arm-pi.tar.gz](http://nodejs.org/dist/v0.11.0/node-v0.11.0-linux-arm-pi.tar.gz)
You can search and check the version with:

	$ apt-cache search nodejs
	$ apt-cache show nodejs 	# v0.6.19 (quite old:-()

I grabbed and unpacked the v0.11.0 version:

	$ wget http://nodejs.org/dist/v0.11.0/node-v0.11.0-linux-arm-pi.tar.gz
	$ tar -zxvf node-v0.11.0-linux-arm-pi.tar.gz
	$ sudo cp -a node-v0.11.0-linux-arm-pi/{bin,lib} /usr/local/

Check that is ok:

	$ node -v 					# v0.11.0
	$ npm -v 					# v1.2.15

#### Install zlapser
	$ wget https://github.com/ziaxdk/zlapser/archive/v1.0.zip
	$ unzip v1.0.zip
	$ cd zlapser-1.0
	$ sudo npm install --production	    # install node dependencies to zlapser. Takes a while.
	$ sudo npm start 		            # run (or "sudo node server.js")

You should see a message, that server is running. Cancel anytime with twice "ctrl+c"

### Configure network wireless

Wireless networks can be configured in many ways, for example access point or ad-hoc network. To getting access point to work, you must ensure that your wifi dongle supports the ["nl80211"](http://wireless.kernel.org/en/developers/Documentation/nl80211), which hostap daemon is using. 

#### Ad-hoc configuration

I have a Sempre WU300-2 wifi dongle, which will be configured as an ad-hoc network to connect to the zlapser web.

	$ sudo ifconfig wlan0 down
	$ sudo nano /etc/network/interfaces

Comment wlan0 out and add this

	iface wlan0 inet static 	# wlan0 is adapter. Could be ath0, I guess..
	address 10.10.10.130 		# ip address
	netmask 255.255.255.128		# network
	wireless-mode ad-hoc 		# configure as ad-hoc
	wireless-channel 5 			# channel
	wireless-essid zlapser-pi 	# ssid
	wireless-key 1239			# key
	auto wlan0

And bring adapter up

	$ sudo /etc/init.d/networking reload
	$ sudo ifup wlan0

A blue diode started to flash om the adapter, and you should be able to connect with an iPad or something that supports ad-hoc network (not Android on stock rom). You'll need to root the device), and use settings like this:

	IP: 10.10.10.131
	Netmask: 255.255.255.128
	Gateway: 1.1.1.1 			# ignored

Start the zlapser node website with:

	$ sudo npm start & 			# sudo because of writing to the GPIO port, and "&" to run as daemon

Go to your user agent (Chrome), and type: [http://10.10.10.130](http://10.10.10.130), and you should see the zlapser site. :-)

To kill the node daemon:

	$ sudo killall node

#### Access point configuration
Finally my wifi dongle arrived from Hong Kong. I bought [this](http://dx.com/p/mini-usb-2-4ghz-150mbps-802-11b-g-n-wifi-wireless-network-card-adapter-black-120933), which has this RT5370 chipset and it's supported by ["nl80211"](http://wireless.kernel.org/en/developers/Documentation/nl80211). I pretty much followed this guide to get access point running: [http://www.elinux.org/RPI-Wireless-Hotspot](http://www.elinux.org/RPI-Wireless-Hotspot)

First install the packages required to run hot spot

    $ sudo apt-get install hostapd udhcpd   # Installs dhcp and hostap servers

Configure udhcpd (dhcp server)

    $ sudo nano /etc/udhcpd.conf

Lots of informaion in the file: Ignore most of it and change/add the following:

    start 10.11.12.14           # range start address of dhcp
    end 10.11.12.20             # range end address of dhcp
    interface wlan0             # assign dhcp to interface wlan0
    opt subnet 255.255.255.128  # network
    opt router 10.11.12.13      # The wlan0 ip address

Next

     $ sudo nano /etc/default/udhcpd

Enable dhcp by comment this line

    #DHCPD_ENABLED="no"         # the # means ignore/comment


Assign IP address for wlan0

    $ sudo nano /etc/network/interfaces

Add

    iface wlan0 inet static
    address 10.11.12.13
    netmask 255.255.255.128
    auto wlan0

Next configure hostapd - the access point

    $ sudo nano /etc/hostapd/hostapd.conf

For an open network with no security enter this:

    interface=wlan0
    driver=nl80211
    ssid=www.zlapser.net        # SSID of network
    hw_mode=g
    channel=1
    auth_algs=1
    wmm_enabled=0
    beacon_int=100

To enable a secure network add/change this with the above:

    auth_algs=3
    wpa=2
    wpa_passphrase=zlapser!     # MUST be at least 8 characters
    wpa_key_mgmt=WPA-PSK
    wpa_pairwise=TKIP
    rsn_pairwise=CCMP

To test the configuration and check it works:

    $ sudo hostapd -dd /etc/hostapd/hostapd.conf     # dd lots of debug info

Finally before you can run it as a service:

    $ sudo /etc/default/hostapd

Change to this:

    DAEMON_CONF="/etc/hostapd/hostapd.conf"

Run it as a service and start dhcp as a service

    $ sudo service hostapd start
    $ sudo service udhcpd start

Now you should be able to connect to the pi access point. :-)

###Problem!!!
According to [this](http://raspberrytank.ianrenton.com/day-22-i-occidentally-a-whole-access-point/) blog,
sometimes the hostapd daemon erases the wlan0 ip address, which causes the udhcpd daemon not to start. I inserted the line:

    ifconfig wlan 10.11.12.13 netmask 255.255.255.128

in the /etc/init.d/hostapd config file in the "start)" right before ";;", and the problem disappears.

### Boot

Create the startup script for node/zlapser server:

    $ sudo nano /etc/init.d/zlapserd

And use this:

    #! /bin/sh
    #
    ### BEGIN INIT INFO
    # Provides:          zlapserd
    # Required-Start:    $remote_fs $syslog
    # Required-Stop:     $remote_fs $syslog
    # Default-Start:     2 3 4 5
    # Default-Stop:      0 1 6
    # Short-Description: Start node server with ZLapser
    ### END INIT INFO

    NAME=node
    NODE_OPTS=server.js
    DESC="node - ZLapser site"

    case "$1" in
      start)
            echo -n "Starting $DESC: "
            sudo /usr/local/bin/node /home/pi/zlapser-1.0/server.js > /var/log/node &
            echo "$NAME."
            ;;
      stop)
            echo -n "Stopping $DESC: "
            sudo killall node
            echo "$NAME."
            ;;
    esac

    exit 0

To get everything up and running, when booting the pi, use:

    $ sudo update-rc.d hostapd enable
    $ sudo update-rc.d udhcpd enable
    $ sudo update-rc.d zlapserd enable


## Browser support

The stock browser on Android (mine is v4.03) doesn't support webswockets, which ZLapser uses for feedback to the UI. Install Chrome for Android. More info here [http://caniuse.com/websockets](http://caniuse.com/websockets)

### Tips and tricks
For good recordings, make sure to set your cammera to fixed shutter/aperture values (M mode), and disable auto whitebalance mode. And of course, use a tripod.

### Contact
To contact me, visit [www.ziax.dk](http://ziax.dk/contact)

### Some useful commands, while hacking the Pi. ;-)

    $ lsusb
    $ lsmod
