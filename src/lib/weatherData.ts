import {format} from 'date-fns';
import {Stats, getStats} from './statistics';

type Opaque<K, T> = T & {__TYPE__: K};
export type DayOfYear = Opaque<'DayOfYear', string>;

function sortedObject<T extends object>(o: T): T {
  const sorted = {} as T;
  return (Object.keys(o) as (keyof T)[]).sort().reduce<T>((r, k) => {
    r[k] = o[k];
    return r;
  }, sorted);
}

export interface WeatherRequestParams {
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  hourly: string;
  timezone: string;
  elevation: number;
}

export async function fetchWeatherData(
  params: WeatherRequestParams
): Promise<Record<DayOfYear, number[]>> {
  const {fetchWeatherApi} = await import('openmeteo');
  const url = 'https://archive-api.open-meteo.com/v1/archive';
  const responses = await fetchWeatherApi(url, params);

  const groupedData: Partial<Record<DayOfYear, number[]>> = {};

  const hourly = responses[0].hourly();

  if (hourly) {
    const values = hourly.variables(0)?.valuesArray() ?? [];

    const start = Number(hourly.time()) * 1000;
    const end = Number(hourly.timeEnd()) * 1000;
    const interval = hourly.interval() * 1000;

    let i = 0;
    for (let day = start; day < end; day += interval) {
      const date = new Date(day);
      const dayId = format(date, 'MM-dd') as DayOfYear;

      const data = (groupedData[dayId] = groupedData[dayId] ?? []);
      data.push(values[i]);

      i++;
    }
  }

  return sortedObject(groupedData) as Record<DayOfYear, number[]>;
}

export function splitIntoDayAndNight(
  data: number[],
  cutoffHour: number
): {
  day: number[];
  night: number[];
} {
  const day: number[] = [];
  const night: number[] = [];

  for (let i = 0; i < data.length; i++) {
    const hourOfDay = i % 24;
    if (hourOfDay < cutoffHour || hourOfDay >= 12 + cutoffHour) {
      night.push(data[i]);
    } else {
      day.push(data[i]);
    }
  }

  return {day, night};
}

export function getGroupedStats(
  groupedData: Record<DayOfYear, number[]>
): Record<DayOfYear, Stats> {
  return Object.fromEntries(
    Object.entries(groupedData).map(([k, v]) => [k, getStats(v)])
  );
}

export function splitGroupedIntoDayAndNight(
  groupedData: Record<DayOfYear, number[]>,
  cutoffHour: number
): {
  day: Record<DayOfYear, number[]>;
  night: Record<DayOfYear, number[]>;
} {
  const days: Record<DayOfYear, number[]> = {};
  const nights: Record<DayOfYear, number[]> = {};

  for (const [date, values] of Object.entries(groupedData)) {
    const {day, night} = splitIntoDayAndNight(values, cutoffHour);
    days[date as DayOfYear] = day;
    nights[date as DayOfYear] = night;
  }

  return {day: days, night: nights};
}

export interface DayWindow {
  first: DayOfYear;
  last: DayOfYear;
}

export function getMinTemperatureProbabilities(
  weatherData: Record<DayOfYear, number[]>,
  maxTemperatureThreshold: number
): Record<DayOfYear, number> {
  return Object.fromEntries(
    Object.entries(weatherData).map(([day, data]) => {
      const dayCount = data.length / 24;
      let matchingCount = 0;
      for (let i = 0; i < dayCount; i++) {
        const minDayTemperature = Math.min(...data.slice(i * 24, i * 24 + 24));
        if (minDayTemperature <= maxTemperatureThreshold) matchingCount++;
      }
      const probability = matchingCount / dayCount;
      return [day as DayOfYear, probability];
    })
  );
}

export function getProbabilityThresholdWindows(
  probabilities: Record<DayOfYear, number>,
  minProbability: number,
  maxProbability: number,
  minSize: number
) {
  const windows: DayWindow[] = [];
  let start: string | undefined = undefined;
  let size = 0;
  let previousDay = '' as DayOfYear;
  Object.entries(probabilities).forEach(([day, p]) => {
    if (p >= minProbability && p < maxProbability) {
      if (typeof start === 'undefined') {
        start = day;
      }
      size++;
    } else {
      if (typeof start !== 'undefined') {
        if (size >= minSize) {
          windows.push({first: start as DayOfYear, last: previousDay});
        }
        start = undefined;
        size = 0;
      }
    }
    previousDay = day as DayOfYear;
  });
  if (typeof start !== 'undefined') {
    if (size >= minSize) {
      windows.push({first: start as DayOfYear, last: previousDay});
    }
  }

  return windows;
}
