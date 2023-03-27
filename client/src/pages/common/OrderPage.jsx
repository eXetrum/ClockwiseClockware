import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import { Header, OrderForm, AdminMastersList, ErrorContainer } from '../../components';

import { useDispatch, useSelector } from 'react-redux';
import { fetchWatches, fetchCities, addOrder } from '../../store/reducers/ActionCreators';
import { watchSlice, cityReducer, orderSlice } from '../../store/reducers';

import { addHours, dateRangesOverlap, dateToNearestHour, isGlobalError, getErrorText } from '../../utils';
import { ERROR_TYPE } from '../../constants';

import { getAvailableMasters, createOrder } from '../../api';

//const initEmptyOrder = () => ({ client: { name: '', email: '' }, master: null, city: null, watch: null, startDate: dateToNearestHour() });

const OrderPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { watches, isInitialLoading: isInitialLoadingWatches } = useSelector((state) => state.watchReducer);
  const { cities, isInitialLoading: isInitialLoadingCities } = useSelector((state) => state.cityReducer);
  const { resetNewOrder } = orderSlice.actions;
  const { newOrder, error } = useSelector((state) => state.orderReducer);

  useEffect(() => {
    dispatch(fetchWatches());
    dispatch(fetchCities());
    dispatch(resetNewOrder(location?.state?.order));
  }, [dispatch, location, resetNewOrder]);

  const isInitialLoading = useMemo(
    () => isInitialLoadingWatches || isInitialLoadingCities,
    [isInitialLoadingWatches, isInitialLoadingCities],
  );
  const isComponentReady = useMemo(
    () => !isInitialLoading && (error.type === ERROR_TYPE.NONE || error.type === ERROR_TYPE.UNKNOWN),
    [isInitialLoading, error],
  );

  console.log(newOrder);

  //const [watches, setWatches] = useState([]);
  //const [cities, setCities] = useState([]);
  //const [newOrder, setNewOrder] = useState(location?.state?.order || initEmptyOrder());
  //const [isInitialLoading, setInitialLoading] = useState(false);
  //const [error, setError] = useState(null);

  const [masters, setMasters] = useState([]);
  const [isShowMasters, setShowMasters] = useState(false);
  const [isPending, setPending] = useState(false);

  const [orderConfirmationMessage, setOrderConfirmationMessage] = useState(null);

  const isOrderConfirmationMessageReceived = useMemo(() => orderConfirmationMessage !== null, [orderConfirmationMessage]);
  const isMasterAssigned = useMemo(() => newOrder?.master !== null, [newOrder]);
  //const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);

  const resetMasterList = () => {
    setShowMasters(false);
    setMasters([]);
  };

  /*
  const fetchAvailableMasters = async ({ id, city, watch, startDate }) => {
    setPending(true);
    resetMasterList();
    try {
      const response = await getAvailableMasters({
        cityId: city.id,
        watchId: watch.id,
        startDate: startDate.getTime(),
      });
      if (response?.data?.masters) {
        const { masters } = response.data;
        setShowMasters(true);
        setMasters(masters);
      }
    } catch (e) {
      if (isGlobalError(e) && e?.response?.status !== 400) return setError(e);
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  const doCreateOrder = async ({ client, watch, city, master, startDate }) => {
    setPending(true);
    try {
      const order = {
        client,
        watchId: watch.id,
        cityId: city.id,
        masterId: master.id,
        startDate: startDate.getTime(),
        timezone: startDate.getTimezoneOffset(),
      };
      const response = await createOrder({ order });
      if (response.data.confirmation) {
        const { confirmation } = response.data;
        setOrderConfirmationMessage(confirmation);
        enqueueSnackbar('Order placed', { variant: 'success' });
      }
    } catch (e) {
      if (isGlobalError(e) && e?.response?.status !== 403) return setError(e);

      if (e?.response?.status === 403) {
        const result = await confirm(
          `User with specified email already exists. To continue you need to login with ${client.email} first. Proceed ?`,
          {
            title: 'User already exists',
            okText: 'Yes',
            cancelText: 'No',
            okButtonStyle: 'success',
          },
        );
        if (result) navigate('/login', { state: { from: location, order: newOrder } });
      } else {
        enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
      }
    } finally {
      setPending(false);
    }
  };

  const onFormSubmit = (event) => {
    event.preventDefault();
    doCreateOrder({ ...newOrder });
  };


  const onOrderCitySelect = async (selectedList, newCity) => {
    if (!isMasterAssigned || ensureMasterCanHandleOrder({ ...newOrder, city: newCity })) {
      setNewOrder((prev) => ({ ...prev, city: newCity }));
      setSelectedCities([newCity]);
      resetMasterList();
      return;
    }

    // Master assigned but CAN`T handle current order setup: two options here, revert to prev city, search for new master
    const result = await confirm(`"${newOrder.master.email}" master cant handle your order. Do you want to search new master ?`, {
      title: 'Confirm',
      okText: 'Search',
      okButtonStyle: 'warning',
    });

    // Accept -> drop current master
    if (result) {
      resetMasterList();
      setNewOrder((prev) => ({ ...prev, city: newCity, master: null }));
      setSelectedCities([newCity]);
      return fetchAvailableMasters({ ...newOrder, city: newCity, master: null });
    }

    // Cancel -> revert to prev city
    setNewOrder((prev) => ({ ...prev, city: lastAssignedCity }));
    setSelectedCities([lastAssignedCity]);
  };

  const onOrderCityRemove = (selectedList, removedItem) => {
    setLastAssignedCity(removedItem);
    setNewOrder((prev) => ({ ...prev, city: null }));
    setSelectedCities([]);
    resetMasterList();
  };

  const onOrderWatchTypeChange = async (event, newWatch) => {
    if (!isMasterAssigned || ensureMasterCanHandleOrder({ ...newOrder, watch: newWatch })) {
      setNewOrder((prev) => ({ ...prev, watch: newWatch }));
      resetMasterList();
      return;
    }

    const result = await confirm(`"${newOrder.master.email}" master cant handle your order. Do you want to search new master ?`, {
      title: 'Confirm',
      okText: 'Search',
      okButtonStyle: 'warning',
    });

    if (result) {
      setNewOrder((prev) => ({ ...prev, watch: newWatch, master: null }));
      fetchAvailableMasters({ ...newOrder, watch: newWatch, master: null });
    }
  };

  const onOrderDateChange = (newValue) => {
    setNewOrder((prev) => ({ ...prev, startDate: new Date(newValue) }));
    resetMasterList();
  };

  const onFindMasterBtnClick = (event) => {
    event.preventDefault();
    setNewOrder((prev) => ({ ...prev, master: null }));
    fetchAvailableMasters({ ...newOrder, master: null });
  };

  const onResetBtnClick = (event) => {
    event.preventDefault();
    resetOrigOrder(initEmptyOrder());
    resetMasterList();
  };

  const onSelectMaster = async (master) => {
    const result = await confirm(`Do you want to select "${master.email}" as your master ?`, {
      title: 'Confirm',
      okText: 'Accept',
      okButtonStyle: 'success',
    });
    if (!result) return;

    setNewOrder((prev) => ({ ...prev, master }));
    resetMasterList();
  };

  const handlers = {
    onFormSubmit,
    onOrderWatchTypeChange,
    onOrderCitySelect,
    onOrderCityRemove,
    onOrderDateChange,
    onClientEmailChange,
    onClientNameChange,
    onFindMasterBtnClick,
    onResetBtnClick,
  };
  */

  const onSelectMaster = () => {};

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Order page</h1>
        </center>
        <hr />

        {isInitialLoading ? (
          <center>
            <PuffLoader color="#36d7b7" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? (
          <>
            {isOrderConfirmationMessageReceived ? (
              <>
                <Row className="justify-content-md-center">
                  <Col md="auto">
                    <Alert variant={'info'}>
                      <Container>
                        <h5 className="text-center mb-4">Thank you ! Order confirmation message was sent to your email. </h5>
                        <Row className="mb-3">
                          <Col>
                            <b>Order ID:</b>
                          </Col>
                          <Col>{orderConfirmationMessage.orderId}</Col>
                        </Row>
                        {orderConfirmationMessage.autoRegistration ? (
                          <Row>
                            <Col>
                              <b>Registration information:</b>
                            </Col>
                            <Col>
                              {Object.keys(orderConfirmationMessage.autoRegistration).map((key, index) => (
                                <Row key={index}>
                                  <Col sm={4}>
                                    <i>{key.toString()}</i>
                                  </Col>
                                  :<Col>{orderConfirmationMessage.autoRegistration[key].toString()}</Col>
                                </Row>
                              ))}
                            </Col>
                          </Row>
                        ) : null}
                      </Container>
                    </Alert>
                  </Col>
                </Row>
                <hr />
                <Row className="justify-content-md-center">
                  <Col md="auto">
                    <Button variant="primary" onClick={() => dispatch(resetNewOrder())}>
                      Create new order
                    </Button>
                  </Col>
                </Row>
              </>
            ) : (
              <OrderForm {...{ watches, cities, isEditForm: false, successButtonText: 'Create' }} />
            )}
          </>
        ) : null}
        <hr />
      </Container>
    </Container>
  );
};

export default OrderPage;
