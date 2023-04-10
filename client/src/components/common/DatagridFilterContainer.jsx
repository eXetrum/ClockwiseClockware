import React from 'react';
import { Select, Option, Chip, ChipDelete } from '@mui/joy';

/*export default function SelectBasic() {
  return (
    <Select defaultValue="dog">
      <Option value="dog">Dog</Option>
      <Option value="cat">Cat</Option>
    </Select>
  );
}
<Chip size="sm" color="primary" endDecorator={<ChipDelete onDelete={onDelete} />}>
      {text}
    </Chip>*/

const DatagridFilterContainer = ({ columns = [] }) => {
  if (!columns.length) return null;
  const filters = [];

  return (
    <>
      <Select placeholder="Please select filter..." size="sm" variant="outlined">
        {columns
          .filter(col => col.filterable === undefined || col.filterable === true)
          .map((col, idx) => (
            <Option key={idx} value={col.field}>
              {col.field}
            </Option>
          ))}
      </Select>
    </>
  );
};

export default DatagridFilterContainer;
