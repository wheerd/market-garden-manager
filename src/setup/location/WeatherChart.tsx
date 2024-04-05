import React, {lazy, useMemo} from 'react';

const LineChart = lazy(() => import('@/lib/chart'));

import {parseISO} from 'date-fns';
import {type BoxAnnotationOptions} from 'chartjs-plugin-annotation';

import {Stats} from '@/lib/statistics';
import {type DayOfYear, getFrostWindows} from '@/lib/weatherData';
import {useTranslation} from 'react-i18next';
import {SupportedLanguage, localeMap} from '@/i18n';

const WeatherChart: React.FC<{
  temperatureStats: Record<DayOfYear, Stats> | undefined;
  frostProbabilities: Record<DayOfYear, number> | undefined;
}> = ({temperatureStats, frostProbabilities}) => {
  const {t, i18n} = useTranslation();
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
          label: t('weather_mean_temperature'),
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
          label: t('weather_max_temperature_p95'),
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
          label: t('weather_min_temperature_p5'),
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
          label: t('weather_frost_probability'),
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
          label: t('weather_years_count'),
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
  }, [temperatureStats, frostProbabilities, t]);

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
        label: t('weather_high_frost_area_label', {defaultValue: '❄❄'}),
      },
      {
        first: frostWindows.firstLowRiskDay,
        last: frostWindows.firstFrostFreeDay,
        color: lowRiskColor,
        label: t('weather_low_frost_area_label', {defaultValue: '❄'}),
      },
      {
        first: frostWindows.firstFrostFreeDay,
        last: frostWindows.lastFrostFreeDay,
        color: freeColor,
        label: t('weather_frost_free_area_label', {defaultValue: '🌱'}),
      },
      {
        first: frostWindows.lastFrostFreeDay,
        last: frostWindows.lastLowRiskDay,
        color: lowRiskColor,
        label: t('weather_low_frost_area_label', {defaultValue: '❄'}),
      },
      {
        first: frostWindows.lastLowRiskDay,
        last: '12-31',
        color: highRiskColor,
        label: t('weather_high_frost_area_label', {defaultValue: '❄❄'}),
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
  }, [frostProbabilities, t]);

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
            text: t('weather_title'),
          },
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              title: items => {
                return t(
                  'weather_tooltip_title',
                  '{{day, datefns(format: dd MMMM)}}',
                  {day: items[0].parsed.x}
                );
              },
              label: item => {
                const formattedValue =
                  item.dataset.yAxisID === 'temperature'
                    ? t(
                        'weather_temperature_value_celsius',
                        '{{value, number(maximumFractionDigits:0)}}°C',
                        {
                          value: item.parsed.y,
                        }
                      )
                    : item.dataset.yAxisID === 'probability'
                      ? t(
                          'weather_frost_probability_value',
                          '{{value, number(style:percent)}}',
                          {
                            value: item.parsed.y,
                          }
                        )
                      : item.parsed.y.toString();

                return t(
                  'weather_tooltip_dataset_label',
                  '{{label}}: {{value}}',
                  {label: item.dataset.label, value: formattedValue}
                );
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
                month: t('weather_month_axis_format', 'MMM'),
              },
            },
            ticks: {
              align: 'start',
            },
            adapters: {
              date: {
                locale: localeMap[i18n.language as SupportedLanguage],
              },
            },
          },
          temperature: {
            axis: 'y',
            title: {
              display: true,
              text: t('weather_temperature_axis'),
            },
            ticks: {
              callback: value =>
                t(
                  'weather_temperature_value_celsius',
                  '{{value, number(maximumFractionDigits:0)}}°C',
                  {
                    value,
                  }
                ),
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
              display: true,
              text: t('weather_frost_probability_axis'),
            },
            ticks: {
              callback: value =>
                t(
                  'weather_frost_probability_value',
                  '{{value, number(style:percent)}}',
                  {
                    value,
                  }
                ),
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
