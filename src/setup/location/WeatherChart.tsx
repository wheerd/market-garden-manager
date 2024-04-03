import React, {lazy, useMemo} from 'react';

const LineChart = lazy(() => import('@/lib/chart'));

import {enUS} from 'date-fns/locale';
import {format, parseISO} from 'date-fns';
import {type BoxAnnotationOptions} from 'chartjs-plugin-annotation';

import {Stats} from '@/lib/statistics';
import {type DayOfYear, getFrostWindows} from '@/lib/weatherData';

const WeatherChart: React.FC<{
  temperatureStats: Record<DayOfYear, Stats> | undefined;
  frostProbabilities: Record<DayOfYear, number> | undefined;
}> = ({temperatureStats, frostProbabilities}) => {
  const chartData = useMemo(() => {
    if (!temperatureStats || !frostProbabilities)
      return {labels: [], datasets: []};
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
        {
          label: 'Frost Probability',
          data: allDays.map(day => ({
            x: dayTimestamps[day],
            y: frostProbabilities[day],
          })),
          pointRadius: 0,
          order: 9,
          borderColor: '#0000AA',
          yAxisID: 'probability',
        },
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
  }, [temperatureStats, frostProbabilities]);

  const annotations = useMemo(() => {
    if (!frostProbabilities) return [];
    const freeColor = 'rgba(100, 256, 100, 0.1)';
    const lowRiskColor = 'rgba(100, 100, 200, 0.2)';
    const highRiskColor = 'rgba(0, 0, 200, 0.2)';

    const frostWindows = getFrostWindows(frostProbabilities, 0.05);

    const allWindows = [
      {
        first: '01-01',
        last: frostWindows.firstLowRiskDay,
        color: highRiskColor,
        label: '❄❄',
      },
      {
        first: frostWindows.firstLowRiskDay,
        last: frostWindows.firstFrostFreeDay,
        color: lowRiskColor,
        label: '❄',
      },
      {
        first: frostWindows.firstFrostFreeDay,
        last: frostWindows.lastFrostFreeDay,
        color: freeColor,
        label: '🌱',
      },
      {
        first: frostWindows.lastFrostFreeDay,
        last: frostWindows.lastLowRiskDay,
        color: lowRiskColor,
        label: '❄',
      },
      {
        first: frostWindows.lastLowRiskDay,
        last: '12-31',
        color: highRiskColor,
        label: '❄❄',
      },
    ];

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
  }, [frostProbabilities]);

  return (
    <LineChart
      height={400}
      width={'100%'}
      data={chartData}
      options={{
        maintainAspectRatio: false,
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
              align: 'start',
            },
            adapters: {
              date: {
                locale: enUS,
              },
            },
          },
          temperature: {
            axis: 'y',
            title: {
              text: 'Temperature',
            },
            ticks: {
              callback: value => `${(+value).toFixed(0)}°C`,
            },
          },
          probability: {
            axis: 'y',
            position: 'right',
            min: 0,
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
