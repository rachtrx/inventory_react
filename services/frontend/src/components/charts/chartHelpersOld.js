import { COLORSCALE } from '../../config';

const MAX_ARR_LEN = 10

export const _aggregate = function(...arr) {
    const aggregateArr = []
    arr.forEach((innerArr) => {
        const total = innerArr.reduce((counter, el) => {
            counter += +el.value
            return counter
        }, 0)
        aggregateArr.push(total)
    })
    console.log(aggregateArr);
    return aggregateArr
}

export const _average = function(...arr) {
    const avgArr = []
    arr.forEach((innerArr) => {
        const totalCount = _aggregate(innerArr)
        console.log(totalCount);
        const avg = innerArr.reduce((counter, el) => {
            if (innerArr.length !== 0)
                counter += (el.key * (el.value / totalCount))
            return counter
        }, 0)
        avgArr.push(avg.toFixed(2))
    })
    return avgArr
}

export const _percentageLoan = function(...arr) {
    const percentArr = []
    arr.forEach((innerArr) => {
        const totalCount = _aggregate(innerArr)
        console.log(totalCount);
        const percent = innerArr.reduce((counter, el) => {
            if (el.key !== 'loaned') return counter
            console.log(el);
            return counter += el.value / totalCount * 100
        }, 0)
        percentArr.push(`${(100 - percent).toFixed(2)}%`)
    })
    return percentArr
}

// HELPERS
// FOR DOUGHNUTS
const _filterChartArr = function(arr) {
    const copiedArr = arr.slice()
    if(arr.length > MAX_ARR_LEN) {
        const othersArr = copiedArr.slice(MAX_ARR_LEN - 1)
        copiedArr.splice(MAX_ARR_LEN - 1, copiedArr.length - (MAX_ARR_LEN - 1))
        const otherCount = othersArr.reduce((others, other) => {
            others += other.value
            return others;
        }, 0)
        copiedArr.push({
            'key': 'Others', 
            'value': otherCount
        })
    }
    console.log(copiedArr);
    return copiedArr
}

// FOR REDUCE AGGREGATIONS
const _groupChartArrRank = function(parentArr, childArr) {
    const data = childArr;

    console.log(data);

    // Group data by device type
    const groupedData = {};
    data.forEach(item => {
        if (!groupedData[item.assetType]) {
            groupedData[item.assetType] = [];
        }
        groupedData[item.assetType].push(item);
    });

    // parentArr.forEach((parentType) => console.log(parentType.key))

    const groupedArr = parentArr.map((parentType) => groupedData[parentType.key])

    console.log(groupedArr);

    // Find the maximum length among the arrays to determine the number of elements in each sub-array
    const maxLength = Math.max(...groupedArr.map(arr => arr.length)); // IMPT should go into count instead?

    // Create the result array of arrays
    const result = Array.from({ length: maxLength }, (_, index) =>
    groupedArr.map(arr => arr[index])
    );

    return result
}

// FOR YEARLY AGGREGATIONS
const _groupChartArrYear = function(parentArr, childArr) {
    const data = childArr;

    console.log(data);

    const firstYear = Math.min(...data.map((obj) => +obj.key))

    const currentDate = new Date()
    const currentYear = currentDate.getFullYear();

    let yearArr = [];
    for(let i = firstYear; i <= currentYear; i++) {
        yearArr.push(i)
    }

    // Group data by device type
    const groupedData = {};
    data.forEach(item => {
    if (!groupedData[item.assetType]) {
        groupedData[item.assetType] = [];
    }
    groupedData[item.assetType].push(item);
    });

    console.log(groupedData);

    const groupedArr = parentArr.map((parentDeviceType) => {
        // console.log(parentDeviceType);
        return {
            [parentDeviceType.key]: yearArr.map((year) => {
                // console.log(year);
                const foundChildDeviceType = groupedData[parentDeviceType.key].find((childDeviceType) => {
                    return parseInt(childDeviceType.key) === parseInt(year)
                });
                return foundChildDeviceType?.value || 0;
            })
        }
    })

    return [yearArr, groupedArr]
}

