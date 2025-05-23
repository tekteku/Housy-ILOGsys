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

interface ChartCardProps {
  title: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  type?: ChartType;
  color?: string;
  description?: string;
  height?: number;
  showLegend?: boolean;
}

const ChartCard = ({ 
  title, 
  data, 
  dataKey, 
  xAxisKey, 
  type = 'line', 
  color = '#3b82f6', 
  description,
  height = 200,
  showLegend = false
}: ChartCardProps) => {
  
  // Render the appropriate chart type
  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey={xAxisKey} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 8px' }} />
            {showLegend && <Legend wrapperStyle={{ fontSize: '10px' }} />}
            <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.2} />
          </AreaChart>
        );
      case 'bar':
        return (
          <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey={xAxisKey} fontSize={10} tickLine={false} axisLine={false} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: '10px', padding: '2px 8px' }} />
            {showLegend && <Legend wrapperStyle={{ fontSize: '10px' }} />}
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
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
            {showLegend && <Legend wrapperStyle={{ fontSize: '10px' }} />}
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              strokeWidth={2} 
              dot={{ r: 2, fill: color }} 
              activeDot={{ r: 4 }}
            />
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

export default ChartCard;
