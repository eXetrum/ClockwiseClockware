import React, { useState, useEffect, useCallback } from 'react';
import { Stack, TextField } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { formatDate } from '../../utils';

const DateTimeRangePicker = ({ label, onChange }) => {
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date());

  useEffect(() => {
    onChange(`${formatDate(startDateTime)}->${formatDate(endDateTime)}`);
  }, [startDateTime, endDateTime, onChange]);

  const onStartDateTimeChange = useCallback(async value => {
    const newStartDateTime = new Date(value).getTime();
    if (!isNaN(newStartDateTime)) setStartDateTime(formatDate(newStartDateTime));
  }, []);

  const onEndDateTimeChange = useCallback(async value => {
    const newEndDateTime = new Date(value).getTime();
    if (!isNaN(newEndDateTime)) setEndDateTime(formatDate(newEndDateTime));
  }, []);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack justifyContent="center" alignItems="center" spacing={2} sx={{ mb: 1 }}>
        <DateTimePicker
          label={`${label}=>Open`}
          renderInput={props => <TextField size="small" style={{ width: 200 }} {...props} />}
          views={['year', 'month', 'day', 'hours']}
          onChange={onStartDateTimeChange}
          ampm={false}
          value={startDateTime}
        />
        <DateTimePicker
          label={`${label}<=Close`}
          renderInput={props => <TextField size="small" style={{ width: 200 }} {...props} />}
          views={['year', 'month', 'day', 'hours']}
          onChange={onEndDateTimeChange}
          ampm={false}
          value={endDateTime}
        />
      </Stack>
    </LocalizationProvider>
  );
};

export default DateTimeRangePicker;
