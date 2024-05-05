const doughnutOptions = {
	topDevicesByCount: {
		label: "Count: ",
		title: "Total Devices"
	},
	topDevicesByValue: {
		label: "Value: $",
		title: "Total Value"
	},
	devicesStatus: {
		label: "Count: ",
		title: "Availability"
	},
	users: {
		label: "Users: ",
		title: "Total Users"
	},
	usersLoan: {
		label: "Devices: ",
		title: "Total Devices"
	}, 
	devicesAge: {
		label: "Count: ",
		title: "Average Age"
	}
}

export const getDoughnutOptions = function(type, aggValue, isCurrency=false) {
	const { label='', title='Dev In Progress' } = doughnutOptions[type] || {}
	return {
		plugins: {
				tooltip: {
						enabled: true,
						callbacks: {
								title: function(context) {
										return `${context[0].label}`
								},
								label: function(context) {
										if (isCurrency) console.log(context.formattedValue);
										const value = isCurrency ? parseFloat(context.formattedValue.replaceAll(',', '')).toFixed(2) : context.formattedValue;
										return `${label}${value}`;
								},
						}
				},
				legend: {
						display: true,
						position: 'right',
						maxWidth: 120,
						labels: {
								boxWidth: 10
						}
				},
				doughnutLabel: {
						labels: [{
								text: title,
								color: "black",
								font: {
									size: "10",
									weight: "bold"
								}
						},
						{
								text: aggValue,
								color: "black",
								font: {
									size: "13",
									weight: "bold"
								}
						}],
				}
		},
		animation: {
				animateScale: true,
		},
		onHover: (event, elements) => {
			const chartElement = event.native.target;
			if (elements.length > 0) {
				chartElement.style.cursor = 'pointer';
			} else {
				chartElement.style.cursor = 'default';
			}
		}
	}
}

const barOptions = {
	topVariantsByCount: {
		prefixes: {
			titlePrefix: 'Model',
			labelPrefix: 'Count'
		},
		scaleOptions: {
			min: 0,
			max: 9,
			stepSize: 20
		},
		scrollSize: 10,
		displayLegend: false,
	},
	topVariantsByValue: {
		prefixes: {
			titlePrefix: 'Model',
			labelPrefix: 'Cost'
		},
		scaleOptions: {
			min: 0,
			max: 9
		},
		scrollSize: 10,
		displayLegend: false
	},
	costPerYearByAsset: {
		axis: 'x',
		prefixes: {
			titlePrefix: 'Type',
			labelPrefix: 'Expenditure'
		},
		scaleOptions: {
			min: 0,
			max: 15
		},
		scrollSize: 16
	}
}

export const getBarOptions = function(type, isCurrency=false) {
	const { axis='y', prefixes, scaleOptions, scrollSize=null, displayLegend=true } = barOptions[type] || {}
	return {
		layout: {
				padding: 20
		},
		indexAxis: axis,
		scales: getScale(axis, scaleOptions),
		plugins: {
				scrollBar: getScroll(axis, scrollSize),
				legend: {
						display: displayLegend
				},
				tooltip: {
						callbacks: barCallback(axis, prefixes, isCurrency),
				}
		},
		animation: {
				animateScale: true,
		},
		onHover: (event, elements) => {
				const chartElement = event.native.target;
				if (elements.length > 0) {
						chartElement.style.cursor = 'pointer';
				} else {
						chartElement.style.cursor = 'default';
				}
		}
	}
}

const barCallback = function(axis, prefixes={}, isCurrency=false) {

	const { titlePrefix = '', labelPrefix = '' } = prefixes || {};

	return {
		title: function(context) {
			console.log(context);
			const value = context[0].dataset.label[context[0].dataIndex] || '';
			return `${titlePrefix}: ${value}}`
		},
		label: function(context) {
				console.log(context);
				const label = axis === 'x' ? context.parsed.y : context.parsed.x;
				// const label = context.formattedValue
				return `${labelPrefix}: ${isCurrency ? `$${label.toFixed(2)}` : label}`;
		},
	}
}

const getScale = function(axis, scaleOptions={}) {
	const { stepSize = null, min = null, max = null } = scaleOptions || {};
	return {
		x: {
				stacked: true,
				...(min && axis === 'x' ? { min: min } : {}),
				...(max && axis === 'x' ? { max: max } : {}),
				...(stepSize && axis === 'x' ? { ticks: {stepSize: stepSize} } : {})
		},
		y: {
				stacked: true,
				...(min && axis === 'y' ? { min: min } : {}),
				...(max && axis === 'y' ? { max: max } : {}),
				...(stepSize && axis === 'y' ? { ticks: {stepSize: stepSize} } : {})
		}
	}
}

const getScroll = function(axis, scrollSize) {
	return {
		enable: true, 
		scrollType: axis === 'x' ? 'Horizontal' : 'Vertical', 
		scrollSize: scrollSize,
	}
}