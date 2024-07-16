import React from "react";
import { Container, Navbar, Nav, Button } from "react-bootstrap";

const Layout = ({ children, onLogout }) => {
  return (
    <div>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand href="#">Social Budget</Navbar.Brand>
          <Nav className="ml-auto">
            <Button variant="outline-light" onClick={onLogout}>
              Logout
            </Button>
          </Nav>
        </Container>
      </Navbar>
      <Container className="mt-4">
        <main>{children}</main>
      </Container>
    </div>
  );
};

export default Layout;