// FOR DOUGHNUTS
export const doughnutData = function(arr, label, isCurrency = false) {

    if(arr.length === 0) return;

    console.log(arr);

    const realArr = _filterChartArr(arr)

    return [{
        labels: realArr.map((component) => String(component.key)),
        datasets: [{
        data: realArr.map((component) => String(component.value)),
        hoverOffset: 4,
        backgroundColor: COLORSCALE.slice(0, realArr.length),
        }]
    },
    {
        title: function(context) {
            return `${context[0].label}`
        },
        label: function(context) {
            if (isCurrency) console.log(context.formattedValue);
            const value = isCurrency ? parseFloat(context.formattedValue.replaceAll(',', '')).toFixed(2) : context.formattedValue;
            return `${label}${value}`;
        },
    }]
}

// FOR AGGREGATION
export const popularModelsData = function(arrs) {

    const [deviceArr, modelArr] = arrs

    if(deviceArr.length === 0 || modelArr.length === 0) return;

    console.log(deviceArr);

    const result = _groupChartArrRank(deviceArr, modelArr)

    console.log(result);

    return [{
        labels: result[0].map((type) => type.assetType),
        datasets: result.map((innerArr, index) => ({
            label: innerArr.map((data) => data?.variantName),
            data: innerArr.map((data) => data?.variantCount || 0),
            backgroundColor: innerArr.map(() => COLORSCALE[index % COLORSCALE.length]),

          })),
    },
    {
        title: function(context) {
            console.log(context);
            const value = context[0].dataset.label[context[0].dataIndex] || '';
            return `Model: ${value}`
        },
        label: function(context) {
            console.log(context);
            return `Count: ${context.formattedValue}`;
        },
    },
    {
        x: {
            ticks: {
                stepSize: 20, // Set the scale increment for the x-axis
            },
            stacked: true
        },
        y: {
            stacked: true,
            min: 0,
            max: 9,
        }
    },
    {
        enable: true, 
        scrollType: 'vertical', 
        scrollSize: 10,
    }]
}

// FOR AGGREGATION
export const popularModelValuesData = function(arrs) {

    const [deviceArr, modelArr] = arrs

    if(deviceArr.length === 0 || modelArr.length === 0) return;

    console.log(modelArr);

    const result = _groupChartArrRank(deviceArr, modelArr)

    console.log(result);

    if (result.length === 0) return;
    
    // TODO ADD TRY EXCEPT?
    return [{
        labels: result[0].map((type) => type.assetType),
        datasets: result.map((innerArr, index) => ({
            label: innerArr.map((data) => data?.variantName),
            data: innerArr.map((data) => data?.value || 0), // TODO check if its value
            backgroundColor: innerArr.map(() => COLORSCALE[index % COLORSCALE.length]),
          })),
    },
    {
        title: function(context) {
            // console.log(context);
            const value = context[0].dataset.label[context[0].dataIndex] || '';
            return `Model: ${value}`
        },
        label: function(context) {
            const value = context.parsed.x.toFixed(2);
            return `Cost: $${value}`;
        },
    },
    {
        x: {
            stacked: true
        },
        y: {
            stacked: true,
            min: 0,
            max: 9
        }
    },
    {
        enable: true, 
        scrollType: 'vertical', 
        scrollSize: 10,
    }]
}

// FOR AGGREGATION
export const topDevicesBudgetData = function(arrs, totalCostPerYear) {

    const [deviceArr, modelArr] = arrs

    if(deviceArr.length === 0 || modelArr.length === 0) return;

    console.log(totalCostPerYear);

    const [yearArr, groupedArr] = _groupChartArrYear(deviceArr, modelArr)

    // console.log(this.totalCostPerYear.find((obj) => obj['key'] === 2009)?.value);

    // console.log(yearArr);
    // console.log(totalCostPerYear);

    const labelsArr = yearArr.map((year) => [`${year}`, `$${parseFloat(totalCostPerYear.year?.value || 0).toFixed(2)}`])

    console.log(labelsArr)

    return [{
        labels: labelsArr,
        datasets: groupedArr.map((deviceType, index) => {
            return {
                label: Object.keys(deviceType)[0],
                data: Object.values(deviceType)[0],
                backgroundColor: COLORSCALE[index % COLORSCALE.length],
            }
        }),
    },
    {
        title: function(context) {
            console.log(context);
            console.log(context[0].dataset.label);
            const value = context[0].dataset.label || '';
            return `Type: ${value}`
        },
        label: function(context) {
            console.log(context);
            const value = context.parsed.y.toFixed(2);
            return `Expenditure: $${value}`;
        },
    },
    {
        x: {
            stacked: true,
            min: 0,
            max: 15
        },
        y: {
            stacked: true
        }
    },
    {
        enable: true, 
        scrollType: 'Horizontal', 
        scrollSize: 16,
    }]
}