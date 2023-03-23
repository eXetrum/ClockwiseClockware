import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import { Header, OrderForm, AdminMastersList, ErrorContainer } from '../../components';
import { getWatches, getCities, getAvailableMasters, createOrder } from '../../api';
import { addHours, dateRangesOverlap, dateToNearestHour, isGlobalError, getErrorText } from '../../utils';

const initEmptyOrder = () => ({ client: { name: '', email: '' }, master: null, city: null, watch: null, startDate: dateToNearestHour() });

const OrderPage = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const navigate = useNavigate();
  const location = useLocation();

  const [watches, setWatches] = useState([]);
  const [cities, setCities] = useState([]);

  const [newOrder, setNewOrder] = useState(location?.state?.order || initEmptyOrder());
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedCities, setSelectedCities] = useState(location?.state?.order?.city ? [location?.state?.order?.city] : []);
  const [lastAssignedCity, setLastAssignedCity] = useState(null);

  const [masters, setMasters] = useState([]);
  const [isShowMasters, setShowMasters] = useState(false);
  const [isPending, setPending] = useState(false);

  const [orderConfirmationMessage, setOrderConfirmationMessage] = useState(null);

  const isOrderConfirmationMessageReceived = useMemo(() => orderConfirmationMessage !== null, [orderConfirmationMessage]);
  const isMasterAssigned = useMemo(() => newOrder?.master !== null, [newOrder]);
  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);

  const resetMasterList = () => {
    setShowMasters(false);
    setMasters([]);
  };

  const resetOrigOrder = (order) => {
    setNewOrder(order);
    setSelectedCities([]);
    setLastAssignedCity(null);
    setOrderConfirmationMessage(null);
  };

  const ensureMasterCanServeCity = (master, city) => master?.cities?.find((item) => item.id === city.id);
  const ensureMasterSchedule = (schedule, startDate, endDate) =>
    schedule.some((item) => dateRangesOverlap(startDate, endDate, new Date(item.startDate), new Date(item.endDate)));
  const ensureMasterCanHandleOrder = ({ id, watch, city, master, startDate }) => {
    // Master cant handle selected city
    if (!ensureMasterCanServeCity(master, city)) return false;

    const schedule = master.orders.filter((item) => item.id !== id);
    return !ensureMasterSchedule(schedule, startDate, addHours(startDate, watch.repairTime));
  };

  const fetchInitialData = useCallback(async (id, abortController) => {
    try {
      setInitialLoading(true);
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
      setInitialLoading(false);
    }
  }, []);

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

  useEffect(() => {
    const abortController = new AbortController();
    fetchInitialData(abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [closeSnackbar, fetchInitialData]);

  const onFormSubmit = (event) => {
    event.preventDefault();
    doCreateOrder({ ...newOrder });
  };

  const onClientEmailChange = (event) => setNewOrder((prev) => ({ ...prev, client: { ...prev.client, email: event.target.value } }));
  const onClientNameChange = (event) => setNewOrder((prev) => ({ ...prev, client: { ...prev.client, name: event.target.value } }));

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
                    <Button variant="primary" onClick={() => resetOrigOrder(initEmptyOrder())}>
                      Create new order
                    </Button>
                  </Col>
                </Row>
              </>
            ) : (
              <>
                <OrderForm
                  {...{
                    order: newOrder,
                    watches,
                    cities,
                    selectedCities,
                    ...handlers,
                    isPending,
                    isEditForm: false,
                    successButtonText: 'Create',
                  }}
                />
                {isShowMasters ? (
                  <>
                    <hr />
                    <AdminMastersList {...{ masters, onSelect: onSelectMaster, isAdminView: false }} />
                  </>
                ) : null}
              </>
            )}
          </>
        ) : null}
        <hr />
      </Container>
    </Container>
  );
};

export default OrderPage;
