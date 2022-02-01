var instance_skel = require('../../../instance_skel')
var actions = require('./actions.js')
var presets = require('./presets.js')
var feedbacks = require('./feedbacks.js')
var variables = require('./variables.js')

var debug;

const colorsys = require('colorsys');

instance.prototype.INTERVAL = null; //used for polling device
instance.prototype.BULBINFO = {};

instance.prototype.BRIGHTNESS_INTERVAL = null; //used for brightness up/down actions

instance.prototype.CURRENT_HUE = 50;
instance.prototype.CURRENT_SATURATION = 100;
instance.prototype.CURRENT_COLORTEMP = 3200;
instance.prototype.CURRENT_BRIGHTNESS = 100;

instance.prototype.CURRENT_COLOR_RGB = {r: 255, g: 213, b: 2};
instance.prototype.CURRENT_COLOR_HEX = '#ffd503';
instance.prototype.CURRENT_COLOR_DECIMAL = 16766211;


// #########################
// #### Other Functions ####
// #########################
instance.prototype.getInformation = async function () {
	//Get all information from Device
	var self = this;

	if (self.config.host) {
		let info = await actions.info(this);
		if (info) {
			self.status(self.STATUS_OK);
			self.BULBINFO = info;
			try {
				self.updateData();
			}
			catch(error) {
				self.log('error', 'Error from Bulb: ' + String(error));
				self.log('error', 'Stopping Update interval due to error.');
				self.stopInterval();
			}

			try {
				self.checkVariables();
			}
			catch(error) {
				self.log('error', 'Error from Bulb: ' + String(error));
				self.log('error', 'Stopping Update interval due to error.');
				self.stopInterval();
			}

			try {
				self.checkFeedbacks();
			}
			catch(error) {
				self.log('error', 'Error from Bulb: ' + String(error));
				self.log('error', 'Stopping Update interval due to error.');
				self.stopInterval();
			}
		}
	}
};

instance.prototype.setupInterval = function() {
	let self = this;

	if (self.INTERVAL !== null) {
		clearInterval(self.INTERVAL);
		self.INTERVAL = null;
	}

	self.config.interval = parseInt(self.config.interval);

	if (self.config.interval > 0) {
		self.log('info', 'Starting Update Interval.');
		self.INTERVAL = setInterval(self.getInformation.bind(self), self.config.interval);
	}
};

instance.prototype.stopInterval = function () {
	let self = this;

	self.log('info', 'Stopping Update Interval.');

	if (self.INTERVAL) {
		clearInterval(self.INTERVAL);
		self.INTERVAL = null;
	}
};

instance.prototype.brightness_change = function(direction) {
	let self = this;

	let newLevel = self.CURRENT_BRIGHTNESS;

	if (direction === 'up') {
		newLevel++;
	}
	else {
		newLevel--;
	}

	if ((newLevel > 100) || (newLevel < 0)) {
		self.brightness_fader(direction, 'stop', null);
	}
	else {
		self.power(1, 0, {brightness: newLevel});
		self.CURRENT_BRIGHTNESS = newLevel;
		self.setVariable('brightness', newLevel);
	}
};

instance.prototype.brightness_fader = function(direction, mode, rate) {
	let self = this;

	self.brightness_fader_stop();

	if (mode === 'start') {
		self.stopInterval(); //stop the regular update interval as it will mess with the brightness otherwise
		self.BRIGHTNESS_INTERVAL = setInterval(self.brightness_change.bind(self), parseInt(rate), direction);
	}
	else {
		self.setupInterval(); //restart regular update interval if needed
	}
};

instance.prototype.brightness_fader_stop = function() {
	let self = this;

	if (self.BRIGHTNESS_INTERVAL !== null) {
		clearInterval(self.BRIGHTNESS_INTERVAL);
		self.BRIGHTNESS_INTERVAL = null;
	}
}

// ########################
// #### Instance setup ####
// ########################
function instance(system, id, config) {
	var self = this

	// super-constructor
	instance_skel.apply(this, arguments)

	return self
}

instance.GetUpgradeScripts = function () {
}

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this

	self.stopInterval();
	self.brightness_fader_stop();

	debug('destroy', self.id)
}

// Initalize module
instance.prototype.init = function () {
	var self = this

	debug = self.debug
	log = self.log

	self.BULBINFO.light_state = {
		hue: null,
		saturation: null,
		brightness: null
	};

	self.status(self.STATUS_WARNING, 'connecting');
	if (self.config.alias !== '') {
		if (self.config.host) {
			self.name(self.config.alias);
		}
	}

	self.getInformation()
	self.setupInterval();
	self.actions() // export actions
	self.init_presets()
	self.init_variables()
	self.checkVariables()
	self.init_feedbacks()
	self.checkFeedbacks()
}

