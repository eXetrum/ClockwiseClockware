import React from 'react';
import { Link } from 'react-router-dom';
import { Nav, Navbar, NavDropdown, Container } from 'react-bootstrap';
import { useAuth } from '../../hooks';
import { parseToken } from '../../utils';

const Header = () => {
  const { accessToken } = useAuth();
  const user = parseToken(accessToken);

  return (
    <Navbar bg="light" variant="light" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand as={Link} to="/">
          Clockwise Clockware
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav">
          {user && (
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
          )}

          <Nav className="navbar-nav ms-auto">
            <Nav.Link as={Link} to="/order">
              Order
            </Nav.Link>
            {user ? (
              <NavDropdown title={user.email} id="basic-nav-dropdown">
                <NavDropdown.Item as={Link} to="/profile">
                  Profile
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item as={Link} to="/logout">
                  Logout
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to="/login">
                Login
              </Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
