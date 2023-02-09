import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Nav, Navbar, NavDropdown, Container } from 'react-bootstrap';
import { getCurrentUser } from "../api/auth";

const Header = () => {
    const [user, setUser] = useState(null);

    useEffect( () => {
        const user = getCurrentUser();
        setUser(user);
    }, []);

    return (
    <Navbar bg="light" variant="light" className="mb-3">
        <Container>
            <Navbar.Brand as={Link} to="/">Clockwise Clockware</Navbar.Brand>
            <Navbar.Toggle />
                <Navbar.Collapse className="justify-content-auto">        
                    {user && (   
                    <Nav>
                        <Nav.Link as={Link} to="/admin/cities">Cities</Nav.Link>
                        <Nav.Link as={Link} to="/admin/masters">Masters</Nav.Link>
                        <Nav.Link as={Link} to="/admin/clients">Clients</Nav.Link>
                        <Nav.Link as={Link} to="/admin/orders"> Orders</Nav.Link>
                    </Nav>)}
                </Navbar.Collapse>
            <Navbar.Toggle />

            <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                </Navbar.Text>
                {user ? (
                    <Nav>
                        <Nav.Link as={Link} to="/order" className="me-3">Order</Nav.Link>
                        <NavDropdown title={user.email} id="basic-nav-dropdown">                            
                            <NavDropdown.Item as={Link} to="/profile">Profile</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item as={Link} to="/logout">
                                Logout
                            </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                ) : (<Nav>
                        <Nav.Link as={Link} to="/order" className="me-3">Order</Nav.Link>
                        <Nav.Link as={Link} to="/login">Login</Nav.Link>
                    </Nav>)
                }
            </Navbar.Collapse>
        </Container>
    </Navbar>
    );
};

export default Header;