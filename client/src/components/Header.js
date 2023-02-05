import React, { useEffect, useState } from 'react';
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
        <Navbar.Brand href="/">Clockwise Clockware</Navbar.Brand>
        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-auto">
        
        {user ? (
        <Nav>
            <Nav.Link href="/admin/cities">Cities</Nav.Link>
            <Nav.Link href="/admin/masters">Masters</Nav.Link>
            <Nav.Link href="/admin/clients">Clients</Nav.Link>            
            <Nav.Link href="/admin/orders">Orders</Nav.Link>
        </Nav>
        ):("")}
        </Navbar.Collapse>

        <Navbar.Toggle />
        <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
            </Navbar.Text>
            {user ? (
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