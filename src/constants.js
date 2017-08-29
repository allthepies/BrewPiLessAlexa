/* jshint node: true, esversion: 6 */

'use strict';

module.exports = Object.freeze({

  // App-ID. Set to your own Skill App ID from the developer portal.
  // Optional: Leave at '' if you're not bothered about validating which Alexa skill invokes your Lambda code.
  appId: '',


  // The internet address of the BrewPiLess enabled fridge.
  // Must be resolvable via the internet.  Port forwarding on a home router coupled with a Dynamic DNS service like no-ip.com
  // can help here.
  fridgeAddress: {
    hostname: 'aaa.bbb.ccc',
    port: 80
  },

  // The authentication details for BrewPiLess.  Default values are used below but can be changed in the "System Config"
  // page of BrewPiLess.  The values here must align with those set in BrewPiLess.
  auth: {
    userId: 'brewpiless',
    password: 'brewpiless'
  },

  // Value -> Text map for the BrewPiLess mode
  modeMap: {
    'f': 'Fridge constant',
    'b': 'Beer constant',
    'p': 'Beer profile',
    'o': 'Off',
    't': 'Test'
  },

  // Value -> Text map for the BrewPiLess state
  stateMap: [
    "IDLING", // 0
    "OFF", // 1
    "DOOR OPEN", // 2
    "HEATING", // 3
    "COOLING", // 4
    "WAITING TO COOL", // 5
    "WAITING TO HEAT", // 6
    "WAITING FOR PEAK DETECT", // 7
    "COOLING FOR MINIMUM TIME", // 8
    "HEATING FOR MINIMUM TIME", // 9
  ]

});
