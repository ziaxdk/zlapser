# THIS IS FAR FROM COMPLETE.

## LOTS OF TODO TO-DO. :-)

# Raspberry Pi
## Raspbian “wheezy”
### Initial setup
When the [SD card](http://elinux.org/RPi_Easy_SD_Card_Setup) has been creted, I configured the PI using
```shell
$ sudo raspi-config
```
I set up the keyboard layout, enabled the SSH and set mempry split to 16MB.

### Static IP address of wired (eth0)
```shell
$ sudo nano /etc/network/interfaces
```
Change to this

```text
#iface eth0 inet dhcp
iface eth0 inet static
address 10.10.10.23 		# ip address
netmask 255.255.255.128 	# network
gateway 10.10.10.1 			# gateway. Your router typically
nameserver 10.10.10.1 		# DNS. Use can use: 8.8.8.8 and 4.4.2.2
```
Update the package manger and other stuff
```shell
$ sudo apt-get update
$ sudo apt-get upgrade		# This can take a while.
$ sudo apt-get clean
$ sudo usermod -aG staff pi
$ sudo reboot
```
### NodeJs
#### Install node
You can look for the latest version [here](http://nodejs.org/dist) or [here](http://nodejs.org/dist/latest). Look for the newest version (ex. v0.11.0), and grab the [node-v0.11.0-linux-arm-pi.tar.gz](http://nodejs.org/dist/v0.11.0/node-v0.11.0-linux-arm-pi.tar.gz)
You can search and check the version with:
```shell
$ apt-cache search nodejs
$ apt-cache show nodejs 	# v0.6.19 (quite old:-()
```
I grabbed and unpacked the v0.11.0 version:
```shell
$ wget http://nodejs.org/dist/v0.11.0/node-v0.11.0-linux-arm-pi.tar.gz
$ tar -zxvf node-v0.11.0-linux-arm-pi.tar.gz
$ sudo cp -a node-v0.11.0-linux-arm-pi/{bin,lib} /usr/local/
```
Check that is ok:
```shell
$ node -v 					# v0.11.0
$ npm -v 					# v1.2.15
```
#### Install zlapser
```shell
$ wget ... (TODO)
$ unzip .. (TODO)
$ cd ...
$ npm install 				# install node dependencies to zlapser 
$ sudo npm start 			# run (or you "sudo node server.js")
```
You should see a message, that server is running. Cancel anytime with twice "ctrl+c"
### Configure network wireless
Wiresless networks can be configured in many ways, for example access point or ad-hoc network. To getting access point to work, you must ensure that your wifi dongle supports the "nl80211", which hostapd is using. 

I have a Sempre WU300-2 wifi dongle, which will be configured as an ad-hoc network to connect to the zlapser web.

```shell
$ sudo ifconfig wlan0 down
$ sudo nano /etc/network/interfaces
```
Comment wlan0 out and add this
```text
iface wlan0 inet static 	# wlan0 is adapter. Could be ath0, I guess..
address 10.10.10.130 		# ip address
netmask 255.255.255.128		# network
wireless-mode ad-hoc 		# configure as ad-hoc
wireless-channel 5 			# channel
wireless-essid zlapser-pi 	# ssid
auto wlan0
```
And bring adapter up
```shell
$ sudo /etc/init.d/networking reload
$ sudo ifup wlan0
```
A blue diode started to flash om the adapter, and you should be able to connect with an iPad or something that supports ad-hoc netowkr (not Android on stock rom). You'll need to root the device), and use settings like this:

```text
IP: 10.10.10.131
Netmask: 255.255.255.131
Gateway: 1.1.1.1
```
Start the zlapser node website with:
```shell
$ sudo npm start & 			# sudo because of writing to the GPIO port, and "&" to run as daemon
```
Go to your user agent (Chrome), and type: [http:/10.10.10.130](http:/10.10.10.130), and you should see the zlapser site. :-)

To kill the node daemon:
```shell
$ sudo killall node
```
