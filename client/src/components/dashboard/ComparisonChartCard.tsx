import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface ComparisonChartCardProps {
  title: string;
  description?: string;
  data: any[];
  actualKey: string;
  targetKey: string;
  xAxisKey: string;
  actualName?: string;
  targetName?: string;
  height?: number;
  showDifference?: boolean;
  positiveColor?: string;
  negativeColor?: string;
}

const ComparisonChartCard = ({
  title,
  description,
  data,
  actualKey,
  targetKey,
  xAxisKey,
  actualName = 'Réel',
  targetName = 'Budget',
  height = 300,
  showDifference = true,
  positiveColor = '#10b981',
  negativeColor = '#ef4444'
}: ComparisonChartCardProps) => {
  
  // Enhance data with difference calculations if needed
  const enhancedData = showDifference 
    ? data.map(item => ({
        ...item,
        difference: item[actualKey] - item[targetKey],
        differenceColor: item[actualKey] - item[targetKey] > 0 ? negativeColor : positiveColor
      }))
    : data;

  // Calculate total variance
  const totalTarget = data.reduce((sum, item) => sum + Number(item[targetKey] || 0), 0);
  const totalActual = data.reduce((sum, item) => sum + Number(item[actualKey] || 0), 0);
  const totalDifference = totalActual - totalTarget;
  const differencePercentage = totalTarget !== 0 ? ((totalDifference / totalTarget) * 100).toFixed(1) : 0;
  
  // Format for the tooltip
  const formatTooltip = (value: number) => {
    return `${value.toLocaleString()} TND`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-neutral-200">
      <div className="flex justify-between mb-4">
        <div>
          <h3 className="text-md font-semibold text-neutral-700">{title}</h3>
          {description && <p className="text-xs text-neutral-500 mt-1">{description}</p>}
        </div>
        
        {showDifference && (
          <div className="text-right">
            <div className={`text-sm font-medium ${totalDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {totalDifference > 0 ? '+' : ''}{totalDifference.toLocaleString()} TND ({differencePercentage}%)
            </div>
            <div className="text-xs text-neutral-500">
              Variance totale
            </div>
          </div>
        )}
      </div>
      
      <div style={{ height: `${height}px` }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={enhancedData}
            margin={{ top: 5, right: 10, bottom: 20, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis 
              dataKey={xAxisKey} 
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatTooltip}
            />
            <Tooltip 
              formatter={(value: number) => [formatTooltip(value)]}
              contentStyle={{ fontSize: '11px', padding: '8px' }} 
            />
            <Legend wrapperStyle={{ fontSize: 12, marginTop: 10 }} />
            <ReferenceLine y={0} stroke="#000" />
            <Bar dataKey={targetKey} name={targetName} fill="#8884d8" radius={[4, 4, 0, 0]} />
            <Bar dataKey={actualKey} name={actualName} fill="#82ca9d" radius={[4, 4, 0, 0]} />
            {showDifference && (
              <Bar 
                dataKey="difference" 
                name="Variance" 
                radius={[4, 4, 0, 0]}
                fill="#888888" 
                fillOpacity={0.6}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ComparisonChartCard;
