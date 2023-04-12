/* eslint-disable */
import React, { useState, useEffect, useMemo } from 'react';
import { styled, Container, Stack, Paper, FormControl, InputLabel, MenuItem, Select, TextField, Switch, Button, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';

import { getOperatorsByTypeName, PRNG } from '../../utils';
import { OPERATORS_WITHOUT_QUERY } from '../../constants';

const ListItem = styled('li')(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const DataGridFilterContainer = ({ columns = [], filters = [], onApply, onDelete }) => {
  const visibleColumns = useMemo(() => {
    const alreadyFilteredFields = filters.map(item => item.field);
    return columns
      .map(col => {
        if (col.type === undefined) col.type = 'string';
        if (col.filterable === undefined) col.filterable = true;
        return col;
      })
      .filter(col => col.filterable && alreadyFilteredFields.indexOf(col.field) === -1);
  }, [columns, filters]);

  const [selectedColumnIndex, setSelectedColumnIndex] = useState(0);
  const [selectedOperatorIndex, setSelectedOperatorIndex] = useState(0);
  const [selectedTypeOperators, setSelectedTypeOperators] = useState([]);
  const [queryText, setQueryText] = useState('');

  useEffect(() => {
    if (visibleColumns.length) {
      setSelectedTypeOperators(getOperatorsByTypeName(visibleColumns[selectedColumnIndex].type));
    }
  }, [visibleColumns, selectedColumnIndex]);

  console.log('visibleColumns: ', visibleColumns, visibleColumns[selectedColumnIndex]);

  return (
    <>
      {visibleColumns.length ? (
        <Container maxWidth="sm">
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
            <FormControl sx={{ m: 1, minWidth: 120, padding: 0 }} size="small">
              <InputLabel id="filter-column-select">Column</InputLabel>
              <Select
                label="Column"
                labelId="filter-column-select"
                id="filter-column-select"
                value={visibleColumns[selectedColumnIndex].field}
                onChange={({ target: { value } }) => {
                  const idx = visibleColumns.map(col => col.field).indexOf(value);
                  setSelectedColumnIndex(idx);
                  setSelectedTypeOperators(getOperatorsByTypeName(visibleColumns[idx].type));
                  setSelectedOperatorIndex(0);
                  setQueryText('');
                }}
              >
                {visibleColumns.map((col, index) => (
                  <MenuItem key={index} value={col.field}>
                    {col.headerName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedColumnIndex !== -1 && selectedTypeOperators.length ? (
              <>
                <FormControl sx={{ m: 1, minWidth: 120, padding: 0 }} size="small">
                  <InputLabel id="filter-operator-select">Operator</InputLabel>
                  <Select
                    label="Operator"
                    labelId="filter-operator-select"
                    id="filter-operator-select"
                    value={selectedTypeOperators[selectedOperatorIndex].value}
                    onChange={({ target: { value } }) =>
                      setSelectedOperatorIndex(selectedTypeOperators.map(operator => operator.value).indexOf(value))
                    }
                  >
                    {selectedTypeOperators.map(({ name, value }, idx) => (
                      <MenuItem key={idx} value={value}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {!OPERATORS_WITHOUT_QUERY.includes(selectedTypeOperators[selectedOperatorIndex].value) ? (
                  <>
                    {['number', 'string'].includes(visibleColumns[selectedColumnIndex].type) ? (
                      <TextField
                        size="small"
                        label="Value"
                        variant="outlined"
                        placeholder="Filter value"
                        type={visibleColumns[selectedColumnIndex].type === 'number' ? 'number' : 'text'}
                        value={queryText}
                        onChange={({ target: { value } }) => setQueryText(value)}
                      />
                    ) : null}
                    {visibleColumns[selectedColumnIndex].type === 'boolean' ? (
                      <Stack direction="row" justifyContent="center" alignItems="center">
                        {queryText === 'false' ? <CloseIcon /> : null}
                        <Switch
                          sx={{ m: 1 }}
                          checked={queryText === 'true'}
                          onChange={({ target: { checked } }) => setQueryText(checked ? 'true' : 'false')}
                        />
                        {queryText === 'true' ? <CheckIcon /> : null}
                      </Stack>
                    ) : null}
                    {visibleColumns[selectedColumnIndex].type === 'dateTime' ? (
                      <Stack direction="row" justifyContent="center" alignItems="center">
                        DATE_OPERATORS
                      </Stack>
                    ) : null}
                  </>
                ) : null}

                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  disabled={!OPERATORS_WITHOUT_QUERY.includes(selectedTypeOperators[selectedOperatorIndex].value) && !queryText}
                  onClick={() => {
                    onApply({
                      key: PRNG(-1e10, 1e10),
                      field: visibleColumns[selectedColumnIndex].field,
                      headerName: visibleColumns[selectedColumnIndex].headerName,
                      type: visibleColumns[selectedColumnIndex].type,
                      operator: { ...selectedTypeOperators[selectedOperatorIndex] },
                      ...(!OPERATORS_WITHOUT_QUERY.includes(selectedTypeOperators[selectedOperatorIndex].value) && { query: queryText }),
                    });

                    setSelectedColumnIndex(0);
                    setSelectedOperatorIndex(0);
                    setQueryText('');
                  }}
                >
                  Apply
                </Button>
              </>
            ) : null}
          </Stack>
        </Container>
      ) : null}
      {filters.length ? (
        <Paper
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            listStyle: 'none',
            p: 0.5,
            m: 0,
            mb: 0.5,
          }}
          component="ul"
        >
          {filters.map((item, idx) => {
            return (
              <ListItem key={item.key}>
                <Chip
                  label={`${item.headerName} ${item.operator.name}` + (item.query === undefined ? '' : `\`${item.query}\``)}
                  color="primary"
                  onDelete={() => onDelete(item)}
                />
              </ListItem>
            );
          })}
        </Paper>
      ) : null}
    </>
  );
};

export default DataGridFilterContainer;
