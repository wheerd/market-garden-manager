import { format } from 'date-fns';

type Opaque<K, T> = T & { __TYPE__: K }
export type DayOfYear = Opaque<"DayOfYear", string>

export interface WeatherDataRaw {
    tempMin: number[],
    tempMax: number[],
    tempMean: number[],
    rainSum: number[],
}

export type GroupedRawWeatherData = Record<DayOfYear, WeatherDataRaw>;

function sortedObject<T extends object>(o: T): T {
    const sorted = {} as T
    return (Object.keys(o) as (keyof T)[])
        .sort()
        .reduce<T>((r, k) => { r[k] = o[k]; return r }, sorted)
}

export async function fetchWeatherData(latitude: number, longitude: number, elevation?: number, timeZone?: string): Promise<GroupedRawWeatherData> {
    const { fetchWeatherApi } = await import("openmeteo")

    const params = {
        "latitude": latitude,
        "longitude": longitude,
        "start_date": "1950-01-01",
        "end_date": "2023-12-31",
        "daily": ["temperature_2m_max", "temperature_2m_min", "temperature_2m_mean", "rain_sum"],
        "timezone": timeZone,
        "elevation": elevation,
    };
    const url = "https://archive-api.open-meteo.com/v1/archive";
    const responses = await fetchWeatherApi(url, params);

    const groupedData: Partial<GroupedRawWeatherData> = {}

    const daily = responses[0].daily();

    if (daily) {
        const temperature2mMax = daily.variables(0)?.valuesArray() ?? []
        const temperature2mMin = daily.variables(1)?.valuesArray() ?? []
        const temperature2mMean = daily.variables(2)?.valuesArray() ?? []
        const rainSum = daily.variables(3)?.valuesArray() ?? []

        const start = Number(daily.time()) * 1000;
        const end = Number(daily.timeEnd()) * 1000;
        const interval = daily.interval() * 1000;

        let i = 0;
        for (let day = start; day < end; day += interval) {
            const date = new Date(day);
            const dayId = format(date, "MM-dd") as DayOfYear

            const data = groupedData[dayId] = groupedData[dayId] ?? { tempMin: [], tempMean: [], tempMax: [], rainSum: [] }
            data.tempMin.push(temperature2mMin[i])
            data.tempMean.push(temperature2mMean[i])
            data.tempMax.push(temperature2mMax[i])
            data.rainSum.push(rainSum[i])

            i++;
        }
    }

    return sortedObject(groupedData) as GroupedRawWeatherData;
}

export function getMinTemperatureProbabilities(weatherData: GroupedRawWeatherData, minTemperature: number): Record<DayOfYear, number> {
    return Object.fromEntries(Object.entries(weatherData).map(([day, data]) => {
        const matchingCount = data.tempMin.filter(t => t >= minTemperature).length;
        const probability = matchingCount / data.tempMin.length;
        return [day as DayOfYear, probability]
    }))
}

interface DayWindow {
    first: DayOfYear,
    last: DayOfYear,
}

export function getMinTemperatureProbabilityThresholds(
    weatherData: GroupedRawWeatherData, minTemperature: number, minProbability: number, maxProbability: number, minSize: number
) {
    const probabilities = getMinTemperatureProbabilities(weatherData, minTemperature)
    const windows: DayWindow[] = []
    let start: string | undefined = undefined;
    let size = 0;
    let previousDay = "" as DayOfYear;
    Object.entries(probabilities).forEach(([day, p]) => {
        if (p >= minProbability && p < maxProbability) {
            if (typeof start === "undefined") {
                start = day;
            }
            size++;
        } else {
            if (typeof start !== "undefined") {
                if (size >= minSize) {
                    windows.push({ first: start as DayOfYear, last: previousDay })
                }
                start = undefined;
                size = 0;
            }
        }
        previousDay = day as DayOfYear;
    })
    if (typeof start !== "undefined") {
        if (size >= minSize) {
            windows.push({ first: start as DayOfYear, last: previousDay })
        }
    }

    return windows;
}