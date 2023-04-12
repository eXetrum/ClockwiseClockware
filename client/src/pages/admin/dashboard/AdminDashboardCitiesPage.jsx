import React, { useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';

import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

import { Header, CityForm, LoadingOverlay, NoRowsOverlay, DataGridFilterContainer } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { fetchCities, addCity, deleteCity } from '../../../store/thunks';
import {
  changeVisibilityAddCityForm,
  changeCityCurrentPage,
  changeCityPageSize,
  changeCitySortFieldName,
  changeCitySortOrder,
  addCityFilter,
  removeCityFilter,
} from '../../../store/actions';
import {
  selectAllCities,
  selectNewCity,
  selectCityError,
  selectCityInitialLoading,
  selectCityTotalItems,
  selectCityCurrentPage,
  selectCityPageSize,
  selectCitySortFielName,
  selectCitySortOrder,
  selectCityFilters,
} from '../../../store/selectors';

import { formatDecimal, buildFilter } from '../../../utils';
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

  const page = useSelector(selectCityCurrentPage);
  const pageSize = useSelector(selectCityPageSize);

  const sortFieldName = useSelector(selectCitySortFielName);
  const sortOrder = useSelector(selectCitySortOrder);

  const filters = useSelector(selectCityFilters);

  const fetchPage = useCallback(
    () =>
      dispatch(
        fetchCities({ offset: page * pageSize, limit: pageSize, orderBy: sortFieldName, order: sortOrder, filter: buildFilter(filters) }),
      ),
    [dispatch, page, pageSize, sortFieldName, sortOrder, filters],
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
      if (params.page !== page) dispatch(changeCityCurrentPage(params.page));
      if (params.pageSize !== pageSize) dispatch(changeCityPageSize(params.pageSize));
    },
    [dispatch, page, pageSize],
  );
  const onSortModelChange = useCallback(
    params => {
      const { field: fieldName = '', sort: order = '' } = params.length ? params[0] : {};
      if (fieldName !== sortFieldName) dispatch(changeCitySortFieldName(fieldName));
      if (order !== sortOrder) dispatch(changeCitySortOrder(order));
    },
    [dispatch, sortFieldName, sortOrder],
  );

  const onFilterApply = useCallback(
    ({ ...params }) => {
      dispatch(addCityFilter({ ...params }));
    },
    [dispatch],
  );

  const onFilterRemove = useCallback(
    ({ ...params }) => {
      dispatch(removeCityFilter({ ...params }));
    },
    [dispatch],
  );

  const columns = useMemo(
    () => [
      { field: 'name', headerName: 'Name', width: 620, type: 'string', flex: 1 },
      {
        field: 'pricePerHour',
        headerName: 'Hourly rate',
        width: 200,
        type: 'number',
        flex: 1,
        valueFormatter: ({ value }) => formatDecimal(value),
      },
      {
        field: 'actions',
        headerName: 'actions',
        type: 'actions',
        width: 200,
        flex: 1,
        filterable: false,
        disableReorder: true,
        getActions: ({ row }) => [
          <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => navigate(`/admin/cities/${row.id}`)} showInMenu />,
          <GridActionsCellItem icon={<DeleteForeverIcon />} label="Delete" onClick={() => onRemove(row)} showInMenu />,
        ],
      },
    ],
    [navigate, onRemove],
  );

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

          <DataGridFilterContainer columns={columns} filters={filters} onApply={onFilterApply} onDelete={onFilterRemove} />
          <DataGrid
            autoHeight
            disableRowSelectionOnClick
            disableColumnFilter
            rows={cities}
            columns={columns}
            loading={loading}
            hideFooterPagination={loading}
            paginationMode="server"
            sortingMode="server"
            filterMode="server"
            initialState={{
              pagination: { paginationModel: { pageSize, page } },
              sorting: { sortModel: [{ field: sortFieldName, sort: sortOrder }] },
            }}
            onPaginationModelChange={onPaginationModelChange}
            onSortModelChange={onSortModelChange}
            rowCount={totalItems}
            pageSizeOptions={PAGINATION_PAGE_SIZE_OPTIONS}
            components={{ LoadingOverlay, NoRowsOverlay: () => NoRowsOverlay({ error }) }}
          />

          <CityForm onSubmit={onFormSubmit} okButtonText={'Create'} titleText={'Add New City'} isModal={true} />
        </>
      </Container>
    </Container>
  );
};

export default AdminDashboardCitiesPage;
