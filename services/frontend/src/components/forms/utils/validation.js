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

        if (Array.isArray(next)) {
            next.forEach(subItem => findDuplicates(subItem, depth + 1));
        } else {
            findDuplicates(next, depth + 1);
        }
    }
    
    data.forEach(item => findDuplicates(item, 0));

    return duplicates;
}