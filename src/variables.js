module.exports = {
	// ##########################
	// #### Define Variables ####
	// ##########################
	setVariables: function () {
		let self = this
		let variables = []

		variables.push({ variableId: 'sw_ver', name: 'SW Version' })
		variables.push({ variableId: 'hw_ver', name: 'HW Version' })
		variables.push({ variableId: 'model', name: 'Model' })
		variables.push({ variableId: 'deviceId', name: 'Device ID' })
		variables.push({ variableId: 'oemId', name: 'OEM ID' })
		variables.push({ variableId: 'hwId', name: 'HW ID' })
		variables.push({ variableId: 'rssi', name: 'RSSI' })
		variables.push({ variableId: 'latitude', name: 'Latitude' })
		variables.push({ variableId: 'longitude', name: 'Longitude' })
		variables.push({ variableId: 'alias', name: 'Alias' })
		variables.push({ variableId: 'status', name: 'Status' })
		variables.push({ variableId: 'description', name: 'Description' })
		variables.push({ variableId: 'mic_type', name: 'MIC Type' })
		variables.push({ variableId: 'mic_mac', name: 'MIC MAC' })
		variables.push({ variableId: 'dev_state', name: 'Dev State' })
		variables.push({ variableId: 'is_factory', name: 'Is Factory' })
		variables.push({ variableId: 'disco_ver', name: 'Disco Version' })
		variables.push({ variableId: 'active_mode', name: 'Active Mode' })
		variables.push({ variableId: 'is_dimmable', name: 'Is Dimmable' })
		variables.push({ variableId: 'is_color', name: 'Is Color' })
		variables.push({ variableId: 'is_variable_color_temp', name: 'Is Variable Color Temp' })

		variables.push({ variableId: 'powerState', name: 'Power State' })
		variables.push({ variableId: 'mode', name: 'Mode' })
		variables.push({ variableId: 'hue', name: 'Hue' })
		variables.push({ variableId: 'saturation', name: 'Saturation' })
		variables.push({ variableId: 'color_temp', name: 'Color Temperature' })
		variables.push({ variableId: 'brightness', name: 'Brightness' })

		variables.push({ variableId: 'color_rgb', name: 'Current Color RGB' })
		variables.push({ variableId: 'color_hex', name: 'Current Color Hex' })
		variables.push({ variableId: 'color_decimal', name: 'Current Color Decimal' })
		self.setVariableDefinitions(variables)
	},

	// #########################
	// #### Check Variables ####
	// #########################
	checkVariables: function () {
		try {
			var self = this
			const variables = {}
			if ('sw_ver' in self.BULBINFO) {
				variables['sw_ver'] =  self.BULBINFO.sw_ver
			}

			if ('hw_ver' in self.BULBINFO) {
				variables['hw_ver'] =  self.BULBINFO.hw_ver
			}

			if ('model' in self.BULBINFO) {
				variables['model'] =  self.BULBINFO.model
			}

			if ('deviceId' in self.BULBINFO) {
				variables['deviceId'] =  self.BULBINFO.deviceId
			}

			if ('oemId' in self.BULBINFO) {
				variables['oemId'] =  self.BULBINFO.oemId
			}

			if ('hwId' in self.BULBINFO) {
				variables['hwId'] =  self.BULBINFO.hwId
			}

			if ('rssi' in self.BULBINFO) {
				variables['rssi'] =  self.BULBINFO.rssi
			}

			if ('latitude_i' in self.BULBINFO) {
				variables['latitude'] =  self.BULBINFO.latitude_i
			}

			if ('longitude_i' in self.BULBINFO) {
				variables['longitude'] =  self.BULBINFO.longitude_i
			}

			if ('alias' in self.BULBINFO) {
				variables['alias'] =  self.BULBINFO.alias
			}

			if ('status' in self.BULBINFO) {
				variables['status'] =  self.BULBINFO.status
			}

			if ('description' in self.BULBINFO) {
				variables['description'] =  self.BULBINFO.description
			}

			if ('mic_type' in self.BULBINFO) {
				variables['mic_type'] =  self.BULBINFO.mic_type
			}

			if ('mic_mac' in self.BULBINFO) {
				variables['mic_mac'] =  self.BULBINFO.mic_mac
			}

			if ('dev_state' in self.BULBINFO) {
				variables['dev_state'] =  self.BULBINFO.dev_state
			}

			if ('is_factory' in self.BULBINFO) {
				variables['is_factory'] =  self.BULBINFO.is_factory
			}

			if ('disco_ver' in self.BULBINFO) {
				variables['disco_ver'] =  self.BULBINFO.disco_ver
			}

			if ('active_mode' in self.BULBINFO) {
				variables['active_mode'] =  self.BULBINFO.active_mode
			}

			if ('is_dimmable' in self.BULBINFO) {
				variables['is_dimmable'] =  self.BULBINFO.is_dimmable
			}

			if ('is_color' in self.BULBINFO) {
				variables['is_color'] =  self.BULBINFO.is_color
			}

			if ('is_variable_color_temp' in self.BULBINFO) {
				variables['is_variable_color_temp'] =  self.BULBINFO.is_variable_color_temp
			}

			if ('on_off' in self.BULBINFO.light_state) {
				variables['powerState'] =  self.BULBINFO.light_state.on_off
			}

			if ('mode' in self.BULBINFO.light_state) {
				variables['mode'] =  self.BULBINFO.light_state.mode
			}

			if ('hue' in self.BULBINFO.light_state) {
				variables['hue'] =  self.BULBINFO.light_state.hue
			}

			if ('saturation' in self.BULBINFO.light_state) {
				variables['saturation'] =  self.BULBINFO.light_state.saturation
			}

			if ('color_temp' in self.BULBINFO.light_state) {
				variables['color_temp'] =  self.BULBINFO.light_state.color_temp
			}

			if ('brightness' in self.BULBINFO.light_state) {
				variables['brightness'] =  self.BULBINFO.light_state.brightness
			}

			variables['color_rgb'] =  self.CURRENT_COLOR_RGB.r + ',' + self.CURRENT_COLOR_RGB.g + ',' + self.CURRENT_COLOR_RGB.b
			
			variables['color_hex'] =  self.CURRENT_COLOR_HEX
			variables['color_decimal'] =  self.CURRENT_COLOR_DECIMAL
		
			this.setVariableValues(variables)
			this.checkFeedbacks('color', 'powerState')
		} catch (error) {
			self.log('error', error)
			if (String(error).indexOf("Cannot use 'in' operator to search") === -1) {
				self.log('error', 'Error from Bulb: ' + String(error))
			}
		}
	},
}
