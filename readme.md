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
```
And then reboot
```shell
$ sudo reboot
```
### NodeJs
You can look for the latest version [here](http://nodejs.org/dist). Look for the newest version (ex. v0.10.2), and grab the [node-v0.10.2-linux-arm-pi.tar.gz](http://nodejs.org/dist/v0.10.2/node-v0.10.2-linux-arm-pi.tar.gz)
