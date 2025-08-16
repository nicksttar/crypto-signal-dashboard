// src/components/TradingChart.js
import React, { useEffect, useState, useRef } from 'react';
import { Card, Spinner, Button, ButtonGroup } from 'react-bootstrap';
import { SMA } from 'technicalindicators'; // Убрали лишние импорты
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
  const { selectedPair, priceData, maData, levels, setChartData } = useStore();
  const [loading, setLoading] = useState(true);
  const chartContainerRef = useRef(null);
  
  const [showMa, setShowMa] = useState(false);
  const [showLevels, setShowLevels] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Убираем сброс macdData и bbData
      setChartData({ priceData: null, maData: null, levels: null });
      const klines = await getKlines(selectedPair, '4h', 500);
      
      let formattedMa = null;
      let formattedLevels = null;

      if (klines && klines.length > 1) {
        const closePrices = klines.map(k => k.close);

        const smaInput = { values: closePrices, period: 50 };
        const smaResult = SMA.calculate(smaInput);
        formattedMa = smaResult.map((value, index) => ({
            time: klines[index + smaInput.period - 1]?.time,
            value: value
        })).filter(item => item && item.time);

        formattedLevels = calculateSupportResistance(klines);
      }
      
      // Убираем передачу macdData и bbData
      setChartData({
        priceData: klines,
        maData: formattedMa,
        levels: formattedLevels,
      });
      
      setLoading(false);
    };

    fetchData();
  }, [selectedPair, setChartData]);

  useChart(chartContainerRef, priceData, maData, levels, showMa, showLevels);

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
            variant={showMa ? "secondary" : "primary"} 
            size="sm"
            onClick={() => setShowMa(!showMa)}
          >
            {showMa ? 'Скрыть SMA(50)' : 'Показать SMA(50)'}
          </Button>
        </ButtonGroup>
      </Card.Header>
      <Card.Body style={{ height: '500px', position: 'relative' }}>
        {loading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <Spinner animation="border" /><span className="ms-2">Загрузка данных...</span>
          </div>
        ) : (
          <div 
            key={`${showMa}-${showLevels}`}
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
