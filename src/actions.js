const colorsys = require('colorsys')
const { splitRgb } = require('@companion-module/base')

module.exports = {
	setActions: function () {
		let self = this
		let actions = {}

		// ########################
		// #### Power Actions ####
		// ########################

		actions.powerOn = {
			name: 'Power On',
			options: [
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds',
				},
			],
			callback: async (action) => {
				const powerValue = 1
				const optionsObj = {}
				const transition = parseInt(await self.parseVariablesInString(action.options.transition))
				
				const data = await self.power(powerValue, transition, optionsObj)
				// self.log('debug', `action power on: data - ${JSON.stringify(data)}`)
				self.BULBINFO.light_state.on_off = data.on_off
				self.checkVariables()
			},
		}

		actions.powerOff = {
			name: 'Power Off',
			options: [
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds',
				},
			],
			callback: async function (action) {
				const powerValue = 0
				const optionsObj = {}
				const transition = parseInt(await self.parseVariablesInString(action.options.transition))
				
				const data = await self.power(powerValue, transition, optionsObj)
				// self.log('debug', `action power off: data - ${JSON.stringify(data)}`)
				self.BULBINFO.light_state.on_off = data.on_off
				self.checkVariables()
			},
		}

		actions.powerToggle = {
			name: 'Power Toggle',
			options: [
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds',
				},
			],
			callback: async function (action) {
				let powerValue = 0

				if ('on_off' in self.BULBINFO.light_state) {
					powerValue = self.BULBINFO.light_state.on_off
				}

				if (powerValue === 0) {
					powerValue = 1
				} else {
					powerValue = 0
				}

				self.BULBINFO.light_state.on_off = powerValue

				const optionsObj = {}
				const transition = parseInt(await self.parseVariablesInString(action.options.transition))
				
				const data = await self.power(powerValue, transition, optionsObj)
				// self.log('debug', `action power toggle: data - ${JSON.stringify(data)}`)
				self.checkVariables()
			},
		}

		// ########################
		// #### Brightness Actions ####
		// ########################

		actions.brightness = {
			name: 'Set Brightness',
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
					range: true,
				},
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds',
				},
			],
			callback: async function (action) {
				let optionsObj = {
					brightness: action.options.brightness
				}

				let transition = parseInt(await self.parseVariablesInString(action.options.transition))

				const data = await self.power(1, transition, optionsObj)
				self.BULBINFO.light_state.brightness = data.brightness
				self.checkVariables()
			},
		}

		actions.brightnessUp = {
			name: 'Brightness Up Continuously',
			options: [
				{
					type: 'textinput',
					label: 'Increase Rate (in ms)',
					id: 'rate',
					default: 500,
					tooltip: 'The amount of time in milliseconds',
				},
			],
			callback: async function (action) {
				let rate = parseInt(await self.parseVariablesInString(action.options.rate))

				await self.brightness_fader('up', 'start', rate)
				self.checkVariables()
			},
		}

		actions.brightnessUpStop = {
			name: 'Brightness Up Stop',
			options: [],
			callback: async function () {
				await self.brightness_fader('up', 'stop', null)
				self.checkVariables()
			},
		}

		actions.brightnessDown = {
			name: 'Brightness Down Continuously',
			options: [
				{
					type: 'textinput',
					label: 'Decrease Rate (in ms)',
					id: 'rate',
					default: 500,
					tooltip: 'The amount of time in milliseconds',
				},
			],
			callback: async function (action) {
				let rate = parseInt(await self.parseVariablesInString(action.options.rate))
				
				await self.brightness_fader('down', 'start', rate)
				self.checkVariables()
			},
		}

		actions.brightnessDownStop = {
			name: 'Brightness Down Stop',
			options: [],
			callback: async function () {
				await self.brightness_fader('down', 'stop', null)
				self.checkVariables()
			},
		}

		// ########################
		// #### Color Actions ####
		// ########################

		actions.colorTemp = {
			name: 'Set White Color Temperature',
			options: [
				{
					type: 'number',
					label: 'Color Temp',
					id: 'colortemp',
					tooltip: 'Sets the color temperature (2500K - 9000k)',
					min: 2500,
					max: 9000,
					default: self.CURRENT_COLORTEMP < 2500 ? 2500 : self.CURRENT_COLORTEMP,
					step: 5,
					required: true,
					range: true,
				},
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds',
				},
			],
			callback: async function (action) {
				let optionsObj = {
					color_temp: action.options.colortemp,
				}

				let transition = parseInt(await self.parseVariablesInString(action.options.transition))
				
				const data = await self.power(1, transition, optionsObj)
				self.BULBINFO.light_state.color_temp = data.color_temp
				self.checkVariables()
			},
		}

		actions.colorPicker = {
			name: 'Set To Color by Picker',
			options: [
				{
					type: 'colorpicker',
					label: 'Color',
					id: 'color',
					default: self.CURRENT_COLOR_DECIMAL,
				},
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds',
				},
			],
			callback: async function (action) {
				let rgb = splitRgb(action.options.color)
				let hsv = colorsys.rgb2Hsv(rgb.r, rgb.g, rgb.b)

				const optionsObj = {
					mode: 'normal',
					hue: hsv.h,
					saturation: hsv.s,
					color_temp: 0,
					brightness: hsv.v
				}

				self.CURRENT_BRIGHTNESS = optionsObj.brightness
				self.setVariableValues({ brightness: optionsObj.brightness})

				let transition = parseInt(await self.parseVariablesInString(action.options.transition))
				
				const data = await self.power(1, transition, optionsObj)
				self.BULBINFO.light_state = data
				self.checkVariables()
			},
		}

		actions.colorHsv = {
			name: 'Set To Color by Hue, Saturation, Brightness',
			options: [
				{
					type: 'textinput',
					label: 'Hue (0 - 360)',
					id: 'hue',
					default: self.CURRENT_HUE,
					required: true,
				},
				{
					type: 'textinput',
					label: 'Saturation (0 - 100)',
					id: 'saturation',
					default: self.CURRENT_SATURATION,
					required: true,
				},
				{
					type: 'textinput',
					label: 'Brightness (0 - 100)',
					id: 'brightness',
					default: self.CURRENT_BRIGHTNESS,
					required: true,
				},
				{
					type: 'textinput',
					label: 'Transition Time (in ms)',
					id: 'transition',
					default: 0,
					tooltip: 'The amount of time in milliseconds',
				},
			],
			callback: async (action) => {
				let hue = parseInt(await self.parseVariablesInString(action.options.hue))
				
				if (hue < 0) {
					hue = 0
				} else if (hue > 360) {
					hue = 360
				}

				let saturation = parseInt(await self.parseVariablesInString(action.options.saturation))
				
				if (saturation < 0) {
					saturation = 0
				} else if (saturation > 100) {
					saturation = 100
				}

				let brightness = parseInt(await self.parseVariablesInString(action.options.brightness))
				
				if (brightness < 0) {
					brightness = 0
				} else if (brightness > 100) {
					brightness = 100
				}

				const optionsObj = {
					mode: 'normal',
					hue: hue,
					saturation: saturation,
					color_temp: 0,
					brightness: brightness,
				}


				self.CURRENT_BRIGHTNESS = brightness
				self.setVariableValues({ brightness: brightness })

				let transition = parseInt(await self.parseVariablesInString(action.options.transition))

				const data = await self.power(1, transition, optionsObj)
				self.BULBINFO.light_state = data
				self.checkVariables()
			},
		}

		self.setActionDefinitions(actions)
	},
}
