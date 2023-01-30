import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import AuthService from "../services/auth.service";

class Header extends Component {

    constructor() {
        super();
        this.state = {
            user: AuthService.getCurrentUser(),
        };
    }

    render() {
        const user = this.state.user;
        const isLoggedIn = user != null;
        
        return (
        <Navbar bg="light" variant="light" className="mb-3">
            <Container>
            <Navbar.Brand href="/">Clockwise Clockware</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
                <Navbar.Text>
                </Navbar.Text>
                {isLoggedIn ? (
                <NavDropdown title={user.email} id="basic-nav-dropdown">
                    <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="/logout">
                        Logout
                    </NavDropdown.Item>
                </NavDropdown>
                ) : (<Nav.Link href="/login">Login</Nav.Link>)
                }
            </Navbar.Collapse>
            </Container>
        </Navbar>
        );
    }
}

export default Header;