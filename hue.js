const fetch = require('node-fetch');

const {
    BRIDGE_IP,
    BRIDGE_USERNAME,
  } = process.env;

const getAddressableLights = async () => {
  const addressableLights = await fetch(
    `http://${BRIDGE_IP}/api/${BRIDGE_USERNAME}/lights`,
    {
      method: 'GET',
    },
  ).then((response) => response.json()).then(response => {
    const lightsKeys = Object.keys(response);
    return lightsKeys.filter((lightKey) => response[lightKey].state.reachable)
  })
  return addressableLights;
}

const setLightProps = (lightID, props) => {

  fetch(
    `http://${BRIDGE_IP}/api/${BRIDGE_USERNAME}/lights/${lightID}/state`,
    {
      method: 'PUT',
      body: JSON.stringify(props)
    },
  )
}

const randomColor = (min = 0, max = 65535) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  getAddressableLights,
  setLightProps,
  randomColor,
}