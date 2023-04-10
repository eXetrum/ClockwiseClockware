import React from 'react';
import { Chip, ChipDelete } from '@mui/joy';

const FilterItem = ({ text, onDelete }) => {
  return (
    <Chip size="sm" color="primary" endDecorator={<ChipDelete onDelete={onDelete} />}>
      {text}
    </Chip>
  );
};
//kakayajeetohueta
export default FilterItem;
