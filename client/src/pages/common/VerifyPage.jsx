import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { useSnackbar } from 'notistack';
import { Header } from '../../components';
import { PuffLoader } from 'react-spinners';

import { api } from '../../axios/axios.interceptor';
import { getErrorText } from '../../utils';

export const verifyEmail = ({ token }) => api.get(`/verify/${token}`);

const VerifyPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const doVerification = async token => {
    try {
      const response = await verifyEmail({ token });
      enqueueSnackbar(`${response?.data?.message}`, {
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'center',
        },
        variant: 'success',
      });
    } catch (error) {
      enqueueSnackbar(`Error: ${getErrorText(error)}`, {
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'center',
        },
        variant: 'error',
      });
    } finally {
      return navigate('/');
    }
  };

  useEffect(() => {
    doVerification(token);
    // eslint-disable-next-line
  }, [token]);

  return (
    <Container>
      <Header />
      <Container>
        <center>
          <h1>Email confirmation, please wait...</h1>
        </center>
        <hr />
        <Row className="justify-content-md-center">
          <Col md="auto">
            <PuffLoader color="#36d7b7" />
          </Col>
        </Row>
        <hr />
      </Container>
    </Container>
  );
};

export default VerifyPage;
