import { STRING_TYPE_OPERATORS, NUMBER_TYPE_OPERATORS, BOOLEAN_TYPE_OPERATORS, DATETIME_TYPE_OPERATORS } from '../constants';

export const getOperatorsByTypeName = typeName => {
  if (typeName === 'string') return STRING_TYPE_OPERATORS;
  if (typeName === 'number') return NUMBER_TYPE_OPERATORS;
  if (typeName === 'boolean') return BOOLEAN_TYPE_OPERATORS;
  if (typeName === 'dateTime') return DATETIME_TYPE_OPERATORS;
  // TODO
  return [];
};

export const buildFilter = (filters = []) =>
  encodeURIComponent(
    filters.map(item => `${item.field}->${item.operator.value}${item.query !== undefined ? '->"' + item.query + '"' : ''}`).join('&'),
  );