// Update module after a config change
instance.prototype.updateConfig = function (config) {
	var self = this
	self.config = config
	self.status(self.STATUS_WARNING, 'connecting');
	if (self.config.alias !== '') {
		if (self.config.host) {
			self.name(self.config.alias);
		}
	}
	
	self.getInformation()
	self.setupInterval();
	self.actions() // export actions
	self.init_presets()
	self.init_variables()
	self.checkVariables()
	self.init_feedbacks()
	self.checkFeedbacks()
}

instance.prototype.updateData = function () {
	let self = this;

	let oldHue = self.CURRENT_HUE;
	let oldSaturation = self.CURRENT_SATURATION;
	let oldColorTemp = self.CURRENT_COLOR_TEMP;
	let oldBrightness = self.CURRENT_BRIGHTNESS;

	if ('hue' in self.BULBINFO.light_state) {
		self.CURRENT_HUE = parseInt(self.BULBINFO.light_state.hue);
	}

	if ('saturation' in self.BULBINFO.light_state) {
		self.CURRENT_SATURATION = parseInt(self.BULBINFO.light_state.saturation);
	}

	if ('color_temp' in self.BULBINFO.light_state) {
		self.CURRENT_COLORTEMP = parseInt(self.BULBINFO.light_state.color_temp);
	}

	if ('brightness' in self.BULBINFO.light_state) {
		self.CURRENT_BRIGHTNESS = parseInt(self.BULBINFO.light_state.brightness);
	}

	self.CURRENT_COLOR_RGB = colorsys.hsv2Rgb(self.CURRENT_HUE, self.CURRENT_SATURATION, self.CURRENT_BRIGHTNESS);
	self.CURRENT_COLOR_HEX = colorsys.rgbToHex(self.CURRENT_COLOR_RGB.r, self.CURRENT_COLOR_RGB.g, self.CURRENT_COLOR_RGB.b);
	self.CURRENT_COLOR_DECIMAL = parseInt(self.CURRENT_COLOR_HEX.replace('#',''), 16);

	if ((oldHue !== self.CURRENT_HUE) || (oldSaturation !== self.CURRENT_SATURATION) || (oldColorTemp !== self.CURRENT_COLOR_TEMP) || (oldBrightness !== self.CURRENT_BRIGHTNESS)) {
		self.actions(); //re export actions for default color options
	}
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value:
				"This module controls TP-Link Kasa Smart Light Bulbs.",
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Bulb IP',
			width: 4,
			regex: self.REGEX_IP
		},
		{
			type: 'text',
			id: 'dummy1',
			width: 12,
			label: ' ',
			value: ' ',
		},
		{
			type: 'text',
			id: 'aliasInfo',
			width: 12,
			label: 'Bulb Alias',
			value: 'If you wish to change the name of the bulb, enter the new name (alias) here.',
		},
		{
			type: 'textinput',
			id: 'alias',
			label: 'Bulb Alias',
			default: '',
			width: 4
		},
		{
			type: 'text',
			id: 'dummy1',
			width: 12,
			label: ' ',
			value: ' ',
		},
		{
			type: 'text',
			id: 'intervalInfo',
			width: 12,
			label: 'Update Interval',
			value: 'Please enter the amount of time in milliseconds to request new information from the bulb. Set to 0 to disable.',
		},
		{
			type: 'textinput',
			id: 'interval',
			label: 'Update Interval',
			width: 3,
			default: 0
		}
	]
}

// ##########################
// #### Instance Presets ####
// ##########################
instance.prototype.init_presets = function () {
	this.setPresetDefinitions(presets.setPresets(this));
}

// ############################
// #### Instance Variables ####
// ############################
instance.prototype.init_variables = function () {
	this.setVariableDefinitions(variables.setVariables(this));
}

// Setup Initial Values
instance.prototype.checkVariables = function () {
	variables.checkVariables(this);
}

// ############################
// #### Instance Feedbacks ####
// ############################
instance.prototype.init_feedbacks = function (system) {
	this.setFeedbackDefinitions(feedbacks.setFeedbacks(this));
}

// ##########################
// #### Instance Actions ####
// ##########################
instance.prototype.send = function (msg) {
	actions.send(this, msg);
}

instance.prototype.power = function(powerState, transition, options) {
	actions.power(this, powerState, transition, options);
}

instance.prototype.name = function(newName) {
	let self = this;

	self.log('info', 'Setting Bulb Alias to: ' + newName);
	actions.name(this, newName);
}

instance.prototype.actions = function (system) {
	this.setActions(actions.setActions(this));
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;