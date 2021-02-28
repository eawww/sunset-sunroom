require('dotenv').config()
const SunCalc = require('suncalc');
const { deflate } = require('zlib');
const Hue = require('./hue.js');
const STATES = require('./colors.js');

// const DAY_COLOR = {
//   bri: 254,
//   hue: 41442,
//   sat: 75,
// }

// const MID_SUNSET = [
//   {
//     bri: 169,
//     hue: 63991,
//     sat: 254,
//   },
//   {
//     bri: 169,
//     hue: 2302,
//     sat: 247,
//   },
//   {
//     bri: 169,
//     hue: 4484,
//     sat: 254,
//   }
// ]

// const END_SUNSET = [
//   {
//     bri: 169,
//     hue: 46260,
//     sat: 238,
//   },
//   {
//     bri: 169,
//     hue: 45027,
//     sat: 254,
//   },
//   {
//     bri: 169,
//     hue: 48018,
//     sat: 216,
//   }
// ]

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

//returns a sorted array of sun time events for yesterday through tomorrow
const sortedSunCalcTimes = (date = new Date()) => {
  const suncalcsArray = (date) => {
    const times = SunCalc.getTimes(date, TARGET_LONGITUDE, TARGET_LATITUDE);
    return Object.keys(times).map((key) => ({
      time: times[key],
      name: key,
    }))
  }
  const tomorrow = new Date(date)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const yesterday = new Date(date)
  yesterday.setDate(yesterday.getDate() - 1)

  return suncalcsArray(date)
    .concat(suncalcsArray(yesterday))
    .concat(suncalcsArray(tomorrow))
    .sort((a,b) => a.time - b.time);
}

const randomItemFromArray = (array) => array[Math.floor(Math.random() * array.length)];

// lights: ['1', '2',  '3']
const transitionLightsToState = (lights, state, ms = 0) => {
  const transitiontime = Math.floor(ms / 100);
  lights.forEach((lightIndex, index) => {
    Hue.setLightProps(lightIndex, {...randomItemFromArray(state), transitiontime})
  })
}

const delay = ms => new Promise(res => setTimeout(res, ms));

const currentStateInfo = () => {
  const suncalctimes = sortedSunCalcTimes();
  const now = new Date();
  let prevStateIndex = 0;
  while(prevStateIndex <= suncalctimes.length - 1){
    if(suncalctimes[prevStateIndex].time < now && suncalctimes[prevStateIndex + 1].time > now){
      break;
    }
    prevStateIndex++;
  }
  if(prevStateIndex === suncalctimes.length - 1){
    console.error('Now is not between two available solar events')
    // TODO: Fail gracefully (this state is basically impossible but I don't know that for sure I guess)
  }
  return {
    msSincePrevState: now - suncalctimes[prevStateIndex].time,
    msUntilNextState: suncalctimes[prevStateIndex + 1].time - now,
    prevStateName: suncalctimes[prevStateIndex].name,
    nextStateName: suncalctimes[prevStateIndex + 1].name,
  }
}

// The main squeeze here
const main = async () => {
  const addressableLights = await Hue.getAddressableLights();
  const initialStateInfo = currentStateInfo();
  console.log(`Beginning at state ${initialStateInfo.prevStateName}.`)
  console.log(`${Math.ceil(initialStateInfo.msUntilNextState / 60000)} minutes until next state, ${initialStateInfo.nextStateName}.`)
  transitionLightsToState(addressableLights, STATES[initialStateInfo.prevStateName])
  await delay(1000);
  transitionLightsToState(addressableLights, STATES[initialStateInfo.nextStateName], initialStateInfo.msUntilNextState)
  await delay(initialStateInfo.msUntilNextState + 1000); 

  // Loop it 4eva
  while(true){
    const stateInfo = currentStateInfo();
    transitionLightsToState(addressableLights, STATES[stateInfo.nextStateName], stateInfo.msUntilNextState)
    console.log(`Now transitioning to next state, ${stateInfo.nextStateName}, over ${stateInfo.msUntilNextState / 60000} minutes.`)
    await delay(stateInfo.msUntilNextState + 1000); 
  }
}
main();  

// const disco = async () => {
//   while(true){
//     Hue.setLightProps(1, {bri: 254, hue: Hue.randomColor(), sat: 254, transitiontime: 0})
//     Hue.setLightProps(2, {bri: 254, hue: Hue.randomColor(), sat: 254, transitiontime: 0})
//     Hue.setLightProps(3, {bri: 254, hue: Hue.randomColor(), sat: 254, transitiontime: 0})
//     await delay(500);
//   }
// }
// disco();

