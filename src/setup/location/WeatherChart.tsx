import React, {lazy, useMemo} from 'react';

const LineChart = lazy(() => import('@/lib/chart'));

import {de} from 'date-fns/locale';
import {format, parseISO} from 'date-fns';
import {type BoxAnnotationOptions} from 'chartjs-plugin-annotation';

import {Stats} from '@/lib/statistics';
import {type DayOfYear, type DayWindow} from '@/lib/weatherData';

const WeatherChart: React.FC<{
  temperatureStats: Record<DayOfYear, Stats> | undefined;
}> = ({temperatureStats}) => {
  const chartData = useMemo(() => {
    if (!temperatureStats) return {labels: [], datasets: []};
    const allDays = Object.keys(temperatureStats).sort() as DayOfYear[];
    const dayTimestamps = Object.fromEntries(
      allDays.map(d => [d, parseISO('2020-' + d).getTime()])
    );

    return {
      datasets: [
        {
          label: 'Mean Temperature',
          data: allDays.map(day => ({
            x: dayTimestamps[day],
            y: temperatureStats[day].mean,
          })),
          pointRadius: 0,
          borderColor: 'red',
          order: 10,
          yAxisID: 'temperature',
        },
        {
          label: 'Maximum Temperature (p95)',
          fill: '+1',
          data: allDays.map(day => ({
            x: dayTimestamps[day],
            y: temperatureStats[day].p95,
          })),
          pointRadius: 0,
          borderWidth: 0,
          order: 1,
          yAxisID: 'temperature',
        },
        {
          label: 'Minimum Temperature (p5)',
          data: allDays.map(day => ({
            x: dayTimestamps[day],
            y: temperatureStats[day].p5,
          })),
          pointRadius: 0,
          borderWidth: 0,
          order: 1,
          yAxisID: 'temperature',
        },
        /*
        {
          label: 'Frost Probability',
          data: allDays.map(day => ({
            x: dayTimestamps[day],
            y:
              rawWeatherData[day].tempMin.filter(t => t <= 0).length /
              rawWeatherData[day].tempMin.length,
          })),
          pointRadius: 0,
          order: 9,
          borderColor: '#0000AA',
          yAxisID: 'probability',
        },
        */
        {
          label: 'Number of years with data',
          data: allDays.map(day => ({
            x: dayTimestamps[day],
            y: temperatureStats[day].valueCount / 24,
          })),
          pointRadius: 0,
          borderWidth: 0,
          yAxisID: 'y',
        },
      ],
    };
  }, [temperatureStats]);

  const annotations = useMemo(() => {
    if (!temperatureStats) return [];
    const freeColor = 'rgba(100, 256, 100, 0.1)';
    const lowRiskColor = 'rgba(100, 100, 200, 0.2)';
    const highRiskColor = 'rgba(0, 0, 200, 0.2)';

    const frostFreeWindows: DayWindow[] = [];
    const frostLowWindows: DayWindow[] = [];
    const frostHighWindows: DayWindow[] = [];

    const allWindows = frostFreeWindows
      .map(w => ({...w, color: freeColor, label: '🌱'}))
      .concat(
        frostLowWindows.map(w => ({...w, color: lowRiskColor, label: '❄'}))
      )
      .concat(
        frostHighWindows.map(w => ({...w, color: highRiskColor, label: '❄❄'}))
      );

    return Object.fromEntries(
      allWindows.map(({first, last, color, label}, i) => [
        `box${i}`,
        {
          type: 'box',
          xMin: parseISO('2020-' + first).getTime(),
          xMax: parseISO('2020-' + last).getTime(),
          backgroundColor: color,
          borderWidth: 0,
          drawTime: 'beforeDatasetsDraw',
          label: {
            content: label,
            display: true,
            position: 'start',
          },
        } as BoxAnnotationOptions,
      ])
    );
  }, [temperatureStats]);

  return (
    <LineChart
      width={600}
      data={chartData}
      options={{
        animation: false,
        parsing: false,
        interaction: {
          axis: 'x',
          mode: 'index',
          intersect: false,
          includeInvisible: true,
        },
        plugins: {
          title: {
            display: true,
            text: 'Location Weather',
          },
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: items => {
                return format(items[0].parsed.x, 'dd MMMM');
              },
              label: item => {
                let label = item.dataset.label ?? '';

                if (label) {
                  label += ': ';
                }
                if (item.dataset.yAxisID === 'temperature') {
                  label += `${item.parsed.y.toFixed(1)}°C`;
                } else if (item.dataset.yAxisID === 'probability') {
                  label += `${(item.parsed.y * 100).toFixed(0)}%`;
                } else {
                  label += item.parsed.y.toString();
                }

                return label;
              },
            },
          },

          annotation: {
            annotations: annotations,
          },
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'month',
              displayFormats: {
                month: 'MMM',
              },
              parser: 'yyyy-MM-dd',
            },
            ticks: {
              labelOffset: 50,
            },
            adapters: {
              date: {
                locale: de,
              },
            },
          },
          temperature: {
            axis: 'y',
            title: {
              text: 'Temperature',
            },
            ticks: {
              callback: value => `${(+value).toFixed(1)}°C`,
            },
          },
          probability: {
            axis: 'y',
            position: 'right',
            min: 0,
            max: 1,
            grid: {
              display: false,
            },
            title: {
              text: 'Frost Probability',
            },
            ticks: {
              callback: value => (+value * 100).toFixed(0) + '%',
            },
          },
          y: {
            display: false,
          },
        },
      }}
    />
  );
};

export default WeatherChart;
