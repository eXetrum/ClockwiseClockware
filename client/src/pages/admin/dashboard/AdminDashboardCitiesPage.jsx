import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';

import { DataGrid, GridToolbar, GridActionsCellItem } from '@mui/x-data-grid';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

import { Header, CityForm, LoadingOverlay, NoRowsOverlay } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { fetchCities, addCity, deleteCity } from '../../../store/thunks';
import { changeVisibilityAddCityForm } from '../../../store/actions';
import { selectAllCities, selectNewCity, selectCityError, selectCityInitialLoading, selectCityTotalItems } from '../../../store/selectors';

import { formatDecimal } from '../../../utils';
import { ERROR_TYPE, PAGINATION_PAGE_SIZE_OPTIONS } from '../../../constants';

const AdminDashboardCitiesPage = () => {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cities = useSelector(selectAllCities);
  const newCity = useSelector(selectNewCity);
  const error = useSelector(selectCityError);
  const loading = useSelector(selectCityInitialLoading);
  const totalItems = useSelector(selectCityTotalItems);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGINATION_PAGE_SIZE_OPTIONS[0]);

  const fetchPage = useCallback(
    () => dispatch(fetchCities({ offset: page * rowsPerPage, limit: rowsPerPage })),
    [dispatch, page, rowsPerPage],
  );

  useEffect(() => fetchPage(), [fetchPage]);

  const onRemove = useCallback(
    async city => {
      const result = await confirm(`Do you want to delete "${city.name}" city ?`, {
        title: 'Confirm',
        okText: 'Delete',
        okButtonStyle: 'danger',
      });
      if (!result) return;

      const action = await dispatch(deleteCity(city.id));
      if (isFulfilled(action)) {
        enqueueSnackbar(`City "${city.name}" removed`, { variant: 'success' });
        fetchPage();
      } else if (isRejected(action)) {
        enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
        if (action.payload.type === ERROR_TYPE.ENTRY_NOT_FOUND) fetchPage();
      }
    },
    [dispatch, enqueueSnackbar, fetchPage],
  );

  const onFormSubmit = useCallback(
    async event => {
      event.preventDefault();
      const action = await dispatch(addCity(newCity));
      if (isFulfilled(action)) {
        enqueueSnackbar(`City "${action.payload.name}" created`, { variant: 'success' });
        fetchPage();
      } else if (isRejected(action)) enqueueSnackbar(`Error: ${action.payload.message}`, { variant: 'error' });
    },
    [dispatch, enqueueSnackbar, newCity, fetchPage],
  );

  const onFormShow = useCallback(() => dispatch(changeVisibilityAddCityForm(true)), [dispatch]);

  const onPaginationModelChange = useCallback(
    params => {
      setPage(params.page);
      setRowsPerPage(params.pageSize);
    },
    [setPage, setRowsPerPage],
  );

  const columns = [
    { field: 'name', headerName: 'Name', width: 620 },
    {
      field: 'pricePerHour',
      headerName: 'Hourly rate',
      width: 200,
      type: 'number',
      valueFormatter: ({ value }) => formatDecimal(value),
    },
    {
      field: 'actions',
      headerName: 'actions',
      type: 'actions',
      width: 200,
      disableReorder: true,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => navigate(`/admin/cities/${row.id}`)} showInMenu />,
        <GridActionsCellItem icon={<DeleteForeverIcon />} label="Delete" onClick={() => onRemove(row)} showInMenu />,
      ],
    },
  ];

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Admin: Cities Dashboard</h1>
        </center>
        <hr />

        <>
          <Row className="justify-content-md-center">
            <Col className="d-flex justify-content-center">
              <Link to="#">
                <AddCircleOutlineOutlinedIcon onClick={onFormShow} />
              </Link>
            </Col>
          </Row>
          <hr />

          <DataGrid
            autoHeight={true}
            disableRowSelectionOnClick={true}
            rows={cities}
            columns={columns}
            loading={loading}
            hideFooterPagination={loading}
            initialState={{ pagination: { paginationModel: { pageSize: rowsPerPage, page } } }}
            onPaginationModelChange={onPaginationModelChange}
            rowCount={totalItems}
            paginationMode="server"
            pageSizeOptions={PAGINATION_PAGE_SIZE_OPTIONS}
            components={{ LoadingOverlay, NoRowsOverlay: () => NoRowsOverlay({ error }), Toolbar: GridToolbar }}
          />

          <CityForm onSubmit={onFormSubmit} okButtonText={'Create'} titleText={'Add New City'} isModal={true} />
        </>
      </Container>
    </Container>
  );
};

export default AdminDashboardCitiesPage;
