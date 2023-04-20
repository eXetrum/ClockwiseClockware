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
import { ORDER_STATUS, FILTER_TYPE } from '../../constants';

const validFilterNames = Object.values(FILTER_TYPE);
const orderStatusMap = Object.values(ORDER_STATUS).map(name => ({ id: name, name }));

const initEmptyFilters = () => Object.fromEntries(validFilterNames.map(name => [name, name === FILTER_TYPE.BY_DATE ? [null, null] : []]));

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
  const [selectedFilters, setSelectedFilters] = useState(initEmptyFilters());

  const isApplyFilterBtnEnabled = useMemo(
    () =>
      validFilterNames
        .map(name =>
          name === FILTER_TYPE.BY_DATE ? selectedFilters[name].filter(item => item !== null).length : selectedFilters[name].length,
        )
        .some(b => b),
    [selectedFilters],
  );

  useEffect(() => {
    dispatch(fetchMasters({ limit: -1 }));
    dispatch(fetchCities({ limit: -1 }));
    dispatch(fetchWatches());
  }, [dispatch]);

  useEffect(() => {
    const mapping = {
      [FILTER_TYPE.BY_MASTER]: masters,
      [FILTER_TYPE.BY_CITY]: cities,
      [FILTER_TYPE.BY_WATCH]: watches,
      [FILTER_TYPE.BY_STATUS]: orderStatusMap,
    };
    validFilterNames.forEach(filterType => {
      const idx = filters.findIndex(item => filterType in item);
      if (idx !== -1 && filters[idx][filterType].length) {
        if (filterType === FILTER_TYPE.BY_DATE) {
          setSelectedFilters(prev => ({ ...prev, [filterType]: filters[idx][filterType] }));
        } else {
          setSelectedFilters(prev => ({
            ...prev,
            [filterType]: mapping[filterType].filter(item => filters[idx][filterType].findIndex(id => id === item.id) !== -1),
          }));
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
    validFilterNames.forEach(name => {
      const selectedObjects = selectedFilters[name];
      if (name === FILTER_TYPE.BY_DATE) {
        const [start, end] = selectedObjects;
        if (start !== null || end !== null)
          filters.push({
            [name]: [start !== null ? alignToDayStart(start).getTime() : null, end !== null ? alignToDayEnd(end).getTime() : null],
          });
      } else if (selectedObjects.length) {
        filters.push({ [name]: selectedObjects.map(item => item.id) });
      }
    });
    onApply(filters);
  }, [onApply, selectedFilters]);

  const resetFilters = useCallback(() => {
    setSelectedFilters(initEmptyFilters());
    onApply([]);
  }, [onApply]);

  const onMasterSelectionChange = useCallback(
    ({ target: { value } }) => setSelectedFilters(prev => ({ ...prev, [FILTER_TYPE.BY_MASTER]: value })),
    [],
  );
  const onCitySelectionChange = useCallback(
    ({ target: { value } }) => setSelectedFilters(prev => ({ ...prev, [FILTER_TYPE.BY_CITY]: value })),
    [],
  );
  const onWatchSelectionChange = useCallback(
    ({ target: { value } }) => setSelectedFilters(prev => ({ ...prev, [FILTER_TYPE.BY_WATCH]: value })),
    [],
  );
  const onStatusSelectionChange = useCallback(
    ({ target: { value } }) => setSelectedFilters(prev => ({ ...prev, [FILTER_TYPE.BY_STATUS]: value })),
    [],
  );
  const onStartDateChange = useCallback(
    value => setSelectedFilters(prev => ({ ...prev, [FILTER_TYPE.BY_DATE]: [value, prev[FILTER_TYPE.BY_DATE][1]] })),
    [],
  );
  const onEndDateChange = useCallback(
    value => setSelectedFilters(prev => ({ ...prev, [FILTER_TYPE.BY_DATE]: [prev[FILTER_TYPE.BY_DATE][0], value] })),
    [],
  );

  const masterLabelFormatter = useCallback(value => `${value.name} (${value.email})`, []);
  const cityLabelFormatter = useCallback(value => value.name, []);
  const watchLabelFormatter = useCallback(value => value.name, []);
  const statusLabelFormatter = useCallback(value => value.name, []);

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
                      selectedItems={selectedFilters[FILTER_TYPE.BY_MASTER]}
                      renderValueFormatter={masterLabelFormatter}
                      onSelectionChange={onMasterSelectionChange}
                    />
                    <FilterDropDownSelector
                      label="City"
                      items={cities}
                      selectedItems={selectedFilters[FILTER_TYPE.BY_CITY]}
                      renderValueFormatter={cityLabelFormatter}
                      onSelectionChange={onCitySelectionChange}
                    />
                    <FilterDropDownSelector
                      label="Watch"
                      items={watches}
                      selectedItems={selectedFilters[FILTER_TYPE.BY_WATCH]}
                      renderValueFormatter={watchLabelFormatter}
                      onSelectionChange={onWatchSelectionChange}
                    />
                    <FilterDropDownSelector
                      label="Status"
                      items={orderStatusMap}
                      selectedItems={selectedFilters[FILTER_TYPE.BY_STATUS]}
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
                          value={selectedFilters[FILTER_TYPE.BY_DATE][0]}
                        />
                        <DatePicker
                          label="StartDate to"
                          renderInput={props => <TextField size="small" style={{ width: 160 }} {...props} />}
                          views={['year', 'month', 'day']}
                          onChange={onEndDateChange}
                          ampm={false}
                          value={selectedFilters[FILTER_TYPE.BY_DATE][1]}
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
