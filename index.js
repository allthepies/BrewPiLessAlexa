/* jshint node: true, esversion: 6 */

'use strict';

const Alexa = require('alexa-sdk');
const handlers = require('./eventHandlers.js');
const constants = require('./constants.js');

exports.handler = (event, context, callback) => {
	
	if (constants.appId !== '' && event.session.application.applicationId !== constants.appId) {   
		 callback('Invalid Application ID');
	}	
	const alexa = Alexa.handler(event, context, callback);
	alexa.registerHandlers(handlers);
	alexa.execute();	  
};
