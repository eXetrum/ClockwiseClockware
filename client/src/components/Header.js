import React, { useEffect, useState } from 'react';
import { Nav, Navbar, NavDropdown, Container } from 'react-bootstrap';
import AuthService from "../services/auth.service";

const Header = () => {
    const [user, setUser] = useState(null);

    useEffect( () => {
        const user = AuthService.getCurrentUser();
        setUser(user);
    }, []);

    const isLoggedIn = user != null;
    return (
    <Navbar bg="light" variant="light" className="mb-3">
        <Container>
        <Navbar.Brand href="/">Clockwise Clockware</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-auto">
        
        {isLoggedIn ? (
        <Nav>
            <Nav.Link href="/admin/cities">Cities</Nav.Link>
            <Nav.Link href="/admin/clients">Clients</Nav.Link>
            <Nav.Link href="/admin/masters">Masters</Nav.Link>
            <Nav.Link href="/admin/booking">Booking</Nav.Link>
        </Nav>
        ):("")}
        </Navbar.Collapse>

        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
            </Navbar.Text>
            {isLoggedIn ? (
            <>
                <Nav.Link href="/order" className="me-3">Order</Nav.Link>
                <NavDropdown title={user.email} id="basic-nav-dropdown">
                    
                    <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="/logout">
                        Logout
                    </NavDropdown.Item>
                </NavDropdown>
            </>
            ) : (<>
                    <Nav.Link href="/order" className="me-3">Order</Nav.Link>
                    <Nav.Link href="/login">Login</Nav.Link>
                </>)
            }
        </Navbar.Collapse>
        </Container>
    </Navbar>
    );
};

export default Header;