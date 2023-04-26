export const buildFilter = (filters = []) => (!filters.length ? '' : encodeURIComponent(JSON.stringify(filters)));
