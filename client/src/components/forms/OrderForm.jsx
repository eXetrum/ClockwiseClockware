import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { MasterCardList, SpinnerButton } from '../../components';

import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAvailable } from '../../store/thunks';
import { changeNewOrderField, resetMasters } from '../../store/actions';
import { selectNewOrder, selectOrderPending, selectAllMasters, selectMasterPending } from '../../store/selectors';

import { validateEmail, validateClientName, addHours, dateRangesOverlap, dateToNearestHour } from '../../utils';

const defaultControlsFocusState = { client: { email: false, name: false } };

const MASTER_PROPS_DEPENDENCY = ['city', 'watch', 'startDate'];

const OrderForm = ({ watches, cities, onSubmit, onReset, isEditForm = true, successButtonText = 'Save' }) => {
  const dispatch = useDispatch();

  const newOrder = useSelector(selectNewOrder);
  const isOrderPending = useSelector(selectOrderPending);
  const masters = useSelector(selectAllMasters);
  const isMastersPending = useSelector(selectMasterPending);

  const [currentDate, setCurrentDate] = useState(dateToNearestHour());
  const [isShowMasters, setShowMasters] = useState(false);
  const [dateTimeError, setDateTimeError] = useState(null);
  const [controlFocused, setControlFocused] = useState(defaultControlsFocusState);

  const isDateTimeError = useMemo(
    () => ['invalidDate', 'minTime', 'minDate', 'disablePast'].includes(dateTimeError?.reason),
    [dateTimeError],
  );
  const isPending = useMemo(() => isMastersPending || isOrderPending, [isMastersPending, isOrderPending]);
  const isMasterAssigned = useMemo(() => newOrder?.master !== null, [newOrder]);
  const isOrderPreparedForMasterSearch = useMemo(
    () => newOrder?.city !== null && newOrder?.watch !== null && newOrder?.startDate !== null && !isNaN(newOrder.startDate),
    [newOrder],
  );
  const isOrderReady = useMemo(
    () =>
      newOrder?.city !== null &&
      newOrder?.master !== null &&
      newOrder?.startDate >= currentDate &&
      validateEmail(newOrder?.client?.email) &&
      validateClientName(newOrder?.client?.name),
    [newOrder, currentDate],
  );

  const onOrderDateError = useCallback(reason => {
    if (reason === 'invalidDate') return setDateTimeError({ reason, detail: reason });
    if (reason === 'minDate' || reason === 'minTime') return setDateTimeError({ reason, detail: 'Time is past' });
    if (reason === 'disablePast') return setDateTimeError({ reason, detail: 'Date is past' });
    setDateTimeError(null);
  }, []);

  const ensureMasterCanServeCity = useCallback((master, city) => master?.cities?.find(item => item.id === city.id), []);
  const ensureMasterSchedule = useCallback(
    (schedule, startDate, endDate) =>
      schedule.some(item => dateRangesOverlap(startDate, endDate, new Date(item.startDate), new Date(item.endDate))),
    [],
  );
  const ensureMasterCanHandleOrder = useCallback(
    ({ id, watch, city, master, startDate }) => {
      // Master cant handle selected city
      if (!ensureMasterCanServeCity(master, city)) return false;

      const schedule = master.orders.filter(item => item.id !== id);
      return !ensureMasterSchedule(schedule, startDate, addHours(startDate, watch.repairTime));
    },
    [ensureMasterCanServeCity, ensureMasterSchedule],
  );

  const onFormFieldBlur = useCallback(async ({ target: { name, value } }) => {
    const [head, ...rest] = name.split('.');
    if (!rest.length) setControlFocused(prev => ({ ...prev, [name]: true }));
    else setControlFocused(prev => ({ ...prev, [head]: { ...prev[head], [rest[0]]: true } }));
  }, []);

  const onFormFieldChange = useCallback(
    async ({ target: { name, value } }) => {
      if (!MASTER_PROPS_DEPENDENCY.includes(name)) return dispatch(changeNewOrderField({ name, value }));

      if (name === 'city') value = cities.find(item => item.id === value);
      else if (name === 'watch') value = watches.find(item => item.id === value);
      //else if (name === 'startDate') value = new Date(value).getTime();

      const newParams = { ...newOrder, [name]: value };

      if (!isMasterAssigned || ensureMasterCanHandleOrder({ ...newParams })) {
        dispatch(changeNewOrderField({ name, value }));
        setShowMasters(false);
        return;
      }

      // Master assigned but CAN`T handle current order setup: two options here, revert to prev city, search for new master
      const result = await confirm(`"${newOrder.master.email}" master cant handle your order. Do you want to search new master ?`, {
        title: 'Confirm',
        okText: 'Search',
        okButtonStyle: 'warning',
      });

      // Cancel -> do nothing
      if (!result) return;

      // Update field
      dispatch(changeNewOrderField({ name, value }));

      // Drop current master
      dispatch(changeNewOrderField({ name: 'master', value: null }));

      setShowMasters(false);
    },
    [newOrder, isMasterAssigned, watches, cities, dispatch, ensureMasterCanHandleOrder],
  );

  const onOrderDateChange = useCallback(
    async value => {
      const newStartDate = new Date(value).getTime();
      if (!isNaN(newStartDate)) {
        dispatch(changeNewOrderField({ name: 'startDate', value: newStartDate }));
        setShowMasters(false);
      }
    },
    [dispatch],
  );

  const onFindMasterBtnClick = useCallback(
    async event => {
      event.preventDefault();
      // Drop current master
      dispatch(changeNewOrderField({ name: 'master', value: null }));
      setShowMasters(false);
      await dispatch(fetchAllAvailable({ watchId: newOrder.watch.id, cityId: newOrder.city.id, startDate: newOrder.startDate }));
      setShowMasters(true);
    },
    [dispatch, newOrder],
  );

  const onSelectMaster = useCallback(
    master => dispatch(changeNewOrderField({ name: 'master', value: newOrder.master !== master ? master : null })),
    [newOrder, dispatch],
  );

  const resetOrigOrder = useCallback(async () => {
    onReset();
    dispatch(resetMasters());
    setShowMasters(false);
    setControlFocused(defaultControlsFocusState);
  }, [dispatch, onReset]);

  useEffect(() => {
    if (newOrder.city === null && cities.length) dispatch(changeNewOrderField({ name: 'city', value: cities[0] }));
    if (newOrder.watch === null && watches.length) dispatch(changeNewOrderField({ name: 'watch', value: watches[0] }));
  }, [newOrder, cities, watches, dispatch]);

  useEffect(() => setCurrentDate(dateToNearestHour()), []);

  return (
    <>
      <Row className="justify-content-md-center">
        <Col xs lg="6">
          <Form onSubmit={onSubmit}>
            <hr />
            <Form.Group>
              <Row>
                <Col sm={4}>
                  <Form.Label>
                    <b>Client:</b>
                  </Form.Label>
                </Col>
                <Col>
                  {isEditForm ? (
                    <small className="text-muted fst-italic">{newOrder.client.name}</small>
                  ) : (
                    <>
                      <Form.Control
                        type="email"
                        name="client.email"
                        autoFocus
                        required
                        placeholder="Email"
                        onChange={onFormFieldChange}
                        onBlur={onFormFieldBlur}
                        value={newOrder.client.email}
                        disabled={isPending}
                        isValid={controlFocused.client.email && validateEmail(newOrder.client.email)}
                        isInvalid={controlFocused.client.email && !validateEmail(newOrder.client.email)}
                      />
                      {controlFocused.client.email && (
                        <Form.Control.Feedback type="invalid">Please provide a valid email (username@host.domain)</Form.Control.Feedback>
                      )}
                    </>
                  )}
                </Col>
                <Col>
                  {isEditForm ? (
                    <small className="text-muted fst-italic">{newOrder.client.email}</small>
                  ) : (
                    <>
                      <Form.Control
                        type="text"
                        name="client.name"
                        required
                        placeholder="Name"
                        onChange={onFormFieldChange}
                        onBlur={onFormFieldBlur}
                        value={newOrder.client.name}
                        disabled={isPending}
                        isValid={controlFocused.client.name && validateClientName(newOrder.client.name)}
                        isInvalid={controlFocused.client.name && !validateClientName(newOrder.client.name)}
                      />
                      {controlFocused.client.name && (
                        <Form.Control.Feedback type="invalid">Please provide a valid name (min length 3).</Form.Control.Feedback>
                      )}
                    </>
                  )}
                </Col>
              </Row>
            </Form.Group>
            <hr />
            <Form.Group className="mb-3">
              <Row>
                <Col sm={4}>
                  <Form.Label>
                    <b>Watch Type:</b>
                  </Form.Label>
                </Col>
                <Col className="justify-content-md-center">
                  {watches.map(watch => (
                    <Form.Check
                      key={watch.id}
                      type="radio"
                      name="watch"
                      label={watch.name}
                      checked={newOrder?.watch?.id === watch.id}
                      value={watch.id}
                      inline
                      required
                      onChange={onFormFieldChange}
                      disabled={isPending}
                    />
                  ))}
                </Col>
              </Row>
            </Form.Group>
            <hr />
            <Form.Group className="mb-3">
              <Row>
                <Col sm={4}>
                  <Form.Label>
                    <b>City:</b>
                  </Form.Label>
                </Col>
                <Col>
                  <Form.Select name="city" disabled={isPending} value={newOrder?.city?.id} onChange={onFormFieldChange}>
                    {cities.map(city => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            </Form.Group>
            <hr />
            <Form.Group className="mb-3">
              <Row>
                <Col sm={4}>
                  <Form.Label>
                    <b>Date/Time:</b>
                  </Form.Label>
                </Col>
                <Col>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      label="DateTimePicker"
                      renderInput={props => <TextField {...props} />}
                      views={['year', 'month', 'day', 'hours']}
                      onChange={onOrderDateChange}
                      onError={onOrderDateError}
                      ampm={false}
                      disablePast={true}
                      minDateTime={dayjs(currentDate)}
                      value={newOrder.startDate}
                    />
                  </LocalizationProvider>
                  {isDateTimeError && (
                    <strong style={{ color: 'red' }}>
                      <br />
                      {dateTimeError.detail}
                    </strong>
                  )}
                </Col>
              </Row>
            </Form.Group>
            <hr />

            <Form.Group className="mb-4">
              <Row>
                <Col sm={4}>
                  <Row>
                    <Form.Label>
                      <b>Master:</b>
                    </Form.Label>
                  </Row>
                  <Row>
                    <Col>
                      <SpinnerButton
                        className="mb-2 btn"
                        variant="warning"
                        onClick={onFindMasterBtnClick}
                        disabled={isPending || !isOrderPreparedForMasterSearch}
                        text={
                          <>
                            {isMasterAssigned && !isMastersPending ? (
                              <HighlightOffOutlinedIcon fontSize="small" className="me-1" />
                            ) : (
                              <span>&nbsp;</span>
                            )}
                            <span className="me-1">Find Master</span>
                          </>
                        }
                        loading={isMastersPending}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col>
                  {isMasterAssigned ? (
                    <span>
                      <b>{newOrder?.master.email}</b>
                    </span>
                  ) : (
                    <span>Master is not assigned yet</span>
                  )}
                </Col>
                <Row>
                  <Col>
                    {isShowMasters ? (
                      <>
                        <hr />
                        <MasterCardList {...{ masters, currentSelectedMaster: newOrder.master, onSelect: onSelectMaster }} />
                      </>
                    ) : (
                      <>
                        {!isMasterAssigned ? (
                          <>
                            <hr />
                            <center>you should search free masters to complete order</center>
                          </>
                        ) : null}
                      </>
                    )}
                  </Col>
                </Row>

                <Row className="mt-4">
                  <Col md={{ span: 4, offset: 0 }}></Col>
                </Row>
              </Row>
            </Form.Group>
            <hr />
            <Form.Group>
              <Row className="justify-content-md-center mt-4">
                <Col className="d-flex justify-content-start">
                  <Button className="mb-3 col-sm-5" onClick={() => resetOrigOrder()} disabled={isPending}>
                    Reset
                  </Button>
                </Col>
                <Col className="d-flex justify-content-end">
                  <SpinnerButton
                    className="mb-3 col-sm-5"
                    type="submit"
                    variant="success"
                    loading={isOrderPending}
                    disabled={isPending || !isOrderReady}
                    text={successButtonText}
                  />
                </Col>
              </Row>
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default OrderForm;
