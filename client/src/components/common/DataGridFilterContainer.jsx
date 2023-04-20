import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Stack, FormGroup, TextField, Button, Drawer, Badge } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TuneIcon from '@mui/icons-material/Tune';

import FilterDropDownSelector from './FilterDropDownSelector';

import {
  selectAllMasters,
  selectMasterError,
  selectMasterInitialLoading,
  selectAllCities,
  selectCityError,
  selectCityInitialLoading,
  selectAllWatches,
  selectWatchError,
  selectWatchInitialLoading,
} from '../../store/selectors';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMasters, fetchCities, fetchWatches } from '../../store/thunks';

import { isUnknownOrNoErrorType, alignToDayStart, alignToDayEnd } from '../../utils';
import { ORDER_STATUS, VALID_FILTER_TYPE } from '../../constants';

const validFilterKeys = Object.values(VALID_FILTER_TYPE);

const DataGridFilterContainer = ({ filters = [], onApply }) => {
  const dispatch = useDispatch();

  const masters = useSelector(selectAllMasters);
  const cities = useSelector(selectAllCities);
  const watches = useSelector(selectAllWatches);
  const isInitialLoadingMasters = useSelector(selectMasterInitialLoading);
  const isInitialLoadingCities = useSelector(selectCityInitialLoading);
  const isInitialLoadingWatches = useSelector(selectWatchInitialLoading);
  const errorMaster = useSelector(selectMasterError);
  const errorCity = useSelector(selectCityError);
  const errorWatch = useSelector(selectWatchError);

  const error = useMemo(
    () => (!isUnknownOrNoErrorType(errorMaster) ? errorMaster : !isUnknownOrNoErrorType(errorCity) ? errorCity : errorWatch),
    [errorMaster, errorCity, errorWatch],
  );

  const isInitialLoading = useMemo(
    () => isInitialLoadingMasters && isInitialLoadingCities && isInitialLoadingWatches,
    [isInitialLoadingMasters, isInitialLoadingCities, isInitialLoadingWatches],
  );

  const isComponentReady = useMemo(() => !isInitialLoading && isUnknownOrNoErrorType(error), [isInitialLoading, error]);

  const [isFilterTabOpen, setFilterTabIsOpen] = useState(false);
  const [selectedMasters, setSelectedMasters] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedWatches, setSelectedWatches] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);

  const isApplyFilterBtnEnabled = useMemo(
    () =>
      selectedMasters.length ||
      selectedCities.length ||
      selectedWatches.length ||
      selectedStatuses.length ||
      selectedStartDate ||
      selectedEndDate,
    [selectedMasters, selectedCities, selectedWatches, selectedStatuses, selectedStartDate, selectedEndDate],
  );

  useEffect(() => {
    dispatch(fetchMasters({ limit: -1 }));
    dispatch(fetchCities({ limit: -1 }));
    dispatch(fetchWatches());
  }, [dispatch]);

  useEffect(() => {
    validFilterKeys.forEach(filterType => {
      const idx = filters.findIndex(item => filterType in item);
      if (idx !== -1 && filters[idx][filterType].length) {
        if (filterType === VALID_FILTER_TYPE.FILTER_BY_MASTER) {
          setSelectedMasters(masters.filter(item => filters[idx][filterType].findIndex(id => id === item.id) !== -1));
        }
        if (filterType === VALID_FILTER_TYPE.FILTER_BY_CITY) {
          setSelectedCities(cities.filter(item => filters[idx][filterType].findIndex(id => id === item.id) !== -1));
        }
        if (filterType === VALID_FILTER_TYPE.FILTER_BY_WATCH) {
          setSelectedWatches(watches.filter(item => filters[idx][filterType].findIndex(id => id === item.id) !== -1));
        }
        if (filterType === VALID_FILTER_TYPE.FILTER_BY_STATUS) setSelectedStatuses(filters[idx][filterType]);
        if (filterType === VALID_FILTER_TYPE.FILTER_BY_DATE) {
          const [start, end] = filters[idx][filterType];
          setSelectedStartDate(start);
          setSelectedEndDate(end);
        }
      }
    });
  }, [filters, isComponentReady, masters, cities, watches]);

  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setFilterTabIsOpen(open);
  };

  const applyFilters = useCallback(() => {
    const filters = [];
    if (selectedMasters.length) filters.push({ filterByMaster: selectedMasters.map(item => item.id) });
    if (selectedCities.length) filters.push({ filterByCity: selectedCities.map(item => item.id) });
    if (selectedWatches.length) filters.push({ filterByWatch: selectedWatches.map(item => item.id) });
    if (selectedStatuses.length) filters.push({ filterByStatus: selectedStatuses });
    if (selectedStartDate !== null || selectedEndDate !== null) {
      filters.push({
        filterByDate: [
          selectedStartDate !== null ? alignToDayStart(selectedStartDate).getTime() : null,
          selectedEndDate !== null ? alignToDayEnd(selectedEndDate).getTime() : null,
        ],
      });
    }
    onApply(filters);
  }, [onApply, selectedMasters, selectedCities, selectedWatches, selectedStatuses, selectedStartDate, selectedEndDate]);

  const resetFilters = useCallback(() => {
    setSelectedMasters([]);
    setSelectedCities([]);
    setSelectedWatches([]);
    setSelectedStatuses([]);
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    onApply([]);
  }, [onApply]);

  const onMasterSelectionChange = useCallback(({ target: { value } }) => setSelectedMasters(value), []);
  const onCitySelectionChange = useCallback(({ target: { value } }) => setSelectedCities(value), []);
  const onWatchSelectionChange = useCallback(({ target: { value } }) => setSelectedWatches(value), []);
  const onStatusSelectionChange = useCallback(({ target: { value } }) => setSelectedStatuses(value), []);
  const onStartDateChange = useCallback(value => setSelectedStartDate(value), []);
  const onEndDateChange = useCallback(value => setSelectedEndDate(value), []);

  const masterLabelFormatter = useCallback(value => `${value.name} (${value.email})`, []);
  const cityLabelFormatter = useCallback(value => value.name, []);
  const watchLabelFormatter = useCallback(value => value.name, []);
  const statusLabelFormatter = useCallback(value => value, []);

  return (
    <Container maxWidth="sm" sx={{ mb: 1 }}>
      <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
        <Badge
          badgeContent={filters.length}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          color="secondary"
        >
          <Button size="small" variant="contained" onClick={toggleDrawer(true)}>
            <TuneIcon fontSize="small" /> Filters
          </Button>
        </Badge>

        <Drawer anchor={'right'} open={isFilterTabOpen} onClose={toggleDrawer(false)}>
          <Container sx={{ mt: 25 }}>
            <Stack justifyContent="center" alignItems="center" spacing={2}>
              <FormGroup>
                {isComponentReady ? (
                  <>
                    <FilterDropDownSelector
                      label="Master"
                      items={masters}
                      selectedItems={selectedMasters}
                      renderValueFormatter={masterLabelFormatter}
                      onSelectionChange={onMasterSelectionChange}
                    />
                    <FilterDropDownSelector
                      label="City"
                      items={cities}
                      selectedItems={selectedCities}
                      renderValueFormatter={cityLabelFormatter}
                      onSelectionChange={onCitySelectionChange}
                    />
                    <FilterDropDownSelector
                      label="Watch"
                      items={watches}
                      selectedItems={selectedWatches}
                      renderValueFormatter={watchLabelFormatter}
                      onSelectionChange={onWatchSelectionChange}
                    />
                    <FilterDropDownSelector
                      label="Status"
                      items={Object.values(ORDER_STATUS)}
                      selectedItems={selectedStatuses}
                      renderValueFormatter={statusLabelFormatter}
                      onSelectionChange={onStatusSelectionChange}
                    />
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <Stack direction={'row'} justifyContent="center" alignItems="center" spacing={2} sx={{ mb: 2, mt: 1 }}>
                        <DatePicker
                          label="StartDate from"
                          renderInput={props => <TextField size="small" style={{ width: 165 }} {...props} />}
                          views={['year', 'month', 'day']}
                          onChange={onStartDateChange}
                          ampm={false}
                          value={selectedStartDate}
                        />
                        <DatePicker
                          label="StartDate to"
                          renderInput={props => <TextField size="small" style={{ width: 160 }} {...props} />}
                          views={['year', 'month', 'day']}
                          onChange={onEndDateChange}
                          ampm={false}
                          value={selectedEndDate}
                        />
                      </Stack>
                    </LocalizationProvider>
                  </>
                ) : null}

                <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
                  <Button size="small" variant="contained" onClick={applyFilters} disabled={!isApplyFilterBtnEnabled}>
                    Apply
                  </Button>
                  <Button size="small" variant="contained" onClick={resetFilters} disabled={!filters.length}>
                    Reset
                  </Button>
                </Stack>
              </FormGroup>
            </Stack>
          </Container>
        </Drawer>
      </Stack>
    </Container>
  );
};

export default DataGridFilterContainer;
