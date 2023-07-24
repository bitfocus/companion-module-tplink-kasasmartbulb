const { Regex } = require('@companion-module/base')


module.exports = {
	getConfigFields() {
		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module controls TP-Link Kasa Smart Light Bulbs.',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Bulb IP',
				width: 4,
				regex: Regex.IP,
			},
			{
				type: 'static-text',
				id: 'dummy1',
				width: 12,
				label: ' ',
				value: ' ',
			},
			{
				type: 'static-text',
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
				width: 4,
			},
			{
				type: 'static-text',
				id: 'dummy1',
				width: 12,
				label: ' ',
				value: ' ',
			},
			{
				type: 'static-text',
				id: 'intervalInfo',
				width: 12,
				label: 'Update Interval',
				value:
					'Please enter the amount of time in milliseconds to request new information from the bulb. Set to 0 to disable.',
			},
			{
				type: 'number',
				id: 'interval',
				label: 'Update Interval',
				width: 3,
				default: 0,
				min: 0,
				max: 9999999
			},
		]
	}
}