# Hue Sunset
*Experiementing with Phillips Hue Bridge API*

It doesn't do much currently. In `main.js`, there are two separate functions, `main()` and `disco()`. `main()` is currently commented out. Uncomment it and comment the call to `disco()` to do the other thing.
- `main()` runs a quick simulation of a sunset on bulbs 1-3
- `disco()` switches lights randomly at a 0.5s interval.

## Setup

- Clone repository where you want it
- `$ yarn`
- `$ node main.js`

## Environment Variables
```
BRIDGE_IP=<IP Address of Hue Bridge (see 'Discovering Bridge IP')>
BRIDGE_USERNAME=<Username assigned by hue bridge>
TARGET_LATITUDE=<latitude of target>
TARGET_LONGITUDE=<longitude of target>
```

## Process notes
To manually discover the Bridge IP, visit https://discovery.meethue.com/
This only works if the bridge has been registered with the Hue portal. Alternatively, access your router's list of connected devices, and get the IP address from there.
