// src/components/PairSelector.js
import React, { useState, useRef, useLayoutEffect } from 'react';
import { Card, Form, InputGroup, ListGroup } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import useStore from '../store/useStore';

const availablePairs = [
  'BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','XRPUSDT','ADAUSDT','DOGEUSDT',
  'AVAXUSDT','DOTUSDT','SHIBUSDT','MATICUSDT','LTCUSDT','TRXUSDT','LINKUSDT',
  'BCHUSDT','ATOMUSDT','ETCUSDT','XLMUSDT','ALGOUSDT','MANAUSDT'
];

export default function PairSelector() {
  const { selectedPair, setSelectedPair } = useStore();
  const [searchTerm, setSearchTerm] = useState(selectedPair);
  const [isFocused, setIsFocused] = useState(false);

  const inputGroupRef = useRef(null);
  const [dropdownRect, setDropdownRect] = useState(null);

  const updateRect = () => {
    if (!inputGroupRef.current) return;
    const r = inputGroupRef.current.getBoundingClientRect();
    // позиционируем относительно вьюпорта
    setDropdownRect({ top: r.bottom + 4, left: r.left, width: r.width });
  };

  useLayoutEffect(() => {
    updateRect();
    const onResize = () => updateRect();
    const onScroll = () => updateRect();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, []);

  const handlePairSelect = (pair) => {
    setSelectedPair(pair);
    setSearchTerm(pair);
    setIsFocused(false);
  };

  const filteredPairs =
    isFocused && searchTerm !== selectedPair
      ? availablePairs.filter((p) =>
          p.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];

  return (
    <Card>
      <Card.Body>
        <Card.Title>Поиск торговой пары</Card.Title>
        <InputGroup ref={inputGroupRef}>
          <InputGroup.Text>🔍</InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Например: BTCUSDT"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              updateRect();
              if (searchTerm === selectedPair) setSearchTerm('');
            }}
            onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          />
        </InputGroup>
      </Card.Body>

      {isFocused && filteredPairs.length > 0 && dropdownRect &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: dropdownRect.top,
              left: dropdownRect.left,
              width: dropdownRect.width,
              zIndex: 2147483647 // поверх всего, включая канвас графика
            }}
          >
            <ListGroup style={{ maxHeight: 200, overflowY: 'auto' }}>
              {filteredPairs.map((pair) => (
                <ListGroup.Item
                  key={pair}
                  action
                  // не даём инпуту потерять фокус до клика по пункту
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handlePairSelect(pair)}
                >
                  {pair}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>,
          document.body
        )}
    </Card>
  );
}
