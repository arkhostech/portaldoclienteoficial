
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{payload[0].payload.name}</p>
        <p>Quantidade: {payload[0].value}</p>
        <p>Percentual: {`${((payload[0].value / payload[0].payload.total) * 100).toFixed(0)}%`}</p>
      </div>
    );
  }
  return null;
};
