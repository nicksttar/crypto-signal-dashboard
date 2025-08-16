// src/hooks/useChart.js
import { useEffect } from 'react';
import { createChart, CandlestickSeries, AreaSeries, LineStyle } from 'lightweight-charts';

function useChart(chartContainerRef, priceData, rsiData, levels, showRsi, showLevels) {
  useEffect(() => {
    if (!chartContainerRef.current || !priceData || priceData.length === 0) {
      return;
    }

    const chart = createChart(chartContainerRef.current, {
      // --- ИЗМЕНЕНИЕ ЗДЕСЬ: Используем высоту контейнера ---
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
      layout: { background: { color: '#ffffff' }, textColor: '#333' },
      grid: { vertLines: { color: '#f0f0f0' }, horzLines: { color: '#f0f0f0' } },
      timeScale: { timeVisible: true, secondsVisible: false },
      priceScale: {
        autoscale: true,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a', downColor: '#ef5350', borderDownColor: '#ef5350',
      borderUpColor: '#26a69a', wickDownColor: '#ef5350', wickUpColor: '#26a69a',
    });
    candleSeries.setData(priceData);

    if (showRsi && rsiData && rsiData.length > 0) {
      const rsiSeries = chart.addSeries(AreaSeries, {
          pane: 1,
          lineColor: 'rgba(76, 175, 80, 1)',
          topColor: 'rgba(76, 175, 80, 0.2)',
          bottomColor: 'rgba(76, 175, 80, 0)',
          lineWidth: 2,
          lastValueVisible: false,
          axisLabelVisible: false,
          priceScale: {
            autoscale: true,
          }
      });
      rsiSeries.setData(rsiData);

      rsiSeries.createPriceLine({
        price: 70, color: '#ef5350', lineWidth: 1, lineStyle: LineStyle.Dashed,
        axisLabelVisible: true, title: '70',
      });
      rsiSeries.createPriceLine({
        price: 30, color: '#26a69a', lineWidth: 1, lineStyle: LineStyle.Dashed,
        axisLabelVisible: true, title: '30',
      });
    }
    
    if (showLevels && levels && levels.length > 0) {
        levels.forEach(level => {
            candleSeries.createPriceLine({
                price: level.price,
                color: level.type === 'support' ? '#26a69a' : '#ef5350',
                lineWidth: 2, lineStyle: LineStyle.Dashed, axisLabelVisible: true,
                title: level.type.toUpperCase(),
            });
        });
    }

    chart.timeScale().fitContent(); 

    const handleResize = () => {
        chart.resize(chartContainerRef.current.clientWidth, chartContainerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [priceData, rsiData, levels, chartContainerRef, showRsi, showLevels]);
}

export default useChart;
