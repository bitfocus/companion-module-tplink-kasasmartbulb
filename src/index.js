const { InstanceBase, InstanceStatus, runEntrypoint } = require('@companion-module/base')
const actions = require('./actions')
const variables = require('./variables')
const feedbacks = require('./feedbacks')
const presets = require('./presets')
const utils = require('./utils')
const configFields = require('./configFields')

class KasaBulbInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...configFields,
			...actions,
			...feedbacks,
			...variables,
			...presets,
			...utils
		})

		this.INTERVAL = null //used for polling device
		this.BULBINFO = {
			light_state: {
			hue: null,
			saturation: null,
			brightness: null,
		}}

		this.BRIGHTNESS_INTERVAL = null //used for brightness up/down actions

		this.CURRENT_HUE = 50
		this.CURRENT_SATURATION = 100
		this.CURRENT_COLORTEMP = 3200
		this.CURRENT_BRIGHTNESS = 100

		this.CURRENT_COLOR_RGB = { r: 255, g: 213, b: 2 }
		this.CURRENT_COLOR_HEX = '#ffd503'
		this.CURRENT_COLOR_DECIMAL = 16766211

	}

	async init(config) {
		this.updateStatus(InstanceStatus.Connecting)
		this.configUpdated(config)
	}

	async destroy() {
		this.log('info', 'destroying')
		this.stopInterval()
		this.brightness_fader_stop()
		this.log('debug', 'destroyed')
	}

	async configUpdated(config) {
		this.log('info', 'config updating')
		if (config) {
			this.config = config
		}

		if (this.config.alias !== '') {
			if (this.config.host) {
				this.name(this.config.alias)
			}
		}

		this.getInformation()
		this.setupInterval()
		this.setActions()
		this.setPresets()
		this.setVariables()
		this.setFeedbacks()
		
		this.checkVariables()

		this.updateStatus(InstanceStatus.Ok)
		this.log('info', 'config updated')
	}
}

runEntrypoint(KasaBulbInstance, [])
