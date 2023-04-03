import React from 'react';
import { Link } from 'react-router-dom';
import { Nav, Navbar, NavDropdown, Container } from 'react-bootstrap';

import { useSelector } from 'react-redux';
import { selectAuthenticatedUser } from '../../store/selectors/authSelector';

import { ACCESS_SCOPE, USER_ROLES } from '../../constants';

const Header = () => {
  const auth = useSelector(selectAuthenticatedUser);
  return (
    <Navbar bg="light" variant="light" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Clockwise Clockware
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          {auth.user.role === USER_ROLES.ADMIN ? (
            <Nav className="navbar-nav me-auto">
              <Nav.Link as={Link} to="/admin/cities">
                Cities
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/masters">
                Masters
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/clients">
                Clients
              </Nav.Link>
              <Nav.Link as={Link} to="/admin/orders">
                Orders
              </Nav.Link>
            </Nav>
          ) : null}
          {auth.user.role === USER_ROLES.MASTER ? (
            <Nav className="navbar-nav me-auto">
              <Nav.Link as={Link} to="/master/orders">
                Orders
              </Nav.Link>
            </Nav>
          ) : null}
          {auth.user.role === USER_ROLES.CLIENT ? (
            <Nav className="navbar-nav me-auto">
              <Nav.Link as={Link} to="/client/orders">
                Orders
              </Nav.Link>
            </Nav>
          ) : null}

          <Nav className="navbar-nav ms-auto">
            {ACCESS_SCOPE.GuestOrClient.includes(auth.user.role) ? (
              <Nav.Link as={Link} to="/order">
                Order
              </Nav.Link>
            ) : null}
            {auth.user.role !== USER_ROLES.GUEST ? (
              <NavDropdown title={auth.user.email} id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/profile">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/logout">
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">
                  Login
                </Nav.Link>
                <Nav.Link as={Link} to="/register">
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
