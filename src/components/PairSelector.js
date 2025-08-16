// src/components/PairSelector.js
import React, { useState } from 'react';
import { Card, Form, InputGroup, ListGroup } from 'react-bootstrap';
import useStore from '../store/useStore';

const availablePairs = [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 
    'AVAXUSDT', 'DOTUSDT', 'SHIBUSDT', 'MATICUSDT', 'LTCUSDT', 'TRXUSDT', 'LINKUSDT',
    'BCHUSDT', 'ATOMUSDT', 'ETCUSDT', 'XLMUSDT', 'ALGOUSDT', 'MANAUSDT'
];

function PairSelector() {
  const { selectedPair, setSelectedPair } = useStore();
  const [searchTerm, setSearchTerm] = useState(selectedPair);
  const [isFocused, setIsFocused] = useState(false);

  const handlePairSelect = (pair) => {
    setSelectedPair(pair);
    setSearchTerm(pair);
    setIsFocused(false);
  };

  const filteredPairs = isFocused && searchTerm !== selectedPair
    ? availablePairs.filter(pair => 
        pair.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <Card>
      <Card.Body>
        <Card.Title>Поиск торговой пары</Card.Title>
        <InputGroup>
          <InputGroup.Text>🔍</InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Например: BTCUSDT"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
                setIsFocused(true);
                if (searchTerm === selectedPair) setSearchTerm('');
            }}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          />
        </InputGroup>
        
        {filteredPairs.length > 0 && (
          <ListGroup className="mt-2" style={{ maxHeight: '150px', overflowY: 'auto', position: 'absolute', zIndex: 1000, width: '95%' }}>
            {filteredPairs.map(pair => (
              <ListGroup.Item 
                key={pair} 
                action 
                onClick={() => handlePairSelect(pair)}
              >
                {pair}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
    </Card>
  );
}

export default PairSelector;
