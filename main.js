require('dotenv').config()
const SunCalc = require('suncalc');
const { deflate } = require('zlib');
const Hue = require('./hue.js');

const DAY_COLOR = {
  bri: 254,
  hue: 41442,
  sat: 75,
}

const MID_SUNSET = [
  {
    bri: 169,
    hue: 63991,
    sat: 254,
  },
  {
    bri: 169,
    hue: 2302,
    sat: 247,
  },
  {
    bri: 169,
    hue: 4484,
    sat: 254,
  }
]

const END_SUNSET = [
  {
    bri: 169,
    hue: 46260,
    sat: 238,
  },
  {
    bri: 169,
    hue: 45027,
    sat: 254,
  },
  {
    bri: 169,
    hue: 48018,
    sat: 216,
  }
]

const {
  BRIDGE_IP,
  BRIDGE_USERNAME,
  TARGET_LONGITUDE,
  TARGET_LATITUDE,
} = process.env;

// Exit if one of the environment variables is undefined.
let initError = false;
if (typeof BRIDGE_IP === 'undefined'){
  console.log('Error: BRIDGE_IP is undefined in .env file. \nPlease see README for how to find it.')
  initError = true;
}
if (typeof BRIDGE_USERNAME === 'undefined'){
  console.log('Error: BRIDGE_USERNAME is undefined in .env file. \nPlease run getUserName.js to get if you need to')
  initError = true;
}
if (initError){
  process.exit(1);
}

const lightOnOff = (lightNumber, onOff = "ON") => {
  fetch(
    `http://${BRIDGE_IP}/api/${BRIDGE_USERNAME}/lights/${lightNumber}/state`,
    {
      method: 'PUT',
      body: `{"on":${onOff === 'ON' ? 'true' : 'false'}}`
    },
  )
}

const delay = ms => new Promise(res => setTimeout(res, ms));

// const main = async () => {
//   const date = new Date();
//   const suncalctimes = SunCalc.getTimes(date, TARGET_LONGITUDE, TARGET_LATITUDE)
//   console.log(suncalctimes)
//   console.log(date.toISOString())

//   const addressableLights = await Hue.getAddressableLights();
//   // Turn them all full on.
//   addressableLights.forEach(lightIndex => {
//     Hue.setLightProps(lightIndex, DAY_COLOR);
//   });
//   await delay(1000)
//   const midSSTransition = 10000;
//   Hue.setLightProps(1, {...MID_SUNSET[0], transitiontime: midSSTransition / 100})
//   Hue.setLightProps(2, {...MID_SUNSET[1], transitiontime: midSSTransition / 100})
//   Hue.setLightProps(3, {...MID_SUNSET[2], transitiontime: midSSTransition / 100})
//   await delay(midSSTransition)
//   Hue.setLightProps(1, {...END_SUNSET[0], transitiontime: midSSTransition / 100})
//   Hue.setLightProps(2, {...END_SUNSET[1], transitiontime: midSSTransition / 100})
//   Hue.setLightProps(3, {...END_SUNSET[2], transitiontime: midSSTransition / 100})
//   // await delay(midSSTransition)
//   // console.log(addressableLights);
  
// }
// main();  

const disco = async () => {
  while(true){
    Hue.setLightProps(1, {bri: 254, hue: Hue.randomColor(), sat: 254, transitiontime: 0})
    Hue.setLightProps(2, {bri: 254, hue: Hue.randomColor(), sat: 254, transitiontime: 0})
    Hue.setLightProps(3, {bri: 254, hue: Hue.randomColor(), sat: 254, transitiontime: 0})
    await delay(500);
  }
}
disco();

