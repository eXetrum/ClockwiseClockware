import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { PuffLoader } from 'react-spinners';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Header, ErrorContainer, OrderForm, AdminMastersList } from '../../../components';
import { getWatches, getCities, getOrderById, updateOrderById, getAvailableMasters } from '../../../api';
import { isGlobalError, getErrorText, addHours, dateRangesOverlap, dateToNearestHour } from '../../../utils';

const initEmptyOrder = () => ({ client: { name: '', email: '' }, master: null, city: null, startDate: dateToNearestHour() });

const AdminEditOrderPage = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { id } = useParams();

  const [watches, setWatches] = useState([]);
  const [cities, setCities] = useState([]);

  const [newOrder, setNewOrder] = useState(initEmptyOrder());
  const [originalOrder, setOriginalOrder] = useState(initEmptyOrder());
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedCities, setSelectedCities] = useState(null);
  const [lastAssignedCity, setLastAssignedCity] = useState(null);

  const [masters, setMasters] = useState([]);
  const [isShowMasters, setShowMasters] = useState(false);
  const [isPending, setPending] = useState(false);

  const isMasterAssigned = useMemo(() => newOrder?.master !== null, [newOrder]);
  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);

  const resetMasterList = () => {
    setShowMasters(false);
    setMasters([]);
  };

  const resetOrigOrder = (order) => {
    setNewOrder(order);
    setOriginalOrder(order);
    setSelectedCities([order.city]);
    setLastAssignedCity(order.city);
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

      response = await getOrderById({ id, abortController });
      if (response?.data?.order) {
        const { order } = response.data;
        order.startDate = new Date(order.startDate);
        resetOrigOrder(order);
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
        // Check if original master can handle current order
        const masterInMasterList = masters.find((item) => item.id === originalOrder.master.id) != null;
        if (!masterInMasterList && ensureMasterCanHandleOrder({ id, city, watch, startDate, master: originalOrder.master }))
          return setMasters([...masters, originalOrder.master]);

        setMasters(masters);
      }
    } catch (e) {
      if (isGlobalError(e) && e?.response?.status !== 400) return setError(e);
      resetOrigOrder(originalOrder);
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  const doUpdateOrderById = async ({ id, watch, city, master, startDate }) => {
    setPending(true);
    try {
      const order = {
        watchId: watch.id,
        cityId: city.id,
        masterId: master.id,
        startDate: startDate.getTime(),
      };

      await updateOrderById({ id, order });
      resetOrigOrder({ ...originalOrder, watch, city, master, startDate });
      enqueueSnackbar('Order updated', { variant: 'success' });
    } catch (e) {
      if (isGlobalError(e) && e?.response?.status !== 400) return setError(e);
      resetOrigOrder(originalOrder);
      enqueueSnackbar(`Error: ${getErrorText(e)}`, { variant: 'error' });
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    const abortController = new AbortController();
    fetchInitialData(id, abortController);
    return () => {
      abortController.abort();
      closeSnackbar();
    };
  }, [id, closeSnackbar, fetchInitialData]);

  const onFormSubmit = (event) => {
    event.preventDefault();
    doUpdateOrderById({ ...newOrder });
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
    resetOrigOrder(originalOrder);
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
    onFindMasterBtnClick,
    onResetBtnClick,
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

        {isInitialLoading ? (
          <center>
            <PuffLoader color="#36d7b7" />
          </center>
        ) : null}

        <ErrorContainer error={error} />

        {isComponentReady ? (
          <>
            <OrderForm {...{ order: newOrder, watches, cities, selectedCities, ...handlers, isPending }} />

            {isShowMasters ? (
              <>
                <hr />
                <AdminMastersList {...{ masters, onSelect: onSelectMaster, isAdminView: false }} />
              </>
            ) : null}
          </>
        ) : null}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminEditOrderPage;
