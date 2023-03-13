import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useSnackbar } from 'notistack';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import { Header, ErrorContainer, MasterForm } from '../../../components';
import { getCities, getMasterById, updateMasterById } from '../../../api';
import { isGlobalError, getErrorText } from '../../../utils';

const AdminEditMasterPage = () => {
  const { id } = useParams();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const initEmptyMaster = () => ({ email: '', password: '', name: '', rating: 0, isActive: false, cities: [] });

  const [cities, setCities] = useState([]);
  const [master, setMaster] = useState(initEmptyMaster());
  const [originalMaster, setOriginalMaster] = useState(initEmptyMaster());
  const [isInitialLoading, setInitialLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isPending, setPending] = useState(false);
  const isComponentReady = useMemo(() => !isInitialLoading && error === null, [isInitialLoading, error]);

  const fetchInitialData = async (id, abortController) => {
    setInitialLoading(true);
    try {
      let response = await getCities({ abortController });
      if (response?.data?.cities) {
        const { cities } = response.data;
        setCities(cities);
      }

      response = await getMasterById({ id, abortController });
      if (response?.data?.master) {
        const { master } = response.data;
        setMaster(master);
        setOriginalMaster(master);
      }
    } catch (e) {
      setError(e);
    } finally {
      setInitialLoading(false);
    }
  };

  const doUpdateMasterById = async (id, master) => {
    setPending(true);
    try {
      const response = await updateMasterById({ id, master });
      if ([200, 204].includes(response?.status)) {
        setMaster(master);
        setOriginalMaster(master);
        enqueueSnackbar('Master updated', { variant: 'success' });
      }
    } catch (e) {
      if (isGlobalError(e) && e?.response?.status !== 400) return setError(e);
      setMaster(originalMaster);
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
  }, [id, closeSnackbar]);

  const onFormSubmit = (event) => {
    event.preventDefault();
    doUpdateMasterById(id, master);
  };

  const onMasterEmailChange = (event) => setMaster((prevState) => ({ ...prevState, email: event.target.value }));
  const onMasterNameChange = (event) => setMaster((prevState) => ({ ...prevState, name: event.target.value }));
  const onMasterRatingChange = (value) => setMaster((prevState) => ({ ...prevState, rating: value }));
  const onMasterIsActiveChange = (event) => setMaster((prev) => ({ ...prev, isActive: event.target.checked }));
  const onMasterCitySelect = (selectedList, selectedItem) => setMaster((prevState) => ({ ...prevState, cities: selectedList }));
  const onMasterCityRemove = (selectedList, removedItem) => setMaster((prevState) => ({ ...prevState, cities: selectedList }));

  const handlers = {
    onFormSubmit,
    onMasterEmailChange,
    onMasterNameChange,
    onMasterRatingChange,
    onMasterIsActiveChange,
    onMasterCitySelect,
    onMasterCityRemove,
  };

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Edit Master</h1>
          <Link to={'/admin/masters'}>
            <ArrowLeftIcon />
            Back
          </Link>
        </center>
        <hr />

        {isInitialLoading && (
          <center>
            <Spinner animation="grow" />
          </center>
        )}

        <ErrorContainer error={error} />

        {isComponentReady && <MasterForm {...{ isPending, master, cities, ...handlers }} />}
        <hr />
      </Container>
    </Container>
  );
};

export default AdminEditMasterPage;
