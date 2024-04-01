import React, { useMemo } from "react"

import { Chart } from "chart.js/auto";
import { Line } from "react-chartjs-2";
import 'chartjs-adapter-date-fns';
import { de } from 'date-fns/locale';
import { format, parseISO } from "date-fns";
import annotationPlugin, { BoxAnnotationOptions } from 'chartjs-plugin-annotation';

import { quantile } from "../lib/statistics";
import { getMinTemperatureProbabilityThresholds, type DayOfYear, type GroupedRawWeatherData } from "../lib/weatherData";

Chart.register(annotationPlugin)

const WeatherChart: React.FC<{ rawWeatherData: GroupedRawWeatherData | undefined }> = ({ rawWeatherData }) => {
    const chartData = useMemo(() => {
        if (!rawWeatherData) return { labels: [], datasets: [] }
        const allDays = Object.keys(rawWeatherData).sort() as DayOfYear[]
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
                    label: "Frost Probability",
                    data: allDays.map(day => ({
                        x: dayTimestamps[day],
                        y: rawWeatherData[day].tempMin.filter(t => t <= 0).length / rawWeatherData[day].tempMin.length
                    })),
                    pointRadius: 0,
                    order: 9,
                    borderColor: "#0000AA",
                    yAxisID: "probability"
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

    const annotations = useMemo(() => {
        if (!rawWeatherData) return []
        const freeColor = 'rgba(100, 256, 100, 0.1)';
        const lowRiskColor = 'rgba(100, 100, 200, 0.2)'
        const highRiskColor = 'rgba(0, 0, 200, 0.2)'

        const frostFreeWindows = getMinTemperatureProbabilityThresholds(rawWeatherData, 0, 1, 2, 10);
        const frostLowWindows = getMinTemperatureProbabilityThresholds(rawWeatherData, 0, 0.95, 2, 5);
        const frostHighWindows = getMinTemperatureProbabilityThresholds(rawWeatherData, 0, 0, 0.95, 0);

        const allWindows = frostFreeWindows.map(w => ({ ...w, color: freeColor, label: "🌱" }))
            .concat(frostLowWindows.map(w => ({ ...w, color: lowRiskColor, label: "❄" })))
            .concat(frostHighWindows.map(w => ({ ...w, color: highRiskColor, label: "❄❄" })))

        return Object.fromEntries(allWindows.map(
            ({ first, last, color, label }, i) => (['box' + i, {
                type: 'box',
                xMin: parseISO('2020-' + first).getTime(),
                xMax: parseISO('2020-' + last).getTime(),
                backgroundColor: color,
                borderWidth: 0,
                drawTime: "beforeDatasetsDraw",
                label: {
                    content: label,
                    display: true,
                    position: "start"
                }
            } as BoxAnnotationOptions])));
    }, [rawWeatherData])

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
                                } else if (item.dataset.yAxisID === "probability") {
                                    label += (item.parsed.y * 100).toFixed(0) + '%'
                                } else {
                                    label += item.parsed.y
                                }

                                return label
                            }
                        }
                    },

                    annotation: {
                        annotations: annotations
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
                    probability: {
                        axis: "y",
                        position: "right",
                        min: 0,
                        max: 1,
                        grid: {
                            display: false
                        },
                        title: {
                            text: "Frost Probability"
                        },
                        ticks: {
                            callback: (value) => (+value * 100).toFixed(0) + '%'
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