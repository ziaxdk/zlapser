# Camera - Canon 20D

My camera is an oldie: [Canon 20D](http://www.dpreview.com/reviews/canoneos20d). But the remote shutter is not so common. Look [here](http://www.doc-diy.net/photo/remote_pinout/#canon), but I found a cheap remote shutter at dealextreme.com. I bought [this](http://dx.com/p/rs-80n3-remote-shutter-switch-for-canon-dslr-camera-118865) and [this](http://dx.com/p/wired-remote-shutter-for-canon-109cm-length-72104). Both tested ok on the 20D.

## Schematic
[![CircuitLab Schematic eeemb8](https://www.circuitlab.com/circuit/eeemb8/screenshot/540x405/)](https://www.circuitlab.com/circuit/eeemb8/zlapser/)

# Raspberry Pi
## Raspbian “wheezy”
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

	$ wget https://github.com/ziaxdk/zlapser/archive/master.zip
	$ unzip master.zip
	$ cd ...
	$ npm install --production	# install node dependencies to zlapser. Takes a while.
	$ sudo npm start 		    # run (or "sudo node server.js")

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

### Contact
To contact me, visit [www.ziax.dk](http://ziax.dk/contact) 