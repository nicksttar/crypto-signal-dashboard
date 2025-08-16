// src/App.js
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Header from './components/Header';
import PairSelector from './components/PairSelector';
import TradingChart from './components/TradingChart';
import SignalAnalysis from './components/SignalAnalysis';

function App() {
  return (
    <div className="App">
      <Header />
      <Container className="py-4">
        <Row>
          <Col>
            <PairSelector />
          </Col>
        </Row>
        <Row className="mt-4">
          <Col>
            <TradingChart />
          </Col>
        </Row>
        <Row>
          <Col>
            <SignalAnalysis />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
