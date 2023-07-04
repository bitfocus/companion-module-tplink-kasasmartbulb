const { InstanceStatus } = require('@companion-module/base')
const colorsys = require('colorsys')
const dgram = require('dgram')

module.exports = {
	getInformation: async function () {
		//Get all information from Device
		var self = this

		if (self.config.host) {
			let info = await this.info()
			if (info) {
				this.updateStatus(InstanceStatus.Ok)
				self.BULBINFO = info
				try {
					self.updateData()
				} catch (error) {
					self.log('error', 'Error from Bulb: ' + String(error))
					self.log('error', 'Stopping Update interval due to error.')
					self.stopInterval()
				}

				try {
					self.checkVariables()
				} catch (error) {
					self.log('error', 'Error from Bulb: ' + String(error))
					self.log('error', 'Stopping Update interval due to error.')
					self.stopInterval()
				}

				try {
					self.checkFeedbacks()
				} catch (error) {
					self.log('error', 'Error from Bulb: ' + String(error))
					self.log('error', 'Stopping Update interval due to error.')
					self.stopInterval()
				}
			}
		}
	},
	setupInterval: function () {
		let self = this

		if (self.INTERVAL !== null) {
			self.stopInterval()
		}

		self.config.interval = parseInt(self.config.interval)

		if (self.config.interval > 0) {
			self.log('info', 'Starting Update Interval.')
			self.INTERVAL = setInterval(self.getInformation.bind(self), self.config.interval)
		}
	},
	stopInterval: function () {
		let self = this

		self.log('info', 'Stopping Update Interval.')

		if (self.INTERVAL) {
			clearInterval(self.INTERVAL)
			self.INTERVAL = null
		}
	},
	brightness_change: async function (direction) {
		let self = this

		let newLevel = self.CURRENT_BRIGHTNESS

		if (direction === 'up') {
			newLevel++
		} else {
			newLevel--
		}

		if (newLevel > 100 || newLevel < 0) {
			self.brightness_fader(direction, 'stop', null)
		} else {
			const data = await self.power(1, 0, { brightness: newLevel })
			self.BULBINFO.light_state.brightness = data.brightness
			self.CURRENT_BRIGHTNESS = newLevel
			self.setVariableValues({ brightness: newLevel })
		}
	},
	brightness_fader: async function (direction, mode, rate) {
		let self = this

		self.brightness_fader_stop()

		if (mode === 'start') {
			self.stopInterval() //stop the regular update interval as it will mess with the brightness otherwise
			self.BRIGHTNESS_INTERVAL = setInterval(self.brightness_change.bind(self), parseInt(rate), direction)
		} else {
			self.setupInterval() //restart regular update interval if needed
		}
	},
	brightness_fader_stop: async function () {
		let self = this

		if (self.BRIGHTNESS_INTERVAL !== null) {
			clearInterval(self.BRIGHTNESS_INTERVAL)
			self.BRIGHTNESS_INTERVAL = null
		}
	},
	updateData: function () {
		let self = this

		let oldHue = self.CURRENT_HUE
		let oldSaturation = self.CURRENT_SATURATION
		let oldColorTemp = self.CURRENT_COLOR_TEMP
		let oldBrightness = self.CURRENT_BRIGHTNESS

		if ('hue' in self.BULBINFO.light_state) {
			self.CURRENT_HUE = parseInt(self.BULBINFO.light_state.hue)
		}

		if ('saturation' in self.BULBINFO.light_state) {
			self.CURRENT_SATURATION = parseInt(self.BULBINFO.light_state.saturation)
		}

		if ('color_temp' in self.BULBINFO.light_state) {
			self.CURRENT_COLORTEMP = parseInt(self.BULBINFO.light_state.color_temp)
		}

		if ('brightness' in self.BULBINFO.light_state) {
			self.CURRENT_BRIGHTNESS = parseInt(self.BULBINFO.light_state.brightness)
		}

		self.CURRENT_COLOR_RGB = colorsys.hsv2Rgb(self.CURRENT_HUE, self.CURRENT_SATURATION, self.CURRENT_BRIGHTNESS)
		self.CURRENT_COLOR_HEX = colorsys.rgbToHex(
			self.CURRENT_COLOR_RGB.r,
			self.CURRENT_COLOR_RGB.g,
			self.CURRENT_COLOR_RGB.b
		)
		self.CURRENT_COLOR_DECIMAL = parseInt(self.CURRENT_COLOR_HEX.replace('#', ''), 16)

		if (
			oldHue !== self.CURRENT_HUE ||
			oldSaturation !== self.CURRENT_SATURATION ||
			oldColorTemp !== self.CURRENT_COLOR_TEMP ||
			oldBrightness !== self.CURRENT_BRIGHTNESS
		) {
			this.setActions() //re export actions for default color options
		}
	},
	encrypt(buffer, key = 0xab) {
		for (let i = 0; i < buffer.length; i++) {
			const c = buffer[i]
			buffer[i] = c ^ key
			key = buffer[i]
		}
		return buffer
	},

	decrypt(buffer, key = 0xab) {
		for (let i = 0; i < buffer.length; i++) {
			const c = buffer[i]
			buffer[i] = c ^ key
			key = c
		}
		return buffer
	},

	send(msg) {
		let self = this
		return new Promise((resolve, reject) => {
			if (self.config.host) {
				const client = dgram.createSocket('udp4')
				const message = self.encrypt(Buffer.from(JSON.stringify(msg)))
				client.send(message, 0, message.length, 9999, self.config.host, (err, bytes) => {
					if (err) {
						return reject(err)
					}
					client.on('message', (msg) => {
						let parsedJSON = {}
						try {
							parsedJSON = JSON.parse(self.decrypt(msg).toString())
							resolve(parsedJSON)
							client.close()
						} catch (error) {
							reject(error)
						}
					})
				})
			}
		})
	},

	// Get info about the bulb
	async info() {
		let self = this

		const r = await self.send({ system: { get_sysinfo: {} } })
		return r.system.get_sysinfo
	},

	// Set power state of bulb
	async power(powerState = true, transition = 0, options = {}) {
		let self = this
		const info = await self.info()
		if (typeof info.relay_state !== 'undefined') {
			return await self.send({
				system: {
					set_relay_state: {
						state: powerState ? 1 : 0,
					},
				},
			})
		} else {
			const r = await self.send({
				'smartlife.iot.smartbulb.lightingservice': {
					transition_light_state: {
						ignore_default: 1,
						on_off: powerState ? 1 : 0,
						transition_period: transition,
						...options,
					},
				},
			})
			return r['smartlife.iot.smartbulb.lightingservice'].transition_light_state
		}
	},

	// Set led state of bulb
	// async led(ledState = true) {
	// 	let self = this

	// 	return await self.send({ system: { set_led_off: { off: ledState ? 0 : 1 } } })
	// },

	// Set the name of bulb
	async name(newAlias) {
		let self = this
		const info = await self.info()
		return typeof info.dev_name !== 'undefined'
			? await self.send({ system: { set_dev_alias: { alias: newAlias } } })
			: await self.send({ 'smartlife.iot.common.system': { set_dev_alias: { alias: newAlias } } })
	},
}
