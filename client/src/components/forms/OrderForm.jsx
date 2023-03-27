import React, { useState, useMemo, useCallback } from 'react';
import { Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import Multiselect from 'multiselect-react-dropdown';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdminMastersList } from '../../components';
import ViewMasterCard from '../master/ViewMasterCard';

import { useDispatch, useSelector } from 'react-redux';
import { fetchAllAvailable } from '../../store/reducers/ActionCreators';
import { orderSlice } from '../../store/reducers';

import { validateEmail, validateClientName, addHours, dateRangesOverlap, dateToNearestHour } from '../../utils';

const OrderForm = ({ watches, cities, onFormSubmit, isEditForm = true, successButtonText = 'Save' }) => {
  const dispatch = useDispatch();

  const { resetNewOrder, changeNewOrderField } = orderSlice.actions;
  const { newOrder, isPending: isOrderPending } = useSelector((state) => state.orderReducer);
  const { masters, isPending: isMasterPending } = useSelector((state) => state.masterReducer);

  const currentDate = dateToNearestHour();

  const [selectedCities, setSelectedCities] = useState(newOrder?.city ? [newOrder?.city] : []);
  const [lastAssignedCity, setLastAssignedCity] = useState(null);
  const [isShowMasters, setShowMasters] = useState(false);

  const [dateTimeError, setDateTimeError] = useState(null);
  const isDateTimeError = useMemo(
    () => ['invalidDate', 'minTime', 'minDate', 'disablePast'].includes(dateTimeError?.reason),
    [dateTimeError],
  );

  const isPending = useMemo(() => isMasterPending || isOrderPending, [isMasterPending, isOrderPending]);

  const onOrderDateError = useCallback((reason) => {
    if (reason === 'invalidDate') return setDateTimeError({ reason, detail: reason });
    if (reason === 'minDate') return setDateTimeError({ reason, detail: 'Time is past' });
    if (reason === 'minTime') return setDateTimeError({ reason, detail: 'Time is past' });
    if (reason === 'disablePast') return setDateTimeError({ reason, detail: 'Date is past' });
    setDateTimeError(null);
  }, []);

  const isMasterAssigned = useMemo(() => newOrder?.master !== null, [newOrder]);
  const isOrderPreparedForMasterSearch = useMemo(
    () => newOrder?.city !== null && newOrder?.watch !== null && newOrder?.startDate !== null,
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

  console.log('masters: ', masters);

  //////////////////////////////////////////////////////////////////////////
  const ensureMasterCanServeCity = useCallback((master, city) => master?.cities?.find((item) => item.id === city.id), []);
  const ensureMasterSchedule = useCallback(
    (schedule, startDate, endDate) =>
      schedule.some((item) => dateRangesOverlap(startDate, endDate, new Date(item.startDate), new Date(item.endDate))),
    [],
  );
  const ensureMasterCanHandleOrder = useCallback(
    ({ id, watch, city, master, startDate }) => {
      // Master cant handle selected city
      if (!ensureMasterCanServeCity(master, city)) return false;

      const schedule = master.orders.filter((item) => item.id !== id);
      return !ensureMasterSchedule(schedule, startDate, addHours(startDate, watch.repairTime));
    },
    [ensureMasterCanServeCity, ensureMasterSchedule],
  );

  const onOrderWatchTypeChange = useCallback(
    async (event, watch) => {
      if (!isMasterAssigned || ensureMasterCanHandleOrder({ ...newOrder, watch })) {
        dispatch(changeNewOrderField({ name: 'watch', value: watch }));
        setShowMasters(false);
        return;
      }

      const result = await confirm(`"${newOrder.master.email}" master cant handle your order. Do you want to search new master ?`, {
        title: 'Confirm',
        okText: 'Search',
        okButtonStyle: 'warning',
      });
      if (!result) return;

      dispatch(changeNewOrderField({ name: 'watch', value: watch }));
      dispatch(changeNewOrderField({ name: 'master', value: null }));
      dispatch(fetchAllAvailable({ ...newOrder, watch }));
      //fetchAvailableMasters({ ...newOrder, watch: newWatch, master: null });
    },
    [newOrder, isMasterAssigned, dispatch, ensureMasterCanHandleOrder, changeNewOrderField],
  );

  const onOrderCitySelect = useCallback(
    async (selectedList, city) => {
      if (!isMasterAssigned || ensureMasterCanHandleOrder({ ...newOrder, city })) {
        dispatch(changeNewOrderField({ name: 'city', value: city }));
        setSelectedCities([city]);
        setShowMasters(false);
        return;
      }

      // Master assigned but CAN`T handle current order setup: two options here, revert to prev city, search for new master
      const result = await confirm(`"${newOrder.master.email}" master cant handle your order. Do you want to search new master ?`, {
        title: 'Confirm',
        okText: 'Search',
        okButtonStyle: 'warning',
      });

      // Cancel -> revert to prev city
      if (!result) {
        dispatch(changeNewOrderField({ name: 'city', value: lastAssignedCity }));
        setSelectedCities([lastAssignedCity]);
      }

      // Accept -> drop current master
      setShowMasters(false);
      dispatch(changeNewOrderField({ name: 'city', value: city }));
      dispatch(changeNewOrderField({ name: 'master', value: null }));
      setSelectedCities([city]);
      //return fetchAvailableMasters({ ...newOrder, city, master: null });
    },
    [newOrder, lastAssignedCity, isMasterAssigned, dispatch, changeNewOrderField, ensureMasterCanHandleOrder],
  );

  const onOrderCityRemove = useCallback(
    (selectedList, removedItem) => {
      setLastAssignedCity(removedItem);
      dispatch(changeNewOrderField({ name: 'city', value: null }));
      setSelectedCities([]);
      setShowMasters(false);
    },
    [dispatch, changeNewOrderField],
  );

  const onOrderDateChange = useCallback((value) => {
    dispatch(changeNewOrderField({ name: 'startDate', value: new Date(value).getTime() }));
    setShowMasters(false);
    //setNewOrder((prev) => ({ ...prev, startDate: new Date(newValue) }));
    //resetMasterList();
  }, []);

  const onFindMasterBtnClick = useCallback(
    (event) => {
      event.preventDefault();
      console.log('onFindMasterBtnClick');
      dispatch(changeNewOrderField({ name: 'master', value: null }));
      dispatch(fetchAllAvailable({ watchId: newOrder.watch.id, cityId: newOrder.city.id, startDate: newOrder.startDate }));
    },
    [newOrder, dispatch, changeNewOrderField],
  );

  const onSelectMaster = useCallback(async (master) => {
    const result = await confirm(`Do you want to select "${master.email}" as your master ?`, {
      title: 'Confirm',
      okText: 'Accept',
      okButtonStyle: 'success',
    });
    if (!result) return;

    dispatch(changeNewOrderField({ name: 'master', value: master }));
    setShowMasters(false);
  }, []);

  const resetOrigOrder = useCallback(
    (order) => {
      dispatch(resetNewOrder());
      //dispatch(resetNewOrder(order));
      setSelectedCities([]);
      setLastAssignedCity(null);
      //setOrderConfirmationMessage(null);
    },
    [dispatch, resetNewOrder],
  );

  return (
    <>
      <Row className="justify-content-md-center">
        <Col xs lg="6">
          <Form onSubmit={onFormSubmit}>
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
                        onChange={({ target: { name, value } }) => dispatch(changeNewOrderField({ name, value }))}
                        value={newOrder.client.email}
                        isValid={validateEmail(newOrder.client.email)}
                        isInvalid={!validateEmail(newOrder.client.email)}
                        disabled={isPending}
                      />
                      {newOrder.client.email && (
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
                        onChange={({ target: { name, value } }) => dispatch(changeNewOrderField({ name, value }))}
                        value={newOrder.client.name}
                        isValid={validateClientName(newOrder.client.name)}
                        isInvalid={!validateClientName(newOrder.client.name)}
                        disabled={isPending}
                      />
                      {newOrder.client.name && (
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
                  {watches.map((watch) => (
                    <Form.Check
                      key={watch.id}
                      type="radio"
                      name="watch"
                      label={watch.name}
                      checked={newOrder?.watch?.id === watch.id}
                      inline
                      required
                      onChange={(event) => onOrderWatchTypeChange(event, watch)}
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
                  <Multiselect
                    placeholder="City"
                    displayValue="name"
                    options={cities}
                    selectedValues={selectedCities}
                    singleSelect={true}
                    selectionLimit={1}
                    disable={isPending}
                    onSelect={onOrderCitySelect}
                    onRemove={onOrderCityRemove}
                  />
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
                      renderInput={(props) => <TextField {...props} />}
                      views={['year', 'month', 'day', 'hours']}
                      onChange={onOrderDateChange}
                      onError={onOrderDateError}
                      ampm={false}
                      disablePast={true}
                      minDateTime={dayjs(currentDate)}
                      value={newOrder.startDate}
                      disabled={isPending}
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
                      <Button
                        className="mb-2 btn btn-sm"
                        variant="warning"
                        onClick={onFindMasterBtnClick}
                        disabled={isPending || !isOrderPreparedForMasterSearch}
                      >
                        {isMasterAssigned ? <HighlightOffOutlinedIcon fontSize="small" /> : null}
                        Find New Master
                      </Button>
                    </Col>
                  </Row>
                </Col>
                <Col>{isMasterAssigned ? <ViewMasterCard master={newOrder.master} /> : <span>Master is not assigned yet</span>}</Col>

                <Row className="mt-4">
                  <Col md={{ span: 4, offset: 0 }}></Col>
                </Row>
              </Row>
            </Form.Group>
            <hr />
            <Form.Group>
              <Row className="justify-content-md-center mt-4">
                <Col className="d-flex justify-content-md-end">
                  <Button className="mb-3 col-sm-4" onClick={() => resetOrigOrder()} disabled={isPending}>
                    Reset
                  </Button>
                </Col>
                <Col className="d-flex justify-content-md-end">
                  <Button className="mb-3 col-sm-4" type="submit" variant="success" disabled={isPending || !isOrderReady}>
                    {isPending && <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
                    {successButtonText}
                  </Button>
                </Col>
              </Row>
            </Form.Group>
          </Form>
        </Col>
      </Row>
      {isShowMasters ? (
        <>
          <hr />
          <AdminMastersList {...{ masters, onSelect: onSelectMaster, isAdminView: false }} />
        </>
      ) : null}
    </>
  );
};

export default OrderForm;
