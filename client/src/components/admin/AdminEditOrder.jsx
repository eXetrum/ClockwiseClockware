import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Form, FormGroup, FormControl, Container, Row, Col, Card, Badge, Alert, Button, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import Multiselect from 'multiselect-react-dropdown';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Header from '../Header';
import StarRating from '../StarRating';
import ErrorContainer from '../ErrorContainer';
import { getCities } from '../../api/cities';
import { getWatches } from '../../api/watches';
import { getOrderById, updateOrderById, getAvailableMasters } from '../../api/orders';
import { dateToNearestHour, addHours, dateRangesOverlap } from '../../utils/dateTime';

const AdminEditOrder = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { id } = useParams();

  const [watches, setWatches] = useState(null);
  const [cities, setCities] = useState(null);
  const [masters, setMasters] = useState(null);

  const [currentDate, setCurrentDate] = useState(null);
  const [originalOrder, setOriginalOrder] = useState(null);
  const [selectedCities, setSelectedCities] = useState(null);

  // Order params
  const [client, setClient] = useState(null);
  const [watch, setWatch] = useState(null);
  const [city, setCity] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [master, setMaster] = useState(null);
  const [lastAssignedCity, setLastAssignedCity] = useState(null);

  //const [showMasters, setShowMasters] = useState(true);
  const [dateTimeError, setDateTimeError] = useState(null);

  const [pendingInitial, setPendingInitial] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);

  const isLoading = useMemo(
    () => (watches === null || cities === null || originalOrder === null) && pendingInitial,
    [watches, cities, originalOrder, pendingInitial],
  );
  const isError = useMemo(() => error !== null, [error]);
  const isDateTimeError = useMemo(
    () => ['invalidDate', 'minTime', 'minDate', 'disablePast'].includes(dateTimeError?.reason),
    [dateTimeError],
  );
  const isFormReady = useMemo(() => watches !== null && cities !== null && originalOrder !== null, [watches, cities, originalOrder]);

  const isOriginalOrderAssigned = useMemo(() => originalOrder !== null, [originalOrder]);
  const isClientAssigned = useMemo(() => client !== null, [client]);
  const isWatchAssigned = useMemo(() => watch !== null, [watch]);
  const isCityAssigned = useMemo(() => city !== null, [city]);
  const isDateTimeAssigned = useMemo(() => startDate !== null, [startDate]);
  const isMasterAssigned = useMemo(() => master !== null, [master]);

  // Prepared, cant PUT yet coz of master, but can fetchAvailableMasters
  const isOrderPrepared = useMemo(
    () => isOriginalOrderAssigned && isClientAssigned && isWatchAssigned && isCityAssigned && isDateTimeAssigned,
    [isOriginalOrderAssigned, isClientAssigned, isWatchAssigned, isCityAssigned, isDateTimeAssigned],
  );

  // Ready to PUT
  const isOrderReady = useMemo(() => isOrderPrepared && isMasterAssigned, [isOrderPrepared, isMasterAssigned]);

  const resetOrigOrder = (order) => {
    setClient(order.client);
    setWatch(order.watch);
    setCity(order.city);
    setStartDate(new Date(order.startDate));
    setMaster(order.master);
    setSelectedCities([order.city]);
    setLastAssignedCity(order.city);

    setOriginalOrder(order);
  };

  const ensureMasterCanServeCity = (master, city) => master?.cities?.find((item) => item.id === city.id);
  const ensureMasterSchedule = (schedule, startDate, endDate) =>
    schedule.some((item) => dateRangesOverlap(startDate, endDate, new Date(item.startDate), new Date(item.endDate)));
  const ensureMasterCanHandleOrder = ({ orderId, watch, city, master, startDate }) => {
    // Master cant handle selected city
    if (!ensureMasterCanServeCity(master, city)) return false;

    const schedule = master.orders.filter((item) => item.id !== orderId);

    return !ensureMasterSchedule(schedule, startDate, addHours(startDate, watch.repairTime));
  };

  const fetchInitialData = useCallback(async (id, abortController) => {
    try {
      let response = await getWatches({ abortController });
      setWatches(response?.data?.watches ?? null);

      response = await getCities({ abortController });
      setCities(response?.data?.cities ?? null);

      response = await getOrderById({ id, abortController });
      if (response?.data?.order) {
        const { order } = response.data;
        resetOrigOrder(order);
      }
    } catch (e) {
      setError(e);
    } finally {
      setPendingInitial(false);
    }
  }, []);

  const fetchAvailableMasters = async ({ city, watch, startDate }) => {
    try {
      const response = await getAvailableMasters({
        cityId: city.id,
        watchId: watch.id,
        startDate: startDate.getTime(),
      });
      if (response?.data?.masters) {
        const { masters } = response.data;
        // Check if original master can handle current order
        const masterInMasterList = masters.find((item) => item.id === originalOrder.master.id) != null;
        if (
          !masterInMasterList &&
          ensureMasterCanHandleOrder({
            orderId: originalOrder.id,
            watch,
            city,
            startDate,
            master: originalOrder.master,
          })
        )
          return setMasters([...masters, originalOrder.master]);

        setMasters(masters);
      }
    } catch (e) {
      setError(e);
    } finally {
      setPending(false);
    }
  };

  const doUpdateOrderById = async ({ id, watch, city, master, startDate }) => {
    try {
      const order = {
        watchId: watch.id,
        cityId: city.id,
        masterId: master.id,
        startDate: startDate.getTime(),
      };
      const response = await updateOrderById({ id, order });
      if ([200, 204].includes(response.status)) {
        resetOrigOrder({ ...originalOrder, watch, city, master, startDate });
        enqueueSnackbar('Order updated', { variant: 'success' });
      }
    } catch (e) {
      if ([401, 403, 404].includes(e?.response?.status)) {
        setOriginalOrder(null);
        setError(e);
      } else {
        resetOrigOrder(originalOrder);
        setError(null);
        enqueueSnackbar(`Error: ${e.response.data.detail}`, {
          variant: 'error',
        });
      }
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    setCurrentDate(dateToNearestHour());
    const abortController = new AbortController();
    fetchInitialData(id, abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [id, closeSnackbar, fetchInitialData]);

  const onFormSubmit = (event) => {
    event.preventDefault();
    setPending(true);
    doUpdateOrderById({ id, watch, city, master, startDate });
  };

  const onOrderCitySelect = async (selectedList, selectedCity) => {
    if (
      !isMasterAssigned ||
      ensureMasterCanHandleOrder({
        orderId: originalOrder.id,
        watch,
        city: selectedCity,
        startDate,
        master,
      })
    ) {
      setCity(selectedCity);
      setSelectedCities([selectedCity]);
      setMasters(null);
      return;
    }

    // Master assigned but CAN`T handle current order setup: two options here, revert to prev city, search for new master
    const result = await confirm(`"${master.email}" master cant handle your order. Do you want to search new master ?`, {
      title: 'Confirm',
      okText: 'Search',
      okButtonStyle: 'warning',
    });

    // Accept -> drop current master
    if (result) {
      setCity(selectedCity);
      setSelectedCities([selectedCity]);
      setMaster(null);
      return fetchAvailableMasters({ city: selectedCity, watch, startDate });
    }

    // Cancel -> revert to prev city
    setCity(lastAssignedCity);
    setSelectedCities([lastAssignedCity]);
  };

  const onOrderCityRemove = (selectedList, removedItem) => {
    setLastAssignedCity(removedItem);
    setCity(null);
    setSelectedCities([]);
    setMasters(null);
  };

  const onWatchTypeChange = async (event, newWatch) => {
    if (
      !isMasterAssigned ||
      ensureMasterCanHandleOrder({
        orderId: id,
        master,
        city,
        watch: newWatch,
        startDate,
      })
    ) {
      setWatch(newWatch);
      setMasters(null);
      return;
    }

    const result = await confirm(`"${master.email}" master cant handle your order. Do you want to search new master ?`, {
      title: 'Confirm',
      okText: 'Search',
      okButtonStyle: 'warning',
    });

    if (result) {
      setWatch(newWatch);
      setMasters(null);
      return fetchAvailableMasters({ city, watch: newWatch, startDate });
    }
  };

  const onOrderDateChange = (newValue) => {
    setStartDate(new Date(newValue));
    setMasters(null);
  };

  const onOrderDateError = (reason) => {
    if (reason === 'invalidDate') return setDateTimeError({ reason, detail: reason });
    if (reason === 'minDate') return setDateTimeError({ reason, detail: 'Time is past' });
    if (reason === 'minTime') return setDateTimeError({ reason, detail: 'Time is past' });
    if (reason === 'disablePast') return setDateTimeError({ reason, detail: 'Date is past' });
    setDateTimeError(null);
  };

  const onFindMasterBtnClick = (event) => {
    event.preventDefault();
    setMaster(null);
    setMasters(null);
    fetchAvailableMasters({ city, watch, startDate });
  };

  const onResetBtnClick = (event) => {
    event.preventDefault();
    resetOrigOrder(originalOrder);
    setMasters(null);
  };

  const onSelectMaster = async (master) => {
    const result = await confirm(`Do you want to select "${master.email}" as your master ?`, {
      title: 'Confirm',
      okText: 'Accept',
      okButtonStyle: 'success',
    });
    if (!result) return;
    setMaster(master);
    setMasters(null);
  };

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Edit order</h1>
          <Link to={'/admin/orders'}>
            <ArrowLeftIcon />
            Back
          </Link>
        </center>
        <hr />

        {isLoading && (
          <center>
            <Spinner animation='grow' />
          </center>
        )}

        {isError && <ErrorContainer error={error} />}

        {isFormReady && (
          <>
            <Row className='justify-content-md-center'>
              <Col xs lg='6'>
                <Form onSubmit={onFormSubmit}>
                  <hr />
                  <FormGroup className='mb-3'>
                    <Row xs={1} md={2}>
                      <Col>
                        <Form.Label>Client:</Form.Label>
                      </Col>
                    </Row>
                    <Row>
                      <Col>
                        <FormControl type='text' name='clientName' value={client.name} disabled={true} />
                      </Col>
                      <Col>
                        <FormControl type='email' name='clientEmail' value={client.email} disabled={true} />
                      </Col>
                    </Row>
                  </FormGroup>
                  <hr />
                  <FormGroup className='mb-3'>
                    <Row xs={1} md={2}>
                      <Col>
                        <Form.Label>Watch Type:</Form.Label>
                      </Col>
                      <Col>
                        {watches.map((item) => (
                          <Form.Check
                            key={item.id}
                            type='radio'
                            name='watch'
                            label={item.name}
                            checked={watch.id === item.id}
                            inline
                            required
                            onChange={(event) => onWatchTypeChange(event, item)}
                            disabled={pending}
                          />
                        ))}
                      </Col>
                    </Row>
                  </FormGroup>
                  <hr />
                  <FormGroup className='mb-4'>
                    <Row xs={1} md={2}>
                      <Col>
                        <Form.Label>City:</Form.Label>
                      </Col>
                      <Col>
                        <Multiselect
                          displayValue='name'
                          onSelect={onOrderCitySelect}
                          onRemove={onOrderCityRemove}
                          options={cities}
                          selectedValues={selectedCities}
                          selectionLimit={1}
                          disable={pending}
                        />
                      </Col>
                    </Row>
                  </FormGroup>
                  <hr />
                  <FormGroup className='mb-3'>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        label='DateTimePicker'
                        renderInput={(props) => <TextField {...props} />}
                        views={['year', 'month', 'day', 'hours']}
                        onChange={onOrderDateChange}
                        onError={onOrderDateError}
                        ampm={false}
                        disablePast={true}
                        minDateTime={dayjs(currentDate)}
                        value={startDate}
                        disabled={pending}
                      />
                    </LocalizationProvider>
                    {isDateTimeError && (
                      <strong style={{ color: 'red' }}>
                        <br />
                        {dateTimeError.detail}
                      </strong>
                    )}
                  </FormGroup>
                  <hr />

                  <FormGroup className='mb-4'>
                    {!isMasterAssigned && (
                      <Row xs={1} md={3}>
                        <Col md='auto'>Master is not assigned yet</Col>
                      </Row>
                    )}
                    {isMasterAssigned && (
                      <>
                        <Row xs={1} md={3}>
                          <Col>
                            <Form.Label>Master:</Form.Label>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <FormControl type='text' name='masterName' value={master.name} disabled={true} />
                          </Col>
                          <Col>
                            <FormControl type='email' name='masterEmail' value={master.email} disabled={true} />
                          </Col>
                          <Col>
                            <StarRating value={master.rating} readonly={true} />
                          </Col>
                        </Row>
                      </>
                    )}

                    <Row xs={1} md={2} className='mt-4'>
                      <Col md={{ span: 8, offset: 8 }}>
                        <Button className='mb-2' variant='warning' onClick={onFindMasterBtnClick} disabled={!isOrderPrepared}>
                          Find New Master
                        </Button>
                      </Col>
                    </Row>
                  </FormGroup>
                  <hr />
                  <FormGroup>
                    <Row xs={1} md={2} className='justify-content-md-center mt-4'>
                      <Col>
                        <Button className='mb-3' onClick={onResetBtnClick}>
                          Reset
                        </Button>
                      </Col>
                      <Col>
                        <Button className='mb-3' type='submit' variant='success' disabled={!isOrderReady}>
                          Save
                        </Button>
                      </Col>
                    </Row>
                  </FormGroup>
                </Form>
              </Col>
            </Row>

            {masters && (
              <div>
                <hr />
                <Row className='justify-content-md-center mt-4'>
                  {masters.map((master) => (
                    <Col key={master.id} md='auto' onClick={() => onSelectMaster(master)}>
                      <Card className='mb-3' style={{ width: '18rem' }}>
                        <Card.Body>
                          <Card.Title>{master.name}</Card.Title>
                          <Card.Subtitle className='mb-2 text-muted'>{master.email}</Card.Subtitle>
                          <StarRating value={master.rating} readonly={true} />
                          <Card.Text>
                            {master.cities.map((city) => (
                              <Badge bg='info' className='p-2 m-1' key={city.id}>
                                {city.name}
                              </Badge>
                            ))}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}

                  {!isMasterAssigned && masters.length === 0 && (
                    <Row className='justify-content-md-center'>
                      <Col md='auto'>
                        <Alert>No free masters available for specified city and date time</Alert>
                      </Col>
                    </Row>
                  )}
                </Row>
              </div>
            )}
          </>
        )}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminEditOrder;
