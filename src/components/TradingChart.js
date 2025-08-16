// src/components/TradingChart.js
import React, { useEffect, useState, useRef } from 'react';
import { Card, Spinner, Button, ButtonGroup } from 'react-bootstrap';
import { RSI } from 'technicalindicators';
import { getKlines } from '../services/binanceApi';
import useChart from '../hooks/useChart';
import useStore from '../store/useStore';

const calculateSupportResistance = (klines) => {
  if (!klines || klines.length < 30) return [];
  const levels = [];
  const period = 10;
  let supportFound = null;
  let resistanceFound = null;
  for (let i = klines.length - period - 1; i >= period; i--) {
    const currentHigh = klines[i].high;
    const currentLow = klines[i].low;
    let isResistance = true;
    let isSupport = true;
    for (let j = i - period; j <= i + period; j++) {
      if (i === j) continue;
      if (klines[j].high > currentHigh) isResistance = false;
      if (klines[j].low < currentLow) isSupport = false;
    }
    if (isResistance && !resistanceFound) {
      resistanceFound = { price: currentHigh, type: 'resistance' };
    }
    if (isSupport && !supportFound) {
      supportFound = { price: currentLow, type: 'support' };
    }
    if (supportFound && resistanceFound) break;
  }
  if (supportFound) levels.push(supportFound);
  if (resistanceFound) levels.push(resistanceFound);
  return levels;
};

function TradingChart() {
  const { selectedPair, priceData, rsiData, levels, setChartData } = useStore();
  const [loading, setLoading] = useState(true);
  const chartContainerRef = useRef(null);
  
  const [showRsi, setShowRsi] = useState(false);
  const [showLevels, setShowLevels] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setChartData({ priceData: null, rsiData: null, levels: null });
      const klines = await getKlines(selectedPair, '4h', 500);
      let formattedRsi = null;
      let formattedLevels = null;
      if (klines && klines.length > 1) {
        const closePrices = klines.map(k => k.close);
        const rsiInput = { values: closePrices, period: 14 };
        const rsiResult = RSI.calculate(rsiInput);
        formattedRsi = rsiResult.map((value, index) => ({
            time: klines[index + rsiInput.period]?.time,
            value: value
        })).filter(item => item && item.time);
        formattedLevels = calculateSupportResistance(klines);
      }
      setChartData({
        priceData: klines,
        rsiData: formattedRsi,
        levels: formattedLevels
      });
      setLoading(false);
    };
    fetchData();
  }, [selectedPair, setChartData]);

  useChart(chartContainerRef, priceData, rsiData, levels, showRsi, showLevels);

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>График {selectedPair}</span>
        <ButtonGroup>
          <Button 
            variant={showLevels ? "secondary" : "primary"} 
            size="sm"
            onClick={() => setShowLevels(!showLevels)}
          >
            {showLevels ? 'Скрыть уровни' : 'Показать уровни'}
          </Button>
          <Button 
            variant={showRsi ? "secondary" : "primary"} 
            size="sm"
            onClick={() => setShowRsi(!showRsi)}
          >
            {showRsi ? 'Скрыть RSI' : 'Показать RSI'}
          </Button>
        </ButtonGroup>
      </Card.Header>
      {/* --- ИЗМЕНЕНИЕ ЗДЕСЬ: Динамическая высота --- */}
      <Card.Body style={{ height: showRsi ? '650px' : '500px', position: 'relative', transition: 'height 0.3s ease-in-out' }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner animation="border" /><span className="ms-2">Загрузка данных...</span>
          </div>
        ) : (
          <div 
            key={`${showRsi}-${showLevels}`}
            ref={chartContainerRef} 
            id="chart-container" 
            style={{ height: '100%', width: '100%' }}
          />
        )}
      </Card.Body>
    </Card>
  );
}

export default TradingChart;
