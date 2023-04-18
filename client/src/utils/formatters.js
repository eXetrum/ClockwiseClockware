export const formatDecimal = (value, precision = 2) => parseFloat(value).toFixed(precision);

const pad = num => num.toString().padStart(2, '0');
export const formatDate = (value, includeTime = true) => {
  const date = new Date(value);
  return (
    [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-') +
    (includeTime ? ' ' + [pad(date.getHours()), pad(date.getMinutes())].join(':') : '')
  );
};

export const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
