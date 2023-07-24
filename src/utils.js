const { InstanceStatus } = require('@companion-module/base')
const colorsys = require('colorsys')
const dgram = require('dgram')
const { clearIntervalAsync, setIntervalAsync } = require('set-interval-async')

module.exports = {
	getInformation: async function () {
		//Get all information from Device
		var self = this
		self.log('debug', 'getInformation')
		if (self.config.host) {
			let info = await this.info()
			// this.log('debug', `getInformation: info - ${JSON.stringify(info)}`)
			if (info) {
				this.updateStatus(InstanceStatus.Ok)
				self.BULBINFO = info
				try {
					self.updateData()
				} catch (error) {
					self.log('error', 'Error from Bulb: ' + String(error))
					self.log('error', 'Stopping Update interval due to error.')
					await self.stopInterval()
				}

				try {
					self.checkVariables()
				} catch (error) {
					self.log('error', 'Error from Bulb: ' + String(error))
					self.log('error', 'Stopping Update interval due to error.')
					await self.stopInterval()
				}

				try {
					self.checkFeedbacks()
				} catch (error) {
					self.log('error', 'Error from Bulb: ' + String(error))
					self.log('error', 'Stopping Update interval due to error.')
					await self.stopInterval()
				}
			}
		}
	},
	setupInterval: async function () {
		let self = this

		if (self.INTERVAL !== null) {
			await self.stopInterval()
		}

		self.config.interval = parseInt(self.config.interval)

		if (self.config.interval > 0) {
			self.log('info', 'Starting Update Interval.')
			self.INTERVAL = setIntervalAsync(async () => {
				await self.getInformation(self)
			}, self.config.interval)
		}
	},
	stopInterval: async function () {
		let self = this

		self.log('info', 'Stopping Update Interval.')

		if (self.INTERVAL) {
			await clearIntervalAsync(self.INTERVAL)
			self.INTERVAL = null
		}
	},
	brightness_change: async function(direction) {
		let self = this
		self.log('debug', `brightness going: ${direction}`)
		let newLevel = self.CURRENT_BRIGHTNESS
		if (direction === 'up') {
			newLevel++
		} else {
			newLevel--
		}
		self.log('debug', `brightness going from ${self.CURRENT_BRIGHTNESS}  to ${newLevel}`)
		if (newLevel > 100 || newLevel < 0) {
			await self.brightness_fader(direction, 'stop', null)
		} else {
			await self.power(1, 0, { brightness: newLevel })	
			self.CURRENT_BRIGHTNESS = newLevel
			self.setVariableValues({ brightness: newLevel })		
		}
	},
	brightness_fader: async function (direction, mode, rate) {
		let self = this
		self.log('debug', `brightness_fader: direction  - ${direction}, mode - ${mode}, rate - ${rate}`)

		await self.brightness_fader_stop()

		if (mode === 'start') {
			await self.stopInterval() //stop the regular update interval as it will mess with the brightness otherwise
			await self.getInformation()
			self.BRIGHTNESS_INTERVAL = setIntervalAsync(async () => {
				await self.brightness_change(direction)
			}, rate)
		} else {
			await self.getInformation()
			await self.setupInterval() //restart regular update interval if needed
		}
	},
	brightness_fader_stop: async function () {
		let self = this

		if (self.BRIGHTNESS_INTERVAL !== null) {
			await clearIntervalAsync(this.BRIGHTNESS_INTERVAL)
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

	async send(msg) {
		let self = this
		return new Promise((resolve, reject) => {
			if (self.config.host) {
				const client = dgram.createSocket('udp4')
				const message = self.encrypt(Buffer.from(JSON.stringify(msg)))
				client.on('message', (msg) => {
					let parsedJSON = {}
					try {
						parsedJSON = JSON.parse(self.decrypt(msg).toString())
						resolve(parsedJSON)
						client.close()
					} catch (error) {
						reject(error)
						client.close()
					}
				})
				client.on('error', (err) => {
					this.updateStatus(InstanceStatus.ConnectionFailure, err.message)
					this.log('error', 'Network error: ' + err.message)
				})
				client.send(message, 0, message.length, 9999, self.config.host, (err) => {
					if (err) {
						reject(err)
						client.close()
					}
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

	// Set the name of bulb
	async name(newAlias) {
		let self = this
		const info = await self.info()
		return typeof info.dev_name !== 'undefined'
			? await self.send({ system: { set_dev_alias: { alias: newAlias } } })
			: await self.send({ 'smartlife.iot.common.system': { set_dev_alias: { alias: newAlias } } })
	},
}
