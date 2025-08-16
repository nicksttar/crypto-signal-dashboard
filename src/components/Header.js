// src/components/Header.js
import React from 'react';
import { Navbar, Container } from 'react-bootstrap';

function Header() {
  return (
    <Navbar bg="transparent" variant="dark" expand="lg" className="pt-3">
      <Container className='d-flex justify-content-center'>
        {/* Добавляем класс для градиентного текста */}
        <Navbar.Brand href="#home" className="fw-bold gradient-text ">
          Crypto AI Signal Dashboard 🤖
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default Header;
