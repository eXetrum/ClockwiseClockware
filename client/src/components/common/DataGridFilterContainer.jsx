import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Stack, FormGroup, TextField, Button, Drawer, Badge, Divider, IconButton } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import TuneIcon from '@mui/icons-material/Tune';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';

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

const INIT_EMPTY_FILTERS = Object.fromEntries(validFilterNames.map(name => [name, name === FILTER_TYPE.BY_DATE ? [null, null] : []]));

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
  const [selectedFilters, setSelectedFilters] = useState(INIT_EMPTY_FILTERS);

  const isApplyFilterBtnEnabled = useMemo(
    () =>
      validFilterNames
        .map(name =>
          name === FILTER_TYPE.BY_DATE ? selectedFilters[name].filter(item => item !== null).length : selectedFilters[name].length,
        )
        .some(b => b),
    [selectedFilters],
  );

  const masterLabelFormatter = useCallback(value => `${value.name} (${value.email})`, []);
  const filterSelectorsMapping = useMemo(
    () => ({
      [FILTER_TYPE.BY_MASTER]: { label: 'Master', items: masters, renderValueFormatter: masterLabelFormatter },
      [FILTER_TYPE.BY_CITY]: { label: 'City', items: cities },
      [FILTER_TYPE.BY_WATCH]: { label: 'Watch', items: watches },
      [FILTER_TYPE.BY_STATUS]: { label: 'Status', items: orderStatusMap },
    }),
    [masters, cities, watches, masterLabelFormatter],
  );
  const initializeAcceptedFilters = useCallback(() => {
    validFilterNames.forEach(filterType => {
      const idx = filters.findIndex(item => filterType in item);
      if (idx !== -1 && filters[idx][filterType].length) {
        if (filterType === FILTER_TYPE.BY_DATE) {
          setSelectedFilters(prev => ({ ...prev, [filterType]: filters[idx][filterType] }));
        } else {
          setSelectedFilters(prev => ({
            ...prev,
            [filterType]: filterSelectorsMapping[filterType].items.filter(
              item => filters[idx][filterType].findIndex(id => id === item.id) !== -1,
            ),
          }));
        }
      }
    });
  }, [filters, filterSelectorsMapping]);

  useEffect(() => {
    dispatch(fetchMasters({ limit: -1 }));
    dispatch(fetchCities({ limit: -1 }));
    dispatch(fetchWatches());
  }, [dispatch]);

  useEffect(() => initializeAcceptedFilters(), [isComponentReady, initializeAcceptedFilters]);

  const onSelectionChange = useCallback((propName, value) => setSelectedFilters(prev => ({ ...prev, [propName]: value })), []);

  const toggleDrawer = open => event => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setFilterTabIsOpen(open);

    // On close drop unaplyed filters but keep already accepted
    if (open === false) {
      setSelectedFilters(INIT_EMPTY_FILTERS);
      initializeAcceptedFilters();
    }
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
    setFilterTabIsOpen(false);
    onApply(filters);
  }, [onApply, selectedFilters]);

  const resetFilters = useCallback(() => {
    setSelectedFilters(INIT_EMPTY_FILTERS);
    onApply([]);
  }, [onApply]);

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
          <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={2}>
            <IconButton onClick={toggleDrawer(false)}>
              <HighlightOffIcon />
            </IconButton>
          </Stack>
          <Divider />
          <Container sx={{ mt: 25 }}>
            <Stack justifyContent="center" alignItems="center" spacing={2}>
              <FormGroup>
                {isComponentReady ? (
                  <>
                    {validFilterNames
                      .filter(item => item !== FILTER_TYPE.BY_DATE)
                      .map((filterName, index) => (
                        <FilterDropDownSelector
                          key={index}
                          label={filterSelectorsMapping[filterName].label}
                          items={filterSelectorsMapping[filterName].items}
                          renderValueFormatter={filterSelectorsMapping[filterName].renderValueFormatter}
                          selectedItems={selectedFilters[filterName]}
                          onSelectionChange={({ target: { value } }) => onSelectionChange(filterName, value)}
                        />
                      ))}

                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <Stack direction={'row'} justifyContent="center" alignItems="center" spacing={2} sx={{ mb: 2, mt: 1 }}>
                        {selectedFilters[FILTER_TYPE.BY_DATE].map((date, index) => (
                          <DatePicker
                            key={index}
                            label={`StartDate ${index ? 'to' : 'from'}`}
                            renderInput={props => <TextField size="small" style={{ width: 160 + (index ? 0 : 5) }} {...props} />}
                            views={['year', 'month', 'day']}
                            onChange={value =>
                              onSelectionChange(
                                FILTER_TYPE.BY_DATE,
                                index
                                  ? [selectedFilters[FILTER_TYPE.BY_DATE][(index + 1) % 2], value]
                                  : [value, selectedFilters[FILTER_TYPE.BY_DATE][(index + 1) % 2]],
                              )
                            }
                            ampm={false}
                            value={date}
                          />
                        ))}
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
