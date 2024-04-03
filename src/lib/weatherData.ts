import {Stats, getStats} from './statistics';

type Opaque<K, T> = T & {__TYPE__: K};
export type DayOfYear = Opaque<'DayOfYear', string>;

export interface WeatherRequestParams<T extends [_: WeatherHourlyFields]> {
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  hourly: T;
  timezone?: string;
  elevation?: number;
}

type WeatherHourlyFields =
  | 'temperature_2m'
  | 'rain'
  | 'soil_temperature_0_to_7cm';

type FullResults = {
  [field in WeatherHourlyFields]: number[];
};

type WeatherApiResults<T extends WeatherHourlyFields> = Pick<FullResults, T> & {
  times: number[];
};

const range = (start: number, stop: number, step: number) =>
  Array.from({length: (stop - start) / step}, (_, i) => start + i * step);

export async function fetchWeatherData<T extends WeatherHourlyFields>(
  params: WeatherRequestParams<[_: T]>
): Promise<WeatherApiResults<T>> {
  const {fetchWeatherApi} = await import('openmeteo');
  const url = 'https://archive-api.open-meteo.com/v1/archive';
  const responses = await fetchWeatherApi(url, params);

  const hourly = responses[0].hourly();

  if (hourly) {
    const start = Number(hourly.time()) * 1000;
    const end = Number(hourly.timeEnd()) * 1000;
    const interval = hourly.interval() * 1000;

    const series = Object.fromEntries(
      params.hourly.map((p, i) => [
        p,
        Array.from(hourly.variables(i)?.valuesArray() ?? []),
      ])
    ) as Pick<FullResults, T>;

    return {
      times: range(start, end, interval),
      ...series,
    };
  }
  const series = Object.fromEntries(
    params.hourly.map(p => [p, [] as number[]])
  ) as Pick<FullResults, T>;

  return {
    times: [],
    ...series,
  };
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

/*
export function getMinTemperatureProbabilities(
  weatherData: GroupedRawWeatherData,
  minTemperature: number
): Record<DayOfYear, number> {
  return Object.fromEntries(
    Object.entries(weatherData).map(([day, data]) => {
      const matchingCount = data.tempMin.filter(
        t => t >= minTemperature
      ).length;
      const probability = matchingCount / data.tempMin.length;
      return [day as DayOfYear, probability];
    })
  );
}

export function getMinTemperatureProbabilityThresholds(
  weatherData: GroupedRawWeatherData,
  minTemperature: number,
  minProbability: number,
  maxProbability: number,
  minSize: number
) {
  const probabilities = getMinTemperatureProbabilities(
    weatherData,
    minTemperature
  );
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
*/
