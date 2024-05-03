import React, {useMemo} from 'react';
import Table from 'react-bootstrap/Table';
import {useTranslation} from 'react-i18next';

import {Stats} from '@/lib/statistics';
import {type DayOfYear} from '@/lib/weatherData';

const temperatures = Array.from(Array(16).keys()).map(x => x - 5);

const TemperatureTable: React.FC<{
  temperatureStats: Record<DayOfYear, Stats> | undefined;
}> = ({temperatureStats}) => {
  const {t, i18n} = useTranslation();

  const allDays = useMemo(
    () =>
      temperatureStats
        ? ([...Object.keys(temperatureStats)].sort() as DayOfYear[])
        : [],
    [temperatureStats]
  );

  const allDaysReverse = useMemo(() => [...allDays].reverse(), [allDays]);

  const table = useMemo(() => {
    if (temperatureStats) {
      return temperatures.map(t => ({
        temperature: t,
        start: allDays.find(d => temperatureStats[d].p5 >= t),
        end: allDaysReverse.find(d => temperatureStats[d].p5 >= t),
      }));
    }
    return [];
  }, [temperatureStats, allDays, allDaysReverse]);

  return (
    <Table striped hover>
      <thead>
        <tr>
          <th>Temperature</th>
          <th>Start</th>
          <th>End</th>
        </tr>
      </thead>
      <tbody>
        {table &&
          table.map(row => (
            <tr key={row.temperature}>
              <td>{row.temperature}</td>
              <td>{row.start}</td>
              <td>{row.end}</td>
            </tr>
          ))}
      </tbody>
    </Table>
  );
};

export default TemperatureTable;
