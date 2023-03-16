import React, { useState, useMemo, useCallback } from 'react';
import { Form, Row, Col, Button, Spinner } from 'react-bootstrap';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import Multiselect from 'multiselect-react-dropdown';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import ViewMasterCard from '../master/ViewMasterCard';
import { validateEmail, dateToNearestHour } from '../../utils';

import { ORDER_STATUS_ENUM } from '../../constants';

const OrderForm = ({
  order,
  watches,
  cities,
  selectedCities,
  onFormSubmit,
  onOrderWatchTypeChange,
  onOrderCitySelect,
  onOrderCityRemove,
  onOrderDateChange,
  onOrderStatusChange,
  onFindMasterBtnClick,
  onResetBtnClick,
  onClientEmailChange,
  onClientNameChange,
  isPending,
  isEditForm = true,
  successButtonText = 'Save',
}) => {
  const [dateTimeError, setDateTimeError] = useState(null);
  const isDateTimeError = useMemo(
    () => ['invalidDate', 'minTime', 'minDate', 'disablePast'].includes(dateTimeError?.reason),
    [dateTimeError],
  );

  const onOrderDateError = useCallback((reason) => {
    if (reason === 'invalidDate') return setDateTimeError({ reason, detail: reason });
    if (reason === 'minDate') return setDateTimeError({ reason, detail: 'Time is past' });
    if (reason === 'minTime') return setDateTimeError({ reason, detail: 'Time is past' });
    if (reason === 'disablePast') return setDateTimeError({ reason, detail: 'Date is past' });
    setDateTimeError(null);
  }, []);

  const isMasterAssigned = useMemo(() => order?.master !== null, [order]);
  const isOrderPreparedForMasterSearch = useMemo(
    () => order !== null && order?.city !== null && order?.watch !== null && order?.startDate !== null,
    [order],
  );

  const isValidEmail = (email) => validateEmail(email);
  const isValidName = (name) => name?.length >= 3;

  const currentDate = dateToNearestHour();

  const isOrderReady = useMemo(
    () =>
      order?.city !== null &&
      order?.master !== null &&
      order?.startDate >= currentDate &&
      isValidName(order?.client?.name) &&
      isValidEmail(order?.client?.email),
    [order, currentDate],
  );

  return (
    <Row className="justify-content-md-center">
      <Col xs lg="6">
        <Form onSubmit={onFormSubmit}>
          {isEditForm ? (
            <>
              <hr />
              <Form.Group>
                <Row>
                  <Col sm={4}>
                    <Form.Label>
                      <b>Status:</b>
                    </Form.Label>
                  </Col>
                  <Col>
                    {ORDER_STATUS_ENUM.map((status) => (
                      <Form.Check
                        key={status}
                        type="radio"
                        name="status"
                        label={status}
                        checked={order?.status === status}
                        inline
                        required
                        onChange={(event) => onOrderStatusChange(event, status)}
                        disabled={isPending}
                      />
                    ))}
                  </Col>
                </Row>
              </Form.Group>
            </>
          ) : null}

          <hr />
          <Form.Group>
            <Row>
              <Col sm={4}>
                <Form.Label>
                  <b>Client:</b>
                </Form.Label>
              </Col>
              <Col>
                {isEditForm ? (
                  <small className="text-muted fst-italic">{order.client.name}</small>
                ) : (
                  <>
                    <Form.Control
                      type="email"
                      name="email"
                      autoFocus
                      required
                      placeholder="Email"
                      onChange={onClientEmailChange}
                      value={order.client.email}
                      isValid={isValidEmail(order.client.email)}
                      isInvalid={!isValidEmail(order.client.email)}
                      disabled={isPending}
                    />
                    {order.client.email && (
                      <Form.Control.Feedback type="invalid">Please provide a valid email (username@host.domain)</Form.Control.Feedback>
                    )}
                  </>
                )}
              </Col>
              <Col>
                {isEditForm ? (
                  <small className="text-muted fst-italic">{order.client.email}</small>
                ) : (
                  <>
                    <Form.Control
                      type="text"
                      name="name"
                      required
                      placeholder="Name"
                      onChange={onClientNameChange}
                      value={order.client.name}
                      isValid={isValidName(order.client.name)}
                      isInvalid={!isValidName(order.client.name)}
                      disabled={isPending}
                    />
                    {order.client.name && (
                      <Form.Control.Feedback type="invalid">Please provide a valid name (min length 3).</Form.Control.Feedback>
                    )}
                  </>
                )}
              </Col>
            </Row>
          </Form.Group>
          <hr />
          <Form.Group className="mb-3">
            <Row>
              <Col sm={4}>
                <Form.Label>
                  <b>Watch Type:</b>
                </Form.Label>
              </Col>
              <Col className="justify-content-md-center">
                {watches.map((watch) => (
                  <Form.Check
                    key={watch.id}
                    type="radio"
                    name="watch"
                    label={watch.name}
                    checked={order?.watch?.id === watch.id}
                    inline
                    required
                    onChange={(event) => onOrderWatchTypeChange(event, watch)}
                    disabled={isPending}
                  />
                ))}
              </Col>
            </Row>
          </Form.Group>
          <hr />
          <Form.Group className="mb-3">
            <Row>
              <Col sm={4}>
                <Form.Label>
                  <b>City:</b>
                </Form.Label>
              </Col>
              <Col>
                <Multiselect
                  placeholder="City"
                  displayValue="name"
                  onSelect={onOrderCitySelect}
                  onRemove={onOrderCityRemove}
                  options={cities}
                  selectedValues={selectedCities}
                  selectionLimit={1}
                  disable={isPending}
                />
              </Col>
            </Row>
          </Form.Group>
          <hr />
          <Form.Group className="mb-3">
            <Row>
              <Col sm={4}>
                <Form.Label>
                  <b>Date/Time:</b>
                </Form.Label>
              </Col>
              <Col>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="DateTimePicker"
                    renderInput={(props) => <TextField {...props} />}
                    views={['year', 'month', 'day', 'hours']}
                    onChange={onOrderDateChange}
                    onError={onOrderDateError}
                    ampm={false}
                    disablePast={true}
                    minDateTime={dayjs(currentDate)}
                    value={order.startDate}
                    disabled={isPending}
                  />
                </LocalizationProvider>
                {isDateTimeError && (
                  <strong style={{ color: 'red' }}>
                    <br />
                    {dateTimeError.detail}
                  </strong>
                )}
              </Col>
            </Row>
          </Form.Group>
          <hr />

          <Form.Group className="mb-4">
            <Row>
              <Col sm={4}>
                <Row>
                  <Form.Label>
                    <b>Master:</b>
                  </Form.Label>
                </Row>
                <Row>
                  <Col>
                    <Button
                      className="mb-2 btn btn-sm"
                      variant="warning"
                      onClick={onFindMasterBtnClick}
                      disabled={isPending || !isOrderPreparedForMasterSearch}
                    >
                      {isMasterAssigned ? <HighlightOffOutlinedIcon fontSize="small" /> : null}
                      Find New Master
                    </Button>
                  </Col>
                </Row>
              </Col>
              <Col>{isMasterAssigned ? <ViewMasterCard master={order.master} /> : <span>Master is not assigned yet</span>}</Col>

              <Row className="mt-4">
                <Col md={{ span: 4, offset: 0 }}></Col>
              </Row>
            </Row>
          </Form.Group>
          <hr />
          <Form.Group>
            <Row className="justify-content-md-center mt-4">
              <Col className="d-flex justify-content-md-end">
                <Button className="mb-3 col-sm-4" onClick={onResetBtnClick} disabled={isPending}>
                  Reset
                </Button>
              </Col>
              <Col className="d-flex justify-content-md-end">
                <Button className="mb-3 col-sm-4" type="submit" variant="success" disabled={isPending || !isOrderReady}>
                  {isPending && <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}
                  {successButtonText}
                </Button>
              </Col>
            </Row>
          </Form.Group>
        </Form>
      </Col>
    </Row>
  );
};

export default OrderForm;
