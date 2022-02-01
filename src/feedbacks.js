const colorsys = require('colorsys');

module.exports = {
	// ##########################
	// #### Define Feedbacks ####
	// ##########################
	setFeedbacks: function (i) {
		var self = i
		var feedbacks = {}

		const foregroundColor = self.rgb(255, 255, 255) // White
		const backgroundColorRed = self.rgb(255, 0, 0) // Red
		const backgroundColorGreen = self.rgb(0, 255, 0) // Green
		const backgroundColorOrange = self.rgb(255, 102, 0) // Orange

		feedbacks.powerState = {
			type: 'boolean',
			label: 'Power State',
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
			callback: function (feedback, bank) {
				var opt = feedback.options
				if (self.BULBINFO.light_state) {
					if (self.BULBINFO.light_state.on_off === opt.option) {
						return true;
					}
				}

				return false
			}
		}

		feedbacks.color = {
			type: 'advanced',
			label: 'Show Bulb Color',
			description: 'Show the current bulb color on the button',
			callback: function (feedback, bank) {
				var opt = feedback.options
				if ('hue"' in self.BULBINFO.light_state) {
					let rgb = colorsys.hsv2Rgb(self.BULBINFO.light_state.hue, self.BULBINFO.light_state.saturation, self.BULBINFO.light_state.brightness)
					return { bgcolor: self.rgb(rgb.r, rgb.g, rgb.b) }
				}

				return false
			}
		}

		return feedbacks
	}
}
