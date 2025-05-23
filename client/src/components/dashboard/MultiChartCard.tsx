import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

type ChartType = 'line' | 'area' | 'bar';

interface DataSeries {
  key: string;
  name: string;
  color: string;
}

interface MultiChartCardProps {
  title: string;
  data: any[];
  series: DataSeries[];
  xAxisKey: string;
  type?: ChartType;
  description?: string;
  height?: number;
}

const MultiChartCard = ({ 
  title, 
  data, 
  series,
  xAxisKey, 
  type = 'line', 
  description,
  height = 300,
}: MultiChartCardProps) => {
  
  // Render the chart based on the chart type
  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey={xAxisKey} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 8px' }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            {series.map((s, index) => (
              <Area 
                key={s.key}
                type="monotone" 
                dataKey={s.key} 
                name={s.name}
                stroke={s.color} 
                fill={s.color} 
                fillOpacity={0.2}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey={xAxisKey} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 8px' }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            {series.map((s, index) => (
              <Bar 
                key={s.key}
                dataKey={s.key} 
                name={s.name}
                fill={s.color} 
                radius={[4, 4, 0, 0]} 
                stackId={type === 'stacked-bar' ? 'a' : undefined}
              />
            ))}
          </BarChart>
        );
      case 'line':
      default:
        return (
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey={xAxisKey} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 8px' }} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            {series.map((s, index) => (
              <Line 
                key={s.key}
                type="monotone" 
                dataKey={s.key} 
                name={s.name}
                stroke={s.color} 
                strokeWidth={2} 
                dot={{ r: 2, fill: s.color }} 
                activeDot={{ r: 4 }}
              />
            ))}
          </LineChart>
        );
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-neutral-200">
      <div className="mb-4">
        <h3 className="text-md font-semibold text-neutral-700">{title}</h3>
        {description && <p className="text-xs text-neutral-500 mt-1">{description}</p>}
      </div>
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MultiChartCard;
