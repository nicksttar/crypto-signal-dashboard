// src/components/Header.js
import React from 'react';
import { Navbar, Container } from 'react-bootstrap';

function Header() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand href="#home">
          Crypto-Signal AI Dashboard 🤖
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default Header;