export const formatDecimal = (value, precision = 2) => parseFloat(value).toFixed(precision);

const pad = (num) => num.toString().padStart(2, '0');
export const formatDate = (date) =>
  [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-') +
  ' ' +
  [pad(date.getHours()), pad(date.getMinutes())].join(':');
