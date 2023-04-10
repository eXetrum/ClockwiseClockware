import React, { useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import { useSnackbar } from 'notistack';

import { DataGrid, GridToolbar, GridActionsCellItem, GridLogicOperator } from '@mui/x-data-grid';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';

import { Header, CityForm, LoadingOverlay, NoRowsOverlay, RoundedPaginationFooter } from '../../../components';

import { isFulfilled, isRejected } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';

import { fetchCities, addCity, deleteCity } from '../../../store/thunks';
import {
  changeVisibilityAddCityForm,
  changeCityCurrentPage,
  changeCityPageSize,
  changeCitySortFieldName,
  changeCitySortOrder,
} from '../../../store/actions';
import {
  selectAllCities,
  selectNewCity,
  selectCityError,
  selectCityInitialLoading,
  selectCityCurrentPage,
  selectCityPageSize,
  selectCityTotalItems,
  selectCitySortFielName,
  selectCitySortOrder,
} from '../../../store/selectors';

import { formatDecimal } from '../../../utils';
import { ERROR_TYPE, PAGINATION_PAGE_SIZE_OPTIONS } from '../../../constants';

const VISIBLE_FIELDS = ['name', 'rating'];

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

  const fetchPage = useCallback(
    () => dispatch(fetchCities({ offset: page * pageSize, limit: pageSize, orderBy: sortFieldName, order: sortOrder })),
    [dispatch, page, pageSize, sortFieldName, sortOrder],
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

  const onFilterModelChange = useCallback(filterModel => {
    console.log('onFilterModelChange: ', filterModel);
  }, []);

  const filterColumns = ({ field, columns, currentFilters }) => {
    // remove already filtered fields from list of columns
    const filteredFields = currentFilters?.map(item => item.field);
    return columns
      .filter(colDef => colDef.filterable && (colDef.field === field || !filteredFields.includes(colDef.field)))
      .map(column => column.field);
  };

  const getColumnForNewFilter = ({ currentFilters, columns }) => {
    const filteredFields = currentFilters?.map(({ field }) => field);
    const columnForNewFilter = columns
      .filter(colDef => colDef.filterable && !filteredFields.includes(colDef.field))
      .find(colDef => colDef.filterOperators?.length);
    return columnForNewFilter?.field ?? null;
  };

  const columns = useMemo(
    () => [
      { field: 'name', headerName: 'Name', width: 620, flex: 1 },
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

          <DataGrid
            autoHeight={true}
            disableRowSelectionOnClick={true}
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
              filterModel: {
                items: [
                  { id: 1, field: 'rating', operator: '>', value: '1' },
                  { id: 2, field: 'name', operator: 'contains', value: 'q' },
                ],
                logicOperator: GridLogicOperator.Or,
              },
            }}
            onPaginationModelChange={onPaginationModelChange}
            onSortModelChange={onSortModelChange}
            onFilterModelChange={onFilterModelChange}
            rowCount={totalItems}
            pageSizeOptions={PAGINATION_PAGE_SIZE_OPTIONS}
            components={{
              LoadingOverlay,
              NoRowsOverlay: () => NoRowsOverlay({ error }),
              Toolbar: GridToolbar,
            }}
            componentsProps={{
              filterPanel: {
                disableAddFilterButton: false,
                disableRemoveAllButton: false,
              },
            }}
            visibleFields={VISIBLE_FIELDS}
          />

          <CityForm onSubmit={onFormSubmit} okButtonText={'Create'} titleText={'Add New City'} isModal={true} />
        </>
      </Container>
    </Container>
  );
};

export default AdminDashboardCitiesPage;
