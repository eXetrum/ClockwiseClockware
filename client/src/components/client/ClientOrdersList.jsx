import React from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';

import { formatDecimal, formatDate } from '../../utils';
import { ORDER_STATUS } from '../../constants';

const ClientOrdersList = ({ orders, onReview }) => {
  const columns = [
    { field: 'master.name', headerName: 'Master Name', width: 240, valueGetter: params => params.row.master.name },
    { field: 'watch', headerName: 'Service', valueGetter: params => params.row.watch.name },
    { field: 'city', headerName: 'City', width: 200, valueGetter: params => params.row.city.name },
    {
      field: 'startDate',
      headerName: 'Date Start',
      width: 140,
      type: 'dateTime',
      valueFormatter: ({ value }) => formatDate(value),
    },
    {
      field: 'endDate',
      headerName: 'End Start',
      width: 140,
      type: 'dateTime',
      valueFormatter: ({ value }) => formatDate(value),
    },
    {
      field: 'status',
      headerName: 'Status',
    },
    {
      field: 'totalCost',
      headerName: 'Total Cost',
      type: 'number',
      valueFormatter: ({ value }) => formatDecimal(value),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      headerAlign: 'center',
      width: 120,
      align: 'center',
      renderCell: params => {
        if (params.row.rating === null) {
          return (
            <GridActionsCellItem
              icon={<ThumbUpOutlinedIcon />}
              label="Rate"
              onClick={() => onReview(params.row)}
              disabled={params.row.status !== ORDER_STATUS.COMPLETED || params.row.isEvaluating}
            />
          );
        }
        return <span>{params.row.rating}</span>;
      },
    },
  ];

  if (!orders.length) {
    return (
      <Row className="justify-content-md-center mt-3">
        <Col md="auto">
          <Alert variant="warning" className="text-center">
            No records yet
          </Alert>
        </Col>
      </Row>
    );
  }

  return <DataGrid rows={orders} columns={columns} rowsPerPageOptions={[]} hideFooter={true} autoHeight />;
};

export default ClientOrdersList;
