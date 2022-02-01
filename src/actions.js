const dgram = require('dgram');
const colorsys = require('colorsys');

module.exports = {
	// ######################
	// #### Send Actions ####
	// ######################

	encrypt(buffer, key = 0xAB) {
		for (let i = 0; i < buffer.length; i++) {
			const c = buffer[i]
			buffer[i] = c ^ key
			key = buffer[i]
		}
		return buffer
	},

	decrypt (buffer, key = 0xAB) {
		for (let i = 0; i < buffer.length; i++) {
		  const c = buffer[i]
		  buffer[i] = c ^ key
		  key = c
		}
		return buffer
	  },

	send (i, msg) {
		let self = i;
		return new Promise((resolve, reject) => {
			if (self.config.host) {	
				const client = dgram.createSocket('udp4')
				const message = this.encrypt(Buffer.from(JSON.stringify(msg)))
				client.send(message, 0, message.length, 9999, self.config.host, (err, bytes) => {
					if (err) {
						return reject(err)
					}
					client.on('message', msg => {
						let parsedJSON = {};
						try {
							parsedJSON = JSON.parse(this.decrypt(msg).toString());
							resolve(parsedJSON)
							client.close()
						}
						catch(error) {
							reject(error);
						}
					})
				})
			}
		})
	},

	// Get info about the bulb
	async info (i) {
		let self = i;

		const r = await this.send(i, { system: { get_sysinfo: {} } })
		return r.system.get_sysinfo
	},

	// Set power state of bulb
	async power (i, powerState = true, transition = 0, options = {}) {
		let self = i;

		const info = await this.info(self)
		if (typeof info.relay_state !== 'undefined') {
			return this.send(self, {
				system: {
					set_relay_state: {
					state: powerState ? 1 : 0
					}
				}
			})
		}
		else {
			const r = await this.send(self, {
				'smartlife.iot.smartbulb.lightingservice': {
					transition_light_state: {
					ignore_default: 1,
					on_off: powerState ? 1 : 0,
					transition_period: transition,
					...options
					}
				}
			})
			return r['smartlife.iot.smartbulb.lightingservice'].transition_light_state
		}
	},

	// Set led state of bulb
	led (i, ledState = true) {
		let self = i;

		return this.send(self, { system: { set_led_off: { off: ledState ? 0 : 1 } } })
	},

	// Set the name of bulb
	async name (i, newAlias) {
		let self = i;
		const info = await this.info(i)
		return typeof info.dev_name !== 'undefined'
		? this.send(self, { system: { set_dev_alias: { alias: newAlias } } })
		: this.send(self, { 'smartlife.iot.common.system': { set_dev_alias: { alias: newAlias } } })
	},

	// ##########################
	// #### Instance Actions ####
	// ##########################
	setActions: function (i) {
		var self = i
		var actions = {}

		// ########################
		// #### Power Actions ####
		// ########################

		actions.powerOn = {
			label: 'Power On',
			options: [
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let powerValue = 1;
				let optionsObj = {};
				optionsObj.brightness = 100;
				let transition = action.options.transition;
				self.parseVariables(transition, function (value) {
					transition = value;
				});
				transition = parseInt(transition);
				self.power(1, parseInt(transition), optionsObj);
				setTimeout(self.power.bind(self), parseInt(transition), powerValue);
			}
		}

		actions.powerOff = {
			label: 'Power Off',
			options: [
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let powerValue = 0;
				let optionsObj = {};
				optionsObj.brightness = 0;
				let transition = action.options.transition;
				self.parseVariables(transition, function (value) {
					transition = value;
				});
				transition = parseInt(transition);
				self.power(1, parseInt(transition), optionsObj);
				setTimeout(self.power.bind(self), parseInt(transition), powerValue);
			}
		}

		actions.powerToggle = {
			label: 'Power Toggle',
			options: [
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let powerValue = 0;
				let brightness = 0;

				if ('on_off' in self.BULBINFO.light_state) {
					powerValue = self.BULBINFO.light_state.on_off;
				}

				if (powerValue === 0) {
					powerValue = 1;
					brightness = 100;
				}
				else {
					powerValue = 0;
					brightness = 0;
				}

				self.BULBINFO.light_state.on_off = powerValue;

				let optionsObj = {};
				optionsObj.brightness = brightness;
				let transition = action.options.transition;
				self.parseVariables(transition, function (value) {
					transition = value;
				});
				transition = parseInt(transition);
				self.power(1, parseInt(transition), optionsObj);
				setTimeout(self.power.bind(self), parseInt(transition), powerValue);
			}
		}

		// ########################
		// #### Brightness Actions ####
		// ########################

		actions.brightness = {
			label: 'Set Brightness',
			options: [
				{
					type: 'number',
					label: 'Brightness',
					id: 'brightness',
					tooltip: 'Sets the brightness (0 - 100)',
					min: 0,
					max: 100,
					default: self.CURRENT_BRIGHTNESS,
					step: 1,
					required: true,
					range: true
				},
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let optionsObj = {};
				optionsObj.brightness = action.options.brightness;

				let transition = action.options.transition;
				self.parseVariables(transition, function (value) {
					transition = value;
				});
				transition = parseInt(transition);

				self.power(1, parseInt(transition), optionsObj);
			}
		}

		actions.brightnessUp = {
			label: 'Brightness Up Continuously',
			options: [
				{
					type: 'textinput',
					label: 'Increase Rate (in ms)',
					id: 'rate',
					default: 500,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let rate = action.options.rate;
				self.parseVariables(rate, function (value) {
					rate = value;
				});
				rate = parseInt(rate);

				self.brightness_fader('up', 'start', rate);
			}
		}

		actions.brightnessUpStop = {
			label: 'Brightness Up Stop',
			callback: function (action, bank) {
				self.brightness_fader('up', 'stop', null);
			}
		}

		actions.brightnessDown = {
			label: 'Brightness Down Continuously',
			options: [
				{
					type: 'textinput',
					label: 'Decrease Rate (in ms)',
					id: 'rate',
					default: 500,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let rate = action.options.rate;
				self.parseVariables(rate, function (value) {
					rate = value;
				});
				rate = parseInt(rate);

				self.brightness_fader('down', 'start', rate);
			}
		}

		actions.brightnessDownStop = {
			label: 'Brightness Down Stop',
			callback: function (action, bank) {
				self.brightness_fader('down', 'stop', null);
			}
		}

		// ########################
		// #### Color Actions ####
		// ########################

		actions.colorTemp = {
			label: 'Set White Color Temperature',
			options: [
				{
					type: 'number',
					label: 'Color Temp',
					id: 'colortemp',
					tooltip: 'Sets the color temperature (2500K - 6500K)',
					min: 2500,
					max: 6500,
					default: (self.CURRENT_COLORTEMP < 2500 ? 2500 : self.CURRENT_COLORTEMP),
					step: 5,
					required: true,
					range: true
				},
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let optionsObj = {};
				optionsObj.color_temp = action.options.colortemp;

				let transition = action.options.transition;
				self.parseVariables(transition, function (value) {
					transition = value;
				});
				transition = parseInt(transition);

				self.power(1, parseInt(transition), optionsObj);
			}
		}

		actions.colorPicker = {
			label: 'Set To Color by Picker',
			options: [
				{
					type: 'colorpicker',
					label: 'Color',
					id: 'color',
					default: self.CURRENT_COLOR_DECIMAL
				},
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let optionsObj = {};

				let rgb = self.rgbRev(action.options.color);
				let hsv = colorsys.rgb2Hsv(rgb.r, rgb.g, rgb.b);

				optionsObj.mode = 'normal';
				optionsObj.hue = hsv.h;
				optionsObj.saturation = hsv.s;
				optionsObj.color_temp = 0;
				optionsObj.brightness = hsv.v;

				self.CURRENT_BRIGHTNESS = hsv.v;
				self.setVariable('brightness', hsv.v);

				let transition = action.options.transition;
				self.parseVariables(transition, function (value) {
					transition = value;
				});
				transition = parseInt(transition);

				self.power(1, parseInt(transition), optionsObj);
			}
		}

		actions.colorHsv = {
			label: 'Set To Color by Hue, Saturation, Brightness',
			options: [
				{
					type: 'textinput',
					label: 'Hue (0 - 360)',
					id: 'hue',
					default: self.CURRENT_HUE,
					required: true
				},
				{
					type: 'textinput',
					label: 'Saturation (0 - 100)',
					id: 'saturation',
					default: self.CURRENT_SATURATION,
					required: true
				},
				{
					type: 'textinput',
					label: 'Brightness (0 - 100)',
					id: 'brightness',
					default: self.CURRENT_BRIGHTNESS,
					required: true
				},
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds'
				}
			],
			callback: function (action, bank) {
				let optionsObj = {};

				let hue = action.options.hue;
				self.parseVariables(hue, function (value) {
					hue = value;
				});
				hue = parseInt(hue);
				if (hue < 0) {
					hue = 0;
				}
				else if (hue > 360) {
					hue = 360;
				}

				let saturation = action.options.saturation;
				self.parseVariables(saturation, function (value) {
					saturation = value;
				});
				saturation = parseInt(saturation);
				if (saturation < 0) {
					saturation = 0;
				}
				else if (saturation > 100) {
					saturation = 100;
				}				

				let brightness = action.options.brightness;
				self.parseVariables(brightness, function (value) {
					brightness = value;
				});
				brightness = parseInt(brightness);
				if (brightness < 0) {
					brightness = 0;
				}
				else if (brightness > 100) {
					brightness = 100;
				}

				optionsObj.mode = 'normal';
				optionsObj.hue = hue;
				optionsObj.saturation = saturation;
				optionsObj.color_temp = 0;
				optionsObj.brightness = brightness;
				
				console.log(optionsObj);

				self.CURRENT_BRIGHTNESS = brightness;
				self.setVariable('brightness', brightness);

				let transition = action.options.transition;
				self.parseVariables(transition, function (value) {
					transition = value;
				});
				transition = parseInt(transition);

				self.power(1, parseInt(transition), optionsObj);
			}
		}

		return actions
	}
}