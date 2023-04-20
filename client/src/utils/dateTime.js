export const dateToNearestHour = (date = new Date()) => {
  const ms = 1000 * 60 * 60;
  return new Date(Math.ceil(date.getTime() / ms) * ms);
};

export const addHours = (value, hours) => {
  const date = new Date(value);
  const newDate = new Date(date.getTime());
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
};

export const dateRangesOverlap = (start1, end1, start2, end2) => {
  const min = (a, b) => (a < b ? a : b);
  const max = (a, b) => (a > b ? a : b);
  return max(start1, start2) < min(end1, end2);
};

export const alignToDayStart = value => {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const alignToDayEnd = value => {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
};
