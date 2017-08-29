/* jshint node: true, esversion: 6 */

'use strict';

const http = require('http');
const constants = require('./constants.js');


// Generic http request method, controlled by the options parameter.
// Performs the request and invokes the doWebRequestCallBack callback with the result

function doWebRequest(options, data, doWebRequestCallBack) {

  console.log('In doWebRequest');
  let encodedData = '';

  if (data.length > 0) {
    encodedData = encodeURIComponent(data);
    options.headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(encodedData)
    };
  }

  const req = http.request(options, res => {
    let responseContent = '';
    if (res.statusCode != 200) {
      console.log("Error response code:  " + res.statusCode);
      doWebRequestCallBack(new Error("Non 200 Response"));
    }

    res.on('data', data => responseContent += data);
    res.on('end', () => doWebRequestCallBack(responseContent));

  }).on('error', e => doWebRequestCallBack(new Error(e.message)));

  if (encodedData.length > 0) {
    req.write(encodedData);
  }
  req.end();
}

// Utility function to construct the JSON command payload for BPL to change a temperature setpoint (beer or fridge)
function constructTempChangeRequest(type, temp) {

  if (type === 'beer') {
    return `data=j{mode:b, beerSet:${temp}}`;
  } else {
    return `data=j{mode:f, fridgeSet:${temp}}`;
  }
}

//  Object containing the functions which interface to BrewPiLess
var fridge = {


  // Set the desired beer/fridge temperature setpoint in BPL by invoking the putline webservice request with an encoded JSON request payload.
  // The BPL mode will be set to reflect the setpoint type i.e. fridge constant for a fridge setpoint, beer constant for a beer setpoint.

  'setTemperature': (type, temp, callback) => {
    const options = {
      hostname: constants.fridgeAddress.hostname,
      port: constants.fridgeAddress.port,
      path: '/putline',
      method: 'POST',
      // Supply http basic authentication as this is a request which requires authentication.
      auth: constants.auth.userId + ':' + constants.auth.password
    };

    doWebRequest(options,
      constructTempChangeRequest(type, temp),
      res => callback(!(res instanceof Error))
    );

  },


  // Get the BPL status by invoking the getstatus webservice
  'getRequest': callback => {
    const options = {
      hostname: constants.fridgeAddress.hostname,
      port: constants.fridgeAddress.port,
      path: '/getstatus',
      method: 'GET'
    };

    doWebRequest(options,
      '',
      res => {
        if (!(res instanceof Error)) {
          const webResponseObject = JSON.parse(res);
          callback(webResponseObject);
        } else {
          callback(false);
        }
      }
    );
  }
};

module.exports = fridge;
