module.exports = {
	// ##########################
	// #### Define Variables ####
	// ##########################
	setVariables: function (i) {
		var self = i
		var variables = []

		variables.push({ name: 'sw_ver', label: 'SW Version' });
		variables.push({ name: 'hw_ver', label: 'HW Version' });
		variables.push({ name: 'model', label: 'Model' });
		variables.push({ name: 'deviceId', label: 'Device ID' });
		variables.push({ name: 'oemId', label: 'OEM ID' });
		variables.push({ name: 'hwId', label: 'HW ID' });
		variables.push({ name: 'rssi', label: 'RSSI' });
		variables.push({ name: 'latitude', label: 'Latitude' });
		variables.push({ name: 'longitude', label: 'Longitude' });
		variables.push({ name: 'alias', label: 'Alias' });
		variables.push({ name: 'status', label: 'Status' });
		variables.push({ name: 'description', label: 'Description' });
		variables.push({ name: 'mic_type', label: 'MIC Type' });
		variables.push({ name: 'mic_mac', label: 'MIC MAC' });
		variables.push({ name: 'dev_state', label: 'Dev State' });
		variables.push({ name: 'is_factory', label: 'Is Factory' });
		variables.push({ name: 'disco_ver', label: 'Disco Version' });
		variables.push({ name: 'active_mode', label: 'Active Mode' });
		variables.push({ name: 'is_dimmable', label: 'Is Dimmable' });
		variables.push({ name: 'is_color', label: 'Is Color' });
		variables.push({ name: 'is_variable_color_temp', label: 'Is Variable Color Temp' });

		variables.push({ name: 'powerState', label: 'Power State' });
		variables.push({ name: 'mode', label: 'Mode' });
		variables.push({ name: 'hue', label: 'Hue' });
		variables.push({ name: 'saturation', label: 'Saturation' });
		variables.push({ name: 'color_temp', label: 'Color Temperature' });
		variables.push({ name: 'brightness', label: 'Brightness' });

		variables.push({ name: 'color_rgb', label: 'Current Color RGB' });
		variables.push({ name: 'color_hex', label: 'Current Color Hex' });
		variables.push({ name: 'color_decimal', label: 'Current Color Decimal' });

		return variables
	},

	// #########################
	// #### Check Variables ####
	// #########################
	checkVariables: function (i) {
		try {
			var self = i;

			if ('sw_ver' in self.BULBINFO) {
				self.setVariable('sw_ver', self.BULBINFO.sw_ver);
			}

			if ('hw_ver' in self.BULBINFO) {
				self.setVariable('hw_ver', self.BULBINFO.hw_ver);
			}

			if ('model' in self.BULBINFO) {
				self.setVariable('model', self.BULBINFO.model);
			}

			if ('deviceId' in self.BULBINFO) {
				self.setVariable('deviceId', self.BULBINFO.deviceId);
			}

			if ('oemId' in self.BULBINFO) {
				self.setVariable('oemId', self.BULBINFO.oemId);
			}

			if ('hwId' in self.BULBINFO) {
				self.setVariable('hwId', self.BULBINFO.hwId);
			}

			if ('rssi' in self.BULBINFO) {
				self.setVariable('rssi', self.BULBINFO.rssi);
			}

			if ('latitude_i' in self.BULBINFO) {
				self.setVariable('latitude', self.BULBINFO.latitude_i);
			}

			if ('longitude_i' in self.BULBINFO) {
				self.setVariable('longitude', self.BULBINFO.longitude_i);
			}

			if ('alias' in self.BULBINFO) {
				self.setVariable('alias', self.BULBINFO.alias);
			}

			if ('status' in self.BULBINFO) {
				self.setVariable('status', self.BULBINFO.status);
			}

			if ('description' in self.BULBINFO) {
				self.setVariable('description', self.BULBINFO.description);
			}

			if ('mic_type' in self.BULBINFO) {
				self.setVariable('mic_type', self.BULBINFO.mic_type);
			}

			if ('mic_mac' in self.BULBINFO) {
				self.setVariable('mic_mac', self.BULBINFO.mic_mac);
			}

			if ('dev_state' in self.BULBINFO) {
				self.setVariable('dev_state', self.BULBINFO.dev_state);
			}

			if ('is_factory' in self.BULBINFO) {
				self.setVariable('is_factory', self.BULBINFO.is_factory);
			}

			if ('disco_ver' in self.BULBINFO) {
				self.setVariable('disco_ver', self.BULBINFO.disco_ver);
			}

			if ('active_mode' in self.BULBINFO) {
				self.setVariable('active_mode', self.BULBINFO.active_mode);
			}

			if ('is_dimmable' in self.BULBINFO) {
				self.setVariable('is_dimmable', self.BULBINFO.is_dimmable);
			}

			if ('is_color' in self.BULBINFO) {
				self.setVariable('is_color', self.BULBINFO.is_color);
			}

			if ('is_variable_color_temp' in self.BULBINFO) {
				self.setVariable('is_variable_color_temp', self.BULBINFO.is_variable_color_temp);
			}

			if ('on_off' in self.BULBINFO.light_state) {
				self.setVariable('powerState', self.BULBINFO.light_state.on_off);
			}

			if ('mode' in self.BULBINFO.light_state) {
				self.setVariable('mode', self.BULBINFO.light_state.mode);
			}

			if ('hue' in self.BULBINFO.light_state) {
				self.setVariable('hue', self.BULBINFO.light_state.hue);
			}

			if ('saturation' in self.BULBINFO.light_state) {
				self.setVariable('saturation', self.BULBINFO.light_state.saturation);
			}

			if ('color_temp' in self.BULBINFO.light_state) {
				self.setVariable('color_temp', self.BULBINFO.light_state.color_temp);
			}

			if ('brightness' in self.BULBINFO.light_state) {
				self.setVariable('brightness', self.BULBINFO.light_state.brightness);
			}

			self.setVariable('color_rgb', self.CURRENT_COLOR_RGB.r + ',' + self.CURRENT_COLOR_RGB.g + ',' + self.CURRENT_COLOR_RGB.b);
			self.setVariable('color_hex', self.CURRENT_COLOR_HEX);
			self.setVariable('color_decimal', self.CURRENT_COLOR_DECIMAL);
		}
		catch(error) {
			if (String(error).indexOf('Cannot use \'in\' operator to search') === -1) {
				self.log('error', 'Error from Bulb: ' + String(error));
			}
		}
	}
}
