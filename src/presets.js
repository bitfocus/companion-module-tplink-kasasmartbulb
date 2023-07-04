const { combineRgb } = require('@companion-module/base')
module.exports = {
	setPresets: function () {
		let self = this
		let presets = []

		const colorWhite = combineRgb(255, 255, 255) // White
		const colorBlack = combineRgb(0, 0, 0) // black
		const colorRed = combineRgb(255, 0, 0) // Red
		const colorGreen = combineRgb(0, 255, 0) // Green
		const colorOrange = combineRgb(255, 102, 0) // Orange

		// ########################
		// #### Power Presets ####
		// ########################

		presets.push({
			type: 'button',
			category: 'Power',
			name: 'Power On',
			style: {
				text: 'Power\\nON',
				size: '18',
				color: colorWhite,
				bgcolor: colorRed,
			},
			steps: [
				{
					down: [
						{
							actionId: 'powerOn',
							options: {
								transition: 1000,
							},
						},
					],
					up: []
				},
			],
			feedbacks: [
				{
					feedbackId: 'powerState',
					options: {
						option: 1,
					},
					style: {
						color: colorBlack,
						bgcolor: colorGreen,
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Power',
			name: 'Power Off',
			style: {
				text: 'Power\\nOFF',
				size: '18',
				color: colorBlack,
				bgcolor: colorGreen,
			},
			steps: [
				{
					down: [
						{
							actionId: 'powerOff',
							options: {
								transition: 1000,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'powerState',
					options: {
						option: 0,
					},
					style: {
						color: colorWhite,
						bgcolor: colorRed,
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Power',
			name: 'Power Toggle',
			style: {
				text: 'Power\\nTOGGLE',
				size: '18',
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'powerToggle',
							options: {
								transition: 1000,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'powerState',
					options: {
						option: 1,
					},
					style: {
						color: colorBlack,
						bgcolor: colorGreen,
					},
				},
				{
					feedbackId: 'powerState',
					options: {
						option: 0,
					},
					style: {
						color: colorWhite,
						bgcolor: colorRed,
					},
				},
			],
		})

		presets.push({
			type: 'button',
			category: 'Brightness',
			name: 'Brightness Up',
			style: {
				text: 'Brightness Up',
				size: '18',
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'brightnessUp',
							options: {
								rate: 50,
							},
						},
					],
					up: [
						{
							actionId: 'brightnessUpStop',
						},
					],
				},
			],
			feedbacks: []
		})

		presets.push({
			type: 'button',
			category: 'Brightness',
			name: 'Brightness Down',
			style: {
				text: 'Brightness Down',
				size: '18',
				color: colorWhite,
				bgcolor: colorBlack,
			},
			steps: [
				{
					down: [
						{
							actionId: 'brightnessDown',
							options: {
								rate: 50,
							},
						},
					],
					up: [
						{
							actionId: 'brightnessDownStop',
						},
					],
				},
			],
			feedbacks: []
		})

		for (let i = 10; i <= 100; i = i + 10) {
			presets.push({
				type: 'button',
				category: 'Brightness',
				name: 'Brightness ' + i + '%',
				style: {
					text: i + '%',
					size: '18',
					color: colorWhite,
					bgcolor: colorBlack,
				},
				steps: [
					{
						down: [
							{
								actionId: 'brightness',
								options: {
									brightness: i,
									transition: 0,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [],
			})
		}

		let PRESETS_COLORTEMPS = [2700, 3000, 3200, 3400, 4000, 5000, 6000]

		for (let i = 0; i < PRESETS_COLORTEMPS.length; i++) {
			presets.push({
				type: 'button',
				category: 'Color Temperature',
				name: 'Color Temp ' + PRESETS_COLORTEMPS[i] + 'K',
				style: {
					text: PRESETS_COLORTEMPS[i] + 'K',
					size: '18',
					color: colorWhite,
					bgcolor: colorBlack,
				},
				steps: [
					{
						down: [
							{
								actionId: 'colorTemp',
								options: {
									colortemp: PRESETS_COLORTEMPS[i],
									transition: 0,
								},
							},
						],
						up: [],
					},
				],
				feedbacks: [],
			})
		}

		presets.push({
			type: 'button',
			category: 'Set Colors',
			name: 'Red',
			style: {
				text: '',
				size: '18',
				color: colorWhite,
				bgcolor: combineRgb(255, 0, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'colorPicker',
							options: {
								color: combineRgb(255, 0, 0),
								transition: 0,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		})

		presets.push({
			type: 'button',
			category: 'Set Colors',
			name: 'Green',
			style: {
				text: '',
				size: '18',
				color: colorWhite,
				bgcolor: combineRgb(0, 255, 0),
			},
			steps: [
				{
					down: [
						{
							actionId: 'colorPicker',
							options: {
								color: combineRgb(0, 255, 0),
								transition: 0,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		})

		presets.push({
			type: 'button',
			category: 'Set Colors',
			name: 'Blue',
			style: {
				text: '',
				size: '18',
				color: colorWhite,
				bgcolor: combineRgb(0, 0, 255),
			},
			steps: [
				{
					down: [
						{
							actionId: 'colorPicker',
							options: {
								color: combineRgb(0, 0, 255),
								transition: 0,
							},
						},
					],
					up: [],
				},
			],
			feedbacks: [],
		})

		this.setPresetDefinitions(presets)
	},
}
