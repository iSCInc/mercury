[![Build Status](https://travis-ci.org/Wikia/mercury.svg)](https://travis-ci.org/Wikia/mercury)
[![Dependency Status](https://david-dm.org/Wikia/mercury.svg)](https://david-dm.org/Wikia/mercury)
[![devDependency Status](https://david-dm.org/Wikia/mercury/dev-status.svg)](https://david-dm.org/Wikia/mercury#info=devDependencies)

## Automatic Setup
* Run `./install.sh` after cloning this repo
* Run `npm run dev` to start server and watch files

## Manual Setup
* `npm install` will install local dependencies
* `npm install -g bower jshint gulp forever tsd typescript-formatter bower-installer` to install global dependencies
* `bower install` will install client dependencies
* `tsd update` will update typings folder with ambient files
* Copy `config/localSettings.example.ts` to your own copy of `localSettings.ts` and add your eth0 address as the host, set a port
* run `npm run dev` to start server and watch files

## Setting up hosts
* For any dev box wiki you'd like to use, setup a line in your /etc/hosts, for example:
`127.0.0.1    lastofus.wikia-dev.local`

If you're using macos you can setup dns on your machine to have this automatic:
http://passingcuriosity.com/2013/dnsmasq-dev-osx/

##Live reload
on dev environments livereload server runs that reload your web browser on any change in public folder
you can disable that by running gulp with --nosync parameter

## Testing on devices
### Using IP over the same network
To test on your mobile device, connect both your development machine and your device to the same network. You can then visit Mercury on your device by using your machine's IP address (on OS X, you can get that using `ifconfig`). The URL should look something like: `//10.10.10.123:8000/wiki/Foo`. You can't use subdomains with IP addresses, but you can change your test wiki manually by editing your [`wikiFallback`](https://github.com/Wikia/mercury/blob/master/config/localSettings.base.ts#L28).

## Troubleshooting
### Errors while `npm install`
So far, we've encouraged one error connected to compiling `libsass`. It happened on Ubuntu 12.04 (pretty old version but still a LTS version). The issue was connected to outdated g++ compiler. `libsass` requires version 4.8+ and by default Ubuntu 12.04 has 4.6 to update it go to your terminal and manually install g++-4.8:
`sudo apt-get remove g++-4.6`
`sudo apt-get install g++-4.8`
`sudo ln -s /usr/bin/g++-4.8 /usr/bin/g++`
