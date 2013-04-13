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
```shell
$ sudo apt-get install hostapd udhcpd
$ reboot
$ sudo /etc/network/interfaces
´´´

sudo bash
apt-get install hostapd udhcpd

First thing is to assign a static IP adress
```shell
sudo nano /etc/network/interfaces
´´´
Change to this

```text
#iface eth0 inet dhcp
iface eth0 inet static
address 10.10.10.23 		# ip address
netmask 255.255.255.128 	# network
gateway 10.10.10.1 			# gateway. Your router typically
nameserver 10.10.10.1 		# DNS. Use can use: 8.8.8.8 and 4.4.2.2
´´´
And then reboot
````shell
sudo reboot
´´´



sudo apt-get update
sudo apt-get upgrade
