// src/hooks/useChart.js
import { useEffect } from 'react';
import { createChart, CandlestickSeries, LineStyle, LineSeries } from 'lightweight-charts';

function useChart(chartContainerRef, priceData, maData, levels, showMa, showLevels) {
  useEffect(() => {
    if (!chartContainerRef.current || !priceData || priceData.length === 0) {
      return;
    }

    const chart = createChart(chartContainerRef.current, {
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

    if (showMa && maData && maData.length > 0) {
      const maSeries = chart.addSeries(LineSeries, {
        color: 'rgba(41, 98, 255, 1)',
        lineWidth: 2,
      });
      maSeries.setData(maData);
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

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      chart.resize(width, height);
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [priceData, maData, levels, chartContainerRef, showMa, showLevels]);
}

export default useChart;
