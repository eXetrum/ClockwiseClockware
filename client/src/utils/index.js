export * from './error';
export * from './dateTime';
export * from './token';
export * from './validators';
export * from './formatters';
export * from './filter';

export const PRNG = (min, max) => Math.trunc(Math.random() * (max - min) + min);
