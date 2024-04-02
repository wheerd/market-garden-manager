import {
  Chart,
  LineController,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import {Line} from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

Chart.register(
  LineController,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  annotationPlugin
);

export default Line;
