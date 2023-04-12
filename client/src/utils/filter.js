import { STRING_TYPE_OPERATORS, NUMBER_TYPE_OPERATORS, BOOLEAN_TYPE_OPERATORS, DATETIME_TYPE_OPERATORS } from '../constants';

export const getOperatorsByTypeName = typeName => {
  if (typeName === 'string') return STRING_TYPE_OPERATORS;
  if (typeName === 'number') return NUMBER_TYPE_OPERATORS;
  if (typeName === 'boolean') return BOOLEAN_TYPE_OPERATORS;
  if (typeName === 'dateTime') return DATETIME_TYPE_OPERATORS;
  // TODO: add new type operators here
  return [];
};

export const buildFilter = (filters = []) =>
  encodeURIComponent(
    filters
      .map(item => {
        if (item.operator.value === 'between' && item.type === 'dateTime') {
          const [start, end] = item.query.split('->');
          return `${item.field}->${item.operator.value}->"${new Date(start).getTime()}->${new Date(end).getTime()}"`;
        } else {
          return `${item.field}->${item.operator.value}->"${item.type === 'dateTime' ? new Date(item.query).getTime() : item.query}"`;
        }
      })
      .join('&'),
  );
