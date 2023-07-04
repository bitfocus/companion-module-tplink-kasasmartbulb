const colorsys = require('colorsys')
const { combineRgb } = require('@companion-module/base')

module.exports = {
	// ##########################
	// #### Define Feedbacks ####
	// ##########################
	setFeedbacks: function () {
		let self = this
		let feedbacks = {}

		const foregroundColor = combineRgb(255, 255, 255) // White
		const backgroundColorRed = combineRgb(255, 0, 0) // Red
		const backgroundColorGreen = combineRgb(0, 255, 0) // Green
		const backgroundColorOrange = combineRgb(255, 102, 0) // Orange

		feedbacks.powerState = {
			type: 'boolean',
			name: 'Power State',
			description: 'Indicate if Bulb is On or Off',
			style: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Indicate in X State',
					id: 'option',
					default: 1,
					choices: [
						{ id: 0, label: 'Off' },
						{ id: 1, label: 'On' },
					],
				},
			],
			callback: function (feedback) {
				var opt = feedback.options
				
				if (self.BULBINFO.light_state) {
					if (self.BULBINFO.light_state.on_off === opt.option) {
						return true
					}
				}

				return false
			},
		}

		feedbacks.color = {
			type: 'advanced',
			name: 'Show Bulb Color',
			description: 'Show the current bulb color on the button',
			options: [],
			callback: function () {
				if (
					self.BULBINFO.light_state !== undefined &&
					self.BULBINFO.light_state.hue !== undefined &&
					self.BULBINFO.light_state.hue !== null &&
					self.BULBINFO.light_state.saturation !== undefined &&
					self.BULBINFO.light_state.saturation !== null &&
					self.BULBINFO.light_state.brightness !== undefined &&
					self.BULBINFO.light_state.brightness !== null
				) {
					
					let rgb = colorsys.hsv2Rgb(
						self.BULBINFO.light_state.hue,
						self.BULBINFO.light_state.saturation,
						self.BULBINFO.light_state.brightness
					)

					return { bgcolor: combineRgb(rgb.r, rgb.g, rgb.b) }
				}

				return false
			},
		}

		self.setFeedbackDefinitions(feedbacks)
	},
}
