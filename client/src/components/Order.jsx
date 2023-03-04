import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner, Card, Badge } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import Multiselect from 'multiselect-react-dropdown';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import StarRating from './StarRating';
import Header from './Header';
import ErrorContainer from './ErrorContainer';
import { getCities } from '../api/cities';
import { getWatches } from '../api/watches';
import { getAvailableMasters, createOrder } from '../api/orders';
import { dateToNearestHour } from '../utils/dateTime';

const Order = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const initEmptyOrder = () => {
    return {
      client: { name: '', email: '' },
      watch: null,
      city: null,
      master: null,
      startDate: dateToNearestHour(),
      cities: [],
    };
  };

  const [order, setOrder] = useState(initEmptyOrder());
  const [currentDate, setCurrentDate] = useState(dateToNearestHour());
  const [watches, setWatches] = useState(null);
  const [cities, setCities] = useState(null);
  const [masters, setMasters] = useState(null);
  const [orderConfirmationMessage, setOrderConfirmationMessage] = useState(null);
  const [dateTimeError, setDateTimeError] = useState(null);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState(null);

  const isLoading = useMemo(() => (watches === null || cities === null) && pending, [watches, cities, pending]);
  const isError = useMemo(() => error !== null, [error]);
  const isComponentReady = useMemo(() => watches !== null && cities !== null, [watches, cities]);

  const isDateTimeError = useMemo(
    () => ['invalidDate', 'minTime', 'minDate', 'disablePast'].includes(dateTimeError?.reason),
    [dateTimeError],
  );

  const isOrderConfirmationMessageReceived = useMemo(() => orderConfirmationMessage !== null, [orderConfirmationMessage]);

  const isLoadingMasters = useMemo(() => masters === null && pending, [masters, pending]);
  const isMasterListReady = useMemo(() => masters !== null && !pending, [masters, pending]);
  const isAllMastersBussy = useMemo(() => masters?.length === 0, [masters]);

  const isValidEmail = (email) => /\w{1,}@\w{1,}\.\w{2,}/gi.test(email);
  const isValidName = (name) => name?.length >= 3;

  const isFormValid = useCallback(
    () =>
      isValidName(order?.client?.name) &&
      isValidEmail(order?.client?.email) &&
      order?.watch &&
      order?.city &&
      order?.startDate >= currentDate,
    [order, currentDate],
  );

  const setDefaultFormState = () => {
    setOrder(initEmptyOrder());
    setCurrentDate(dateToNearestHour());
    setMasters(null);
    setOrderConfirmationMessage(null);
  };

  const resetBeforeApiCall = () => {
    setPending(true);
    setError(null);
  };

  const fetchInitialData = async (abortController) => {
    try {
      let response = await getWatches({ abortController });
      if (response?.data?.watches) {
        const { watches } = response.data;
        setWatches(watches);
      }

      response = await getCities({ abortController });
      if (response?.data?.cities) {
        const { cities } = response.data;
        setCities(cities);
      }
    } catch (e) {
      setError(e);
    } finally {
      setPending(false);
    }
  };

  const fetchAvailableMasters = async (cityId, watchId, startDate) => {
    try {
      const response = await getAvailableMasters({
        cityId,
        watchId,
        startDate,
      });
      if (response?.data?.masters) {
        const { masters } = response.data;
        setMasters(masters);
      }
    } catch (e) {
      setError(e);
      if (e?.response?.data?.detail) {
        enqueueSnackbar(`Error: ${e.response.data.detail}`, {
          variant: 'error',
        });
      }
    } finally {
      setPending(false);
    }
  };

  const doCreateOrder = async (order) => {
    try {
      const response = await createOrder({ order });
      if (response.data.confirmation) {
        const { confirmation } = response.data;
        setOrderConfirmationMessage(confirmation);
        enqueueSnackbar('Order placed', { variant: 'success' });
      }
    } catch (e) {
      setError(e);
      if (e?.response?.data?.detail) {
        enqueueSnackbar(`Error: ${e.response.data.detail}`, {
          variant: 'error',
        });
      }
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchInitialData(abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [closeSnackbar]);

  const onFormSubmit = (event) => {
    event.preventDefault();

    resetBeforeApiCall();
    setMasters(null);

    fetchAvailableMasters(order.city.id, order.watch.id, order.startDate.getTime());
  };

  const onClientEmailChange = (event) =>
    setOrder((prev) => ({
      ...prev,
      client: { ...prev.client, email: event.target.value },
    }));
  const onClientNameChange = (event) =>
    setOrder((prev) => ({
      ...prev,
      client: { ...prev.client, name: event.target.value },
    }));
  const onWatchTypeChange = (event, watch) => {
    setOrder((prev) => ({ ...prev, watch }));
    setMasters(null);
  };
  const onOrderCitySelect = (selectedList, city) => {
    setOrder((prev) => ({ ...prev, city }));
    setMasters(null);
  };
  const onOrderCityRemove = (selectedList, removedItem) => {
    setOrder((prev) => ({ ...prev, city: null }));
    setMasters(null);
  };
  const onOrderDateChange = (newValue) => {
    setOrder((prev) => ({ ...prev, startDate: new Date(newValue) }));
    setMasters(null);
  };
  const onOrderDateError = (reason) => {
    if (reason === 'invalidDate') return setDateTimeError({ reason, detail: reason });
    if (reason === 'minDate') return setDateTimeError({ reason, detail: 'Time is past' });
    if (reason === 'minTime') return setDateTimeError({ reason, detail: 'Time is past' });
    if (reason === 'disablePast') return setDateTimeError({ reason, detail: 'Date is past' });
    setDateTimeError(null);
  };

  const onSelectMaster = async (event, master) => {
    const result = await confirm(`Do you want to choose "${master.email}" as your master and submit order?`, {
      title: 'Confirm',
      okText: 'Place Order',
      okButtonStyle: 'success',
    });
    if (!result) return;

    setOrder((prev) => ({ ...prev, master: master }));

    resetBeforeApiCall();
    setMasters(null);

    doCreateOrder({
      client: { ...order.client },
      watchId: order.watch.id,
      cityId: order.city.id,
      masterId: master.id,
      startDate: order.startDate.getTime(),
      timezone: order.startDate.getTimezoneOffset(),
    });
  };

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Order page</h1>
        </center>
        <hr />

        {isLoading && (
          <center>
            <Spinner animation='grow' />
          </center>
        )}

        {isError && <ErrorContainer error={error} />}

        {isComponentReady && (
          <>
            <Row className='justify-content-md-center'>
              <Col xs lg='5'>
                {!isOrderConfirmationMessageReceived && (
                  <Form onSubmit={onFormSubmit}>
                    <Form.Group className='mb-3'>
                      <Form.Label>Email:</Form.Label>
                      <Form.Control
                        type='email'
                        name='email'
                        required
                        autoFocus
                        onChange={onClientEmailChange}
                        value={order.client.email}
                        isValid={isValidEmail(order.client.email)}
                        isInvalid={!isValidEmail(order.client.email)}
                        disabled={pending}
                      />
                      {order.client.email && (
                        <Form.Control.Feedback type='invalid'>Please provide a valid email (username@host.domain)</Form.Control.Feedback>
                      )}
                    </Form.Group>
                    <Form.Group className='mb-3'>
                      <Form.Label>Name:</Form.Label>
                      <Form.Control
                        type='text'
                        name='name'
                        required
                        onChange={onClientNameChange}
                        value={order.client.name}
                        isValid={isValidName(order.client.name)}
                        isInvalid={!isValidName(order.client.name)}
                        disabled={pending}
                      />
                      {order.client.name && (
                        <Form.Control.Feedback type='invalid'>Please provide a valid name (min length 3).</Form.Control.Feedback>
                      )}
                    </Form.Group>
                    <Form.Group className='mb-3'>
                      <>
                        {watches.map((watch) => (
                          <Form.Check
                            key={watch.id}
                            type='radio'
                            name='watch'
                            label={watch.name}
                            inline
                            required
                            onClick={(event) => onWatchTypeChange(event, watch)}
                            disabled={pending}
                          />
                        ))}
                      </>
                    </Form.Group>
                    <Form.Group className='mb-4'>
                      <Multiselect
                        placeholder='City'
                        displayValue='name'
                        onSelect={onOrderCitySelect}
                        onRemove={onOrderCityRemove}
                        options={cities}
                        selectedValues={order.cities}
                        selectionLimit={1}
                        disable={pending}
                      />
                    </Form.Group>
                    <Form.Group className='mb-3'>
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
                          value={order.startDate}
                          disabled={pending}
                        />
                      </LocalizationProvider>
                      {isDateTimeError && (
                        <strong style={{ color: 'red' }}>
                          <br />
                          {dateTimeError.detail}
                        </strong>
                      )}
                    </Form.Group>
                    <Button className='mb-3' type='submit' variant='success' disabled={!isFormValid()}>
                      {pending && <Spinner className='me-2' as='span' animation='grow' size='sm' role='status' aria-hidden='true' />}
                      Search
                    </Button>
                  </Form>
                )}

                {isOrderConfirmationMessageReceived && (
                  <Row className='justify-content-md-center'>
                    <Col md='auto'>
                      <Alert variant={'info'}>
                        <p>Thank you ! Confirmation message was sent to your email. </p>
                        <Container>
                          {Object.keys(orderConfirmationMessage).map((key, index) => (
                            <p key={index}>
                              {key.toString()}:{orderConfirmationMessage[key].toString()}
                            </p>
                          ))}
                        </Container>
                      </Alert>
                    </Col>
                    <Col md='auto'>
                      <Button variant='primary' onClick={setDefaultFormState}>
                        Create new order
                      </Button>
                    </Col>
                  </Row>
                )}
              </Col>
            </Row>

            {isLoadingMasters && (
              <center>
                <Spinner animation='grow' />{' '}
              </center>
            )}
            {isMasterListReady && (
              <>
                <Row className='justify-content-md-center'>
                  <hr />
                  {isAllMastersBussy && (
                    <Row className='justify-content-md-center'>
                      <Col md='auto'>
                        <Alert variant={'warning'}>There is no masters available at this moment which can handle your order</Alert>
                      </Col>
                    </Row>
                  )}

                  {masters.map((master) => (
                    <Col key={master.id} md='auto' onClick={(e) => onSelectMaster(e, master)}>
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
                </Row>
              </>
            )}
          </>
        )}
        <hr />
      </Container>
    </Container>
  );
};

export default Order;
