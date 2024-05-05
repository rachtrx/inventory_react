const chroma = require('chroma-js');

const baseColors = ['#FF6384', '#19C4A6', '#36A2EB', '#FFA53F', '#FFF58F', '#B582D3']

const numberOfAdditionalColors = 5;
const COLORSCALE = chroma.scale(baseColors).colors(numberOfAdditionalColors);

class Chart { // DOUGHNUTS
    
    MAX_ARR_LEN = 10

	constructor(arr, isCurrency=false) {
		this.arr = arr;
        this.isCurrency = isCurrency
        this.chartShape = 'doughnut'
        this.convertDataToNumeric()
	}

    convertDataToNumeric = function() {
        this.arr = this.arr.map((el) => ({ ...el, data: this.isCurrency ? parseFloat(el.data) : parseInt(el.data) }))
        // console.log(this.arr);
    }

    addSuffixToLabels = function(suffix) {
        this.arr = this.arr.map((el) => ({ ...el, label: String(el.label) + suffix }))
    }

	sumValue = function(isCurrency=false) {
		const rawSum = this.arr.reduce((counter, el) => {
			counter += +el.data
			return counter
		}, 0)
        if (!isCurrency) return String(rawSum);
        return rawSum.toFixed(2);
	}
	
	avgValue = function() {
		const totalCount = parseFloat(this.sumValue(this.arr))
		// console.log(totalCount);
		return this.arr.reduce((counter, el) => {
			if (this.arr.length !== 0){
                // console.log(el);
				counter += (+el.label * (+el.data / totalCount))
            }
            // console.log(counter);
			return counter
		}, 0).toFixed(2)
	}
	
	pctValue = function(labels) {
		const totalCount = parseFloat(this.sumValue(this.arr))
		// console.log(totalCount);
		return this.arr.reduce((counter, el) => {
			if (!labels.includes(el.label)) return counter
			// console.log(el);
			return counter += el.data / totalCount * 100
		}, 0).toFixed(2)
	}

    reduceDataSize() {
        if (this.arr.length > this.MAX_ARR_LEN) {
            // Calculate the sum of the data for the excess elements
            const otherData = this.arr.slice(this.MAX_ARR_LEN).reduce((sum, item) => sum + item.data, 0);
    
            // Create a new array with the limited number of elements and an additional "Others" element
            this.arr = [
                ...this.arr.slice(0, this.MAX_ARR_LEN - 1),
                { label: 'Others', data: otherData }
            ];
        }
    }

    addSuffixToLabels = function(suffix) {
        this.arr = this.arr.map((el) => ({ ...el, label: String(el.label) + suffix }))
    }

    getData = function() {
		return {
			labels: this.arr.map((item) => String(item.label)),
			datasets: [{
				data: this.arr.map((item) => item.data),
				hoverOffset: 4,
				backgroundColor: COLORSCALE.slice(0, this.arr.length),
			}]
		}
	}
}

class GroupChart extends Chart {

    constructor(arr, isCurrency) {
		super(arr, isCurrency);
        this.chartShape = 'bar'
    }

	groupData = function() {
		// RETURNS AN OBJECT
		const groupedData = {};
	
		this.arr.forEach(item => {
			if (!groupedData[item.group]) {
				groupedData[item.group] = [];
			}
			groupedData[item.group].push(item);
		});
		return groupedData
	}

    aggregateDataByGroup = function(isCurrency) {
		this.aggGroupedData = this.arr.reduce((acc, item) => {
			const { group, data } = item
			const floatData = parseFloat(data)
	
			if (!isNaN(floatData)) {
					acc[group] = (acc[group] || 0) + floatData; // Add the value to the accumulator for the year
			}
	
			return acc;
		}, {});

        if (this.isCurrency) {
            this.aggGroupedData = Object.entries(this.aggGroupedData).reduce((acc, [key, value]) => {
                acc[key] = parseFloat(value.toFixed(2));
                return acc;
            }, {});
        }
	}

    getData = () => {
		return {
			labels: this.groups,
			datasets: this.finalArr.map((arr, idx) => ({
				label: arr.map((item) => item?.label),
				data: arr.map((item) => item?.data || 0),
				backgroundColor: arr.map(() => COLORSCALE[idx % COLORSCALE.length]),
			}))
		}
	}
}

class OneToOneChart extends GroupChart {

    constructor(arr, isCurrency=false) {
		super(arr, isCurrency);
	}

	generateData = function() {
		const groupedData = this.groupData();
		const maxLength = Math.max(...Object.values(groupedData).map(arr => arr.length));
	
		this.finalArr = [];
        this.groups = [];
        for (let i = 0; i < maxLength; i++) {
            let arr = [];
            for (const valArr of Object.values(groupedData)) {
                const target = valArr[i]
                arr.push(target || undefined);
                if (i === 0 && target) { // Also check if valArr[i] exists before accessing its 'group' property
                    this.groups.push(target.group);
                }
            }
            this.finalArr.push(arr);
        }
	}
}

class ManyToManyChart extends GroupChart { // NEED TO ALWAYS CHECK IF FOUND... 

	constructor(arr, isCurrency=false, defVal=0) {
		super(arr, isCurrency);
		this.defVal = defVal;
	}

	generateData = function(byYear=true) {
		
        // console.log(this.arr);
		const groupedData = this.groupData()

		const allLabels = this.arr.map((obj) => obj.label)
        // console.log(allLabels);
		const uniqueLabelsSet = new Set(allLabels);
		this.labels = [...uniqueLabelsSet];
		
        let years = null;
		if (byYear) {
			const startYear = Math.min(...Object.keys(groupedData));
            years = Array.from({ length: new Date().getFullYear() - startYear + 1 }, (_, i) => startYear + i);
		}

        // console.log("new");
        // console.log(this.arr);
        // console.log(groupedData);
		
		this.finalArr = []
		for (const label of this.labels) {
            // console.log(label);
			let arr = [];
			this.groups = years && years.length > 0 ? years : Object.keys(groupedData);
			for (const group of this.groups) {
                const filteredObjects = groupedData[group] ? groupedData[group].filter(obj => obj.label === label) : [];
                if (filteredObjects.length > 0) {
                    const summedData = filteredObjects.reduce((sum, obj) => sum + obj.data, 0);
                    arr.push({
                        group: group,
                        label: label,
                        data: summedData
                    });
                } else {
                    arr.push({
                        'label': label, 
                        'data': this.defVal, 
                        'group': group
                    })
                }
			}
			this.finalArr.push(arr);
		}
	}

    mapYearToTotalCost = () => {
        this.groups = this.groups.map((year) => [`${year}`, `$${parseFloat(this.aggGroupedData?.year?.value || 0).toFixed(2)}`])
    }
}

// renameNames(type, prefix = '', suffix = '') { // accepts dictionary to map on group
// 	if (type === 'labels') namesArr = this.labels
// 	if (type === 'groups') namesArr = this.groups
// 	// TODO for the most nested label...
	
// 	return namesArr.map((name, index) => {
// 		const currentPrefix = Array.isArray(prefix) ? prefix[index % prefix.length] :
// 							 typeof prefix === 'object' ? prefix[name] || '' : prefix;

// 		const currentSuffix = Array.isArray(suffix) ? suffix[index % suffix.length] :
// 							 typeof suffix === 'object' ? suffix[name] || '' : suffix;

// 		return currentPrefix + name + currentSuffix;
// 	});
// }

module.exports = { Chart, OneToOneChart, ManyToManyChart };