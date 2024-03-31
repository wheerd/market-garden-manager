import { fetchWeatherApi } from 'openmeteo';

export interface WeatherDataRaw {
    tempMin: number[],
    tempMax: number[],
    tempMean: number[],
    rainSum: number[],
}

export type GroupedRawWeatherData = Record<string, WeatherDataRaw>

export async function fetchWeatherData(latitude: number, longitude: number, elevation: number, timeZone: string): Promise<GroupedRawWeatherData> {
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
    const daily = responses[0].daily()!;

    const temperature2mMax = daily.variables(0)!.valuesArray()!
    const temperature2mMin = daily.variables(1)!.valuesArray()!
    const temperature2mMean = daily.variables(2)!.valuesArray()!
    const rainSum = daily.variables(3)!.valuesArray()!

    const groupedData: GroupedRawWeatherData = {}

    const start = Number(daily.time()) * 1000;
    const end = Number(daily.timeEnd()) * 1000;
    const interval = daily.interval() * 1000

    const dateFormatOptions = { timeZone: timeZone, month: "2-digit", day: "2-digit" } as Intl.DateTimeFormatOptions

    let i = 0;
    for (let day = start; day < end; day += interval) {
        const date = new Date(day);
        const dayId = date.toLocaleDateString("en-us", dateFormatOptions).split("/").slice(0, 2).join('-')

        if (!groupedData[dayId]) groupedData[dayId] = { tempMin: [], tempMean: [], tempMax: [], rainSum: [] }
        groupedData[dayId].tempMin.push(temperature2mMin[i])
        groupedData[dayId].tempMean.push(temperature2mMean[i])
        groupedData[dayId].tempMax.push(temperature2mMax[i])
        groupedData[dayId].rainSum.push(rainSum[i])

        i++;
    }

    return groupedData;
}