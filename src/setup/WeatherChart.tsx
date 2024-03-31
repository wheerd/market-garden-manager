import React, { useMemo } from "react"

import { CategoryScale } from "chart.js";
import { Chart } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import 'chartjs-adapter-date-fns';
import { de } from 'date-fns/locale';
import { format, parseISO } from "date-fns";

import { quantile } from "../lib/statistics";
import type { GroupedRawWeatherData } from "../lib/weatherData";

Chart.register(CategoryScale);

const WeatherChart: React.FC<{rawWeatherData: GroupedRawWeatherData | undefined}> = ({rawWeatherData}) => {
    const chartData = useMemo(() => {
        if (!rawWeatherData) return { labels: [], datasets: [] }
        const allDays = Object.keys(rawWeatherData).sort()
        const dayTimestamps = Object.fromEntries(allDays.map(d => [d, parseISO('2020-' + d).getTime()]));
        return ({
            datasets: [
                {
                    label: "Mean Temperature",
                    data: allDays.map(day => ({
                        x: dayTimestamps[day],
                        y: rawWeatherData[day].tempMean.reduce((a, b) => a + b, 0) / rawWeatherData[day].tempMean.length
                    })),
                    pointRadius: 0,
                    borderColor: 'red',
                    order: 10,
                    yAxisID: "temperature"
                },
                /*
                {
                    label: "Maximum Temperature",
                    fill: "+1",
                    data: allDays.map(day => ({
                        x: "2000-" + day,
                        y: Math.max(...rawWeatherData[day].tempMax)
                    })),
                    pointRadius: 0,
                    borderWidth: 0,
                    order: 0
                },
                {
                    label: "Minimum Temperature",
                    data: allDays.map(day => ({
                        x: "2000-" + day,
                        y: Math.min(...rawWeatherData[day].tempMin)
                    })),
                    pointRadius: 0,
                    borderWidth: 0,
                    order: 0
                },
                */
                {
                    label: "Maximum Temperature (p95)",
                    fill: "+1",
                    data: allDays.map(day => ({
                        x: dayTimestamps[day],
                        y: quantile(rawWeatherData[day].tempMax, 0.95)
                    })),
                    pointRadius: 0,
                    borderWidth: 0,
                    order: 1,
                    yAxisID: "temperature"
                },
                {
                    label: "Minimum Temperature (p5)",
                    data: allDays.map(day => ({
                        x: dayTimestamps[day],
                        y: quantile(rawWeatherData[day].tempMin, 0.05)
                    })),
                    pointRadius: 0,
                    borderWidth: 0,
                    order: 1,
                    yAxisID: "temperature"
                },
                {
                    label: "Number of years with data",
                    data: allDays.map(day => ({
                        x: dayTimestamps[day],
                        y: rawWeatherData[day].tempMin.length
                    })),
                    pointRadius: 0,
                    borderWidth: 0,
                    yAxisID: "y"
                }
            ]
        })
    }, [rawWeatherData]);

    return (
        <Line
            width={600}
            data={chartData}
            options={{
                animation: false,
                parsing: false,
                interaction: {
                    axis: "x",
                    mode: "index",
                    intersect: false,
                    includeInvisible: true
                },
                plugins: {
                    title: {
                        display: true,
                        text: "Location Weather"
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: (items) => { return format(items[0].parsed.x, "dd MMMM") },
                            label: (item) => {
                                let label = item.dataset.label ?? '';

                                if (label) {
                                    label += ': ';
                                }
                                if (item.dataset.yAxisID === "temperature") {
                                    label += item.parsed.y.toFixed(1) + "°C"
                                } else {
                                    label += item.parsed.y
                                }

                                return label
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        "type": "time",
                        "time": {
                            "unit": "month",
                            displayFormats: {
                                month: 'MMM'
                            },
                            parser: "yyyy-MM-dd"
                        },
                        ticks: {
                            labelOffset: 50,
                        },
                        adapters: {
                            date: {
                                locale: de
                            }
                        }
                    },
                    temperature: {
                        axis: "y",
                        title: {
                            text: "Temperature"
                        },
                        ticks: {
                            callback: (value) => value + '°C'
                        }
                    },
                    y: {
                        display: false
                    }
                }
            }}
        />
    )
}

export default WeatherChart