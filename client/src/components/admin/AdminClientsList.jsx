import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Table, Button, Alert, Spinner } from 'react-bootstrap';
import { confirm } from 'react-bootstrap-confirmation';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useDispatch } from 'react-redux';
import { resetPasswordClient, resendEmailConfirmationClient } from '../../store/reducers/ActionCreators';

const AdminClientsList = ({ clients, onRemove }) => {
  const dispatch = useDispatch();

  const onResetPassword = async (client) => {
    const result = await confirm(`Do you want to reset password for "${client.email}" client ?`, {
      title: 'Confirm',
      okText: 'Yes',
      okButtonStyle: 'danger',
    });

    if (result) dispatch(resetPasswordClient(client.id));
  };

  const onResendEmailConfirmation = async (client) => {
    const result = await confirm(`Do you want to resend email confirmation for "${client.email}" client ?`, {
      title: 'Confirm',
      okText: 'Yes',
      okButtonStyle: 'danger',
    });

    if (result) dispatch(resendEmailConfirmationClient(client.id));
  };

  if (clients.length === 0) {
    return (
      <Container>
        <Row className="justify-content-md-center mt-3">
          <Col md="auto">
            <Alert variant="warning">No records yet</Alert>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
      <Table striped bordered responsive size="sm" className="mt-3">
        <thead>
          <tr>
            <th className="text-center p-2 m-0">id</th>
            <th className="text-center p-2 m-0">email</th>
            <th className="text-center p-2 m-0">name</th>
            <th colSpan="3" className="text-center p-2 m-0"></th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="m-0">
              <td className="text-center p-3 m-0 col-2">{client.id}</td>
              <td className="p-3 m-0">
                <Stack direction="row" alignItems="center" gap={1}>
                  {client.isEmailVerified ? <CheckIcon fontSize="small" /> : <QuestionMarkIcon fontSize="small" />}
                  <Typography variant="body1">{client.email}</Typography>
                </Stack>
              </td>
              <td className="p-3 m-0">{client.name}</td>
              <td className="text-center p-2 m-0 col-2">
                <Stack spacing={1}>
                  <Button
                    size="sm"
                    variant="outline-warning"
                    disabled={client.isPendingResetPassword}
                    onClick={() => onResetPassword(client)}
                  >
                    {client.isPendingResetPassword ? (
                      <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                    ) : null}
                    Reset password
                  </Button>
                  {!client.isEmailVerified ? (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => onResendEmailConfirmation(client)}
                      disabled={client.isPendingResendEmailConfirmation}
                    >
                      {client.isPendingResendEmailConfirmation ? (
                        <Spinner className="me-2" as="span" animation="grow" size="sm" role="status" aria-hidden="true" />
                      ) : null}
                      Resend email confirmation
                    </Button>
                  ) : null}
                </Stack>
              </td>
              <td className="text-center p-2 m-0">
                <Link to={'/admin/clients/' + client.id}>
                  <EditIcon />
                </Link>
              </td>
              <td className="text-center p-2 m-0">
                <Link to="#">
                  <DeleteForeverIcon onClick={() => onRemove(client.id)} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminClientsList;
