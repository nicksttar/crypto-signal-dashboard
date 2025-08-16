// src/components/PairSelector.js
import React from 'react';
import { Card, Form } from 'react-bootstrap';
import useStore from '../store/useStore'; // Импортируем наше хранилище

// Список доступных пар
const availablePairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'];

function PairSelector() {
  // Получаем текущую выбранную пару и функцию для её изменения из хранилища
  const { selectedPair, setSelectedPair } = useStore();

  const handlePairChange = (event) => {
    setSelectedPair(event.target.value);
  };

  return (
    <Card className="mb-4">
      <Card.Body>
        <Card.Title>Выбор торговой пары</Card.Title>
        <Form.Select value={selectedPair} onChange={handlePairChange}>
          {availablePairs.map(pair => (
            <option key={pair} value={pair}>
              {pair}
            </option>
          ))}
        </Form.Select>
      </Card.Body>
    </Card>
  );
}

export default PairSelector;