/* jshint node: true, esversion: 6 */

'use strict';

const Alexa = require('alexa-sdk');
const fridge = require('./fridgeInterface.js');
const constants = require('./constants.js');

// Slot names used by the skill
const tempSlotName = 'temp';
const typeSlotName = 'type';

// Utility functions

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function textIfValid ( input, validText, invalidText = '' ) {

	if ( input !== null ) {
		return validText;
	} else {
		return invalidText;
	}
}

function roundedToFixed(val, digits){
	
  const rounder = Math.pow(10, digits);
  return (Math.round(val * rounder) / rounder).toFixed(digits);
}

//


// Event handler functions
var handlers = {

	'LaunchRequest': function () {
		this.emit(':ask', 'Welcome to the Beer Fridge.  You can ask what is the temperature, or say set temperature and specify a value to set the beer or fridge temperature.  Or ask for a status report to get the current state of the fridge');
	},

	'AMAZON.HelpIntent': function () {
		this.emit(':tell', 'You can ask what is the temperature, or say set temperature and specify a value to set the beer or fridge temperature.  Or ask for a status report to get the current state of the fridge');
	},

	'GetTemperature': function () {
		console.log('GetTemperature intent called');
		const alexa = this;

		fridge.getRequest (  ( result ) => {
  			if ( result ) {
  				let speechOutput = '';
  				speechOutput = 	textIfValid ( result.beerTemp, 'Beer temperature is ' +  roundedToFixed(result.beerTemp,1 )) +
  								textIfValid ( result.fridgeTemp, ', Fridge temperature is ' +  roundedToFixed(result.fridgeTemp, 1 ));
  				if ( speechOutput === '' ) {
  					speechOutput = 'There were no temperatures available to report';
  				} else {
					speechOutput = 'The ' + speechOutput;
				}
  				alexa.emit(':tell', speechOutput);
  			} else {
  				alexa.emit(':tell', 'I could not obtain the temperature, sorry');
  			}
  		});
    },

    'SetTemperature': function () {
		console.log('SetTemperature intent called');
		const alexa = this;

		// Handle slot dialogue

        if (alexa.event.request.dialogState === 'STARTED') {
            alexa.emit(':delegate', alexa.event.request.intent);

        } else if (alexa.event.request.dialogState !== 'COMPLETED'){
            alexa.emit(':delegate');
        } else {
            // All the slots are filled and confirmed, lets check
			
			// Setpoint type first
			const type = alexa.event.request.intent.slots[typeSlotName].value;
			if ( type !== 'beer' && type !== 'fridge' ) {
				// Not happy with the setpoint type (beer/fridge) slot value supplied, ask for it.
				const speechOutput = 'Invalid setpoint type, please answer beer or fridge';
				const repromptSpeech = speechOutput;
				alexa.emit(':elicitSlot', typeSlotName, speechOutput, repromptSpeech);
			}

			// Now the setpoint temperature
			const temp = alexa.event.request.intent.slots[tempSlotName].value;
			if ( isNumber ( temp ) ) {
				
				// All OK so lets change the setpoint type/temperature
				fridge.setTemperature ( type, temp, outcome => {
					if ( outcome ) {
						alexa.emit(':tell', type + ' temperature set to ' + temp + ' degrees');
					} else {
						alexa.emit(':tell', 'I could not set the ' + type + ' temperature, sorry');
					}
				});
			} else {
				// Not happy with the temperature slot value supplied, ask for it.
				const speechOutput = 'Invalid temperature value. What temperature should I set the ' + type + ' to ?';
				const repromptSpeech = speechOutput;
				alexa.emit(':elicitSlot', tempSlotName, speechOutput, repromptSpeech);
			}
		}
    },

    'GetReport': function () {
		console.log('GetReport intent called');
		const alexa = this;
		fridge.getRequest ( result => {
			if ( result ) {		
				const speechOutput = 'The fridge mode is ' + constants.modeMap[result.mode] +
				', state is ' + constants.stateMap[result.state] +
				textIfValid ( result.beerSet, ', Beer setpoint is ' + roundedToFixed( result.beerSet, 1 )) +
				textIfValid ( result.beerTemp, ', Beer temperature is ' +  roundedToFixed(result.beerTemp, 1 )) +
				textIfValid ( result.fridgeSet, ', Fridge setpoint is ' + roundedToFixed(result.fridgeSet, 1 )) +
				textIfValid ( result.fridgeTemp, ', Fridge temperature is ' +  roundedToFixed(result.fridgeTemp, 1 )) +
				textIfValid ( result.roomTemp, ', Room temperature is ' +  roundedToFixed(result.roomTemp, 1 ));

				alexa.emit(':tell', speechOutput);

			} else {
				alexa.emit(':tell', 'I could not obtain the fridge status, sorry');
			}
		});
    },

   'SessionEndedRequest': function () {
        console.log('session ended!');
        this.emit(':tell', 'Goodbye');
    },

    'Unhandled': function() {
        this.emit(':ask', 'Sorry, I didn\'t get that. What would you like me to do ?');
    }

};

module.exports = handlers;
