import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ViewMasterCard from '../master/ViewMasterCard';
import StarRating from '../common/StarRating';

import { useDispatch } from 'react-redux';
import { resetPasswordMaster, resendEmailConfirmationMaster } from '../../store/reducers/ActionCreators';

const MasterTableList = ({ masters, onRemove }) => {
  const dispatch = useDispatch();

  const onResetPassword = async (master) => {
    const result = await confirm(`Do you want to reset password for "${master.email}" master ?`, {
      title: 'Confirm',
      okText: 'Yes',
      okButtonStyle: 'danger',
    });

    if (result) dispatch(resetPasswordMaster(master.id));
  };

  const onResendEmailConfirmation = async (master) => {
    const result = await confirm(`Do you want to resend email confirmation for "${master.email}" master ?`, {
      title: 'Confirm',
      okText: 'Yes',
      okButtonStyle: 'danger',
    });

    if (result) dispatch(resendEmailConfirmationMaster(master.id));
  };

  return (
    <Container>
      <Table striped bordered responsive size="sm" className="mt-3">
        <thead>
          <tr>
            <th className="text-center p-3 m-0">id</th>
            <th className="text-center p-3 m-0">email</th>
            <th className="text-center p-3 m-0">name</th>
            <th className="text-center p-3 m-0">cities</th>
            <th className="text-center p-3 m-0">rating</th>
            <th className="text-center p-3 m-0">approved</th>
            <th colSpan="3" className="text-center p-2 m-0"></th>
          </tr>
        </thead>
        <tbody>
          {masters.map((master) => (
            <tr key={master.id}>
              <td className="text-center p-3 m-0 col-2">{master.id}</td>
              <td className="p-3 m-0">
                <Stack direction="row" alignItems="center" gap={1}>
                  {master.isEmailVerified ? <CheckIcon fontSize="small" /> : <QuestionMarkIcon fontSize="small" />}
                  <Typography variant="body1">{master.email}</Typography>
                </Stack>
              </td>
              <td className="p-3 m-0">{master.name}</td>
              <td className="text-center  pt-2 m-0">
                {master.cities.map((city) => (
                  <Badge bg="info" className="p-2 m-1" key={city.id}>
                    {city.name}
                  </Badge>
                ))}
              </td>
              <td className="text-center p-2 m-0">
                <StarRating total={5} value={master.rating} readonly={true} />
                <b>{master.rating}/5</b>
              </td>
              <td className="text-center p-2 m-0">
                {master.isApprovedByAdmin ? <Badge bg="success">Yes</Badge> : <Badge bg="secondary">No</Badge>}
              </td>
              <td className="text-center p-2 m-0 col-2">
                <Stack spacing={1}>
                  <Button
                    size="sm"
                    variant="outline-warning"
                    onClick={() => onResetPassword(master)}
                    disabled={master.isPendingResetPassword}
                  >
                    {master.isPendingResetPassword ? (
                      <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                    ) : null}
                    Reset password
                  </Button>
                  {!master.isEmailVerified ? (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => onResendEmailConfirmation(master)}
                      disabled={master.isPendingResendEmailConfirmation}
                    >
                      {master.isPendingResendEmailConfirmation ? (
                        <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                      ) : null}
                      Resend email confirmation
                    </Button>
                  ) : null}
                </Stack>
              </td>
              <>
                <td className="text-center p-3 m-0">
                  <Link to={'/admin/masters/' + master.id}>
                    <EditIcon />
                  </Link>
                </td>
                <td className="text-center p-3 m-0">
                  <Link to="#">
                    <DeleteForeverIcon onClick={() => onRemove(master.id)} />
                  </Link>
                </td>
              </>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

const MasterCardList = ({ masters, onSelect }) => {
  return (
    <Container>
      <Row className="justify-content-md-center mt-4">
        <>
          {masters.map((master) => (
            <Col key={master.id} md="auto" onClick={() => onSelect(master)}>
              <ViewMasterCard master={master} />
            </Col>
          ))}
        </>
      </Row>
    </Container>
  );
};

const AdminMastersList = ({ masters, onSelect, onRemove, isAdminView = true }) => {
  if (masters == null) return null;
  const collectionIsEmptyText = isAdminView ? 'No records yet' : 'There is no masters available at this moment which can handle your order';

  if (masters.length === 0) {
    return (
      <Container>
        <Row className="justify-content-md-center mt-3">
          <Col md="auto">
            <Alert variant="warning">{collectionIsEmptyText}</Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  if (isAdminView) return <MasterTableList masters={masters} onRemove={onRemove} />;
  return <MasterCardList masters={masters} onSelect={onSelect} />;
};

export default AdminMastersList;
