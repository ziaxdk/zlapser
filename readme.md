# THIS IS FAR FROM COMPLETE.

## Server (node.js)

To setup the web server on the PI.

Install node packages and stuff
```javascript
npm install
```

Run it
```javascript
npm start
```


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
Update the package manger
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
You can look for the latest version [here](http://nodejs.org/dist) or [here](http://nodejs.org/dist/latest). Look for the newest version (ex. v0.11.0), and grab the [node-v0.10.2-linux-arm-pi.tar.gz](http://nodejs.org/dist/v0.11.0/node-v0.11.0-linux-arm-pi.tar.gz)
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
### Install zlapser

