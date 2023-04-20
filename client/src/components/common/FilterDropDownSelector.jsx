import React from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, OutlinedInput, Chip } from '@mui/material';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 280,
    },
  },
};

const FilterDropDownSelector = ({ label = '', items, selectedItems, renderValueFormatter, onSelectionChange }) => {
  if (!items.length) return null;

  return (
    <FormControl sx={{ m: 1, minWidth: 140, padding: 0, width: 340 }} size="small">
      <InputLabel id={`"filter-${label}-select"`}>{label}</InputLabel>
      <Select
        label={label}
        labelId={`"filter-${label}-select"`}
        id={`"filter-${label}-select"`}
        multiple
        value={selectedItems}
        input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
        renderValue={selected => (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {selected.map((value, index) => (
              <Chip key={index} label={`${renderValueFormatter(value)}`} />
            ))}
          </Box>
        )}
        MenuProps={MenuProps}
        onChange={onSelectionChange}
      >
        {items.map((item, index) => (
          <MenuItem key={index} value={item}>
            {renderValueFormatter(item)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default FilterDropDownSelector;
