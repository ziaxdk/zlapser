# THIS IS FAR FROM COMPLETE.

## LOTS OF TODO TO-DO. :-)

# Raspberry Pi
## Raspbian “wheezy”
### Initial setup
When the SD card has been creted, I configured the PI using
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
```
And then reboot
```shell
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
$ npm Install 				# install dependencies to zlapser 
$ npm start 				# run (or you node server.js)
```
You should see a message, that server is running. Cancel at ctrl+c
### Configure network wireless
Wiresless networks can be configured in many ways, for example access point or ad-hoc network. To getting access point to work, you must ensure that your wifi dongle supports the "nl80211", which hostapd is using. 

I have a Sempre WU300-2 wifi dongle, which will be configured as an ad-hoc network to connect to the zlapser web.

