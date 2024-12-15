export const setFieldError = (obj, path, error) => {
    path.reduce((acc, key, index) => {
      if (index === path.length - 1) {
        acc[key] = error;
      } else {
        acc[key] = acc[key] || {};
      }
      return acc[key];
    }, obj);
  };

export const validateUniqueValues = (data, path) => { // data should be an array
    if (!Array.isArray(data)) throw new Error(`Data must be an array`);
    if (!Array.isArray(path)) throw new Error(`Validation path must be an array`);

    const valueSet = new Set();
    const duplicates = new Set();

    function findDuplicates(item, depth) {
        if (depth === path.length) {
            if (item !== undefined && item !== '') {
                if (valueSet.has(item)) {
                    duplicates.add(item);
                } else {
                    valueSet.add(item);
                }
            }
            return;
        }

        const key = path[depth];
        const next = item[key];

        // console.log(key);
        // console.log(next);

        if (Array.isArray(next)) {
            next.forEach(subItem => findDuplicates(subItem, depth + 1));
        } else {
            findDuplicates(next, depth + 1);
        }
    }
    
    data.forEach(item => findDuplicates(item, 0));

    return duplicates;
}

function excelDateToJSDate(serial) {
    // Adjust for Excel's date system starting on Jan 1, 1900
    const excelStartDate = new Date(Date.UTC(1899, 11, 30));
    return new Date(excelStartDate.getTime() + serial * 86400000); // 86400000 ms in a day
}

function parseDateString(dateStr) {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(Date.UTC(year, month - 1, day)); // month is zero-indexed in JavaScript
}

export function convertExcelDate(value, rowNum=null) {
    if (typeof value === 'number') {
        return excelDateToJSDate(value);
    } else if (typeof value === 'string') {
        return parseDateString(value);
    } else {
        throw new Error(`Invalid date format ${value}${rowNum !== null ? ` at line ${rowNum}` : ''}`);
    }
}

export function compareDates(date1, date2=new Date()) {
    // console.log(date1.setHours(0, 0, 0, 0));
    // console.log(date2.setHours(0, 0, 0, 0));
    return date1.setHours(0, 0, 0, 0) > date2.setHours(0, 0, 0, 0);
}

export function compareStrings(str1, str2) {
    // console.log(str1.trim().toLowerCase());
    // console.log(str2.trim().toLowerCase());
    return str1.trim().toLowerCase() === str2.trim().toLowerCase();
}