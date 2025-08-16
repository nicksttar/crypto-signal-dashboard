// src/components/PairSelector.js
import React, { useState } from 'react'; // ИСПРАВЛЕНИЕ ЗДЕСЬ
import { Card, Form, InputGroup, ListGroup } from 'react-bootstrap';
import useStore from '../store/useStore';

// Расширяем список доступных пар для полноценного поиска
const availablePairs = [
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 
    'AVAXUSDT', 'DOTUSDT', 'SHIBUSDT', 'MATICUSDT', 'LTCUSDT', 'TRXUSDT', 'LINKUSDT',
    'BCHUSDT', 'ATOMUSDT', 'ETCUSDT', 'XLMUSDT', 'ALGOUSDT', 'MANAUSDT'
];

function PairSelector() {
  const { selectedPair, setSelectedPair } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const handlePairSelect = (pair) => {
    setSelectedPair(pair);
    setSearchTerm(''); // Очищаем поиск после выбора
  };

  // Фильтруем список по мере ввода
  const filteredPairs = searchTerm
    ? availablePairs.filter(pair => 
        pair.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Поиск торговой пары</Card.Title>
        <InputGroup>
          {/* Иконка лупы */}
          <InputGroup.Text>🔍</InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Например: BTCUSDT"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        
        {/* Выпадающий список с результатами поиска */}
        {filteredPairs.length > 0 && (
          <ListGroup className="mt-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
            {filteredPairs.map(pair => (
              <ListGroup.Item 
                key={pair} 
                action 
                onClick={() => handlePairSelect(pair)}
                active={pair === selectedPair}
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
