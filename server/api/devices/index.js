/**
 * Index des routes pour la gestion des appareils
 */

const { getDefaultDevices } = require("./getDefaultDevices.js");
const { getAvailableDefaultDevices } = require("./getAvailableDefaultDevices.js");
const { removeDevice, setSocketIO: setRemoveDeviceSocketIO } = require("./removeDevice.js");

module.exports = {
  getDefaultDevices,
  getAvailableDefaultDevices,
  removeDevice,
  setRemoveDeviceSocketIO,
};
