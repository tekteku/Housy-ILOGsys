interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: string; // e.g., 'fa-briefcase'
  iconBgColor?: string; // e.g., 'bg-blue-100'
  iconColor?: string; // e.g., 'text-blue-600'
}

const StatCard = ({ title, value, description, icon, iconBgColor = 'bg-neutral-100', iconColor = 'text-neutral-600' }: StatCardProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow border border-neutral-200 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-full ${iconBgColor} flex items-center justify-center ${iconColor} flex-shrink-0 mt-1`}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div>
        <p className="text-sm text-neutral-500 mb-1">{title}</p>
        <p className="text-2xl font-semibold text-neutral-800 mb-1">{value}</p>
        <p className="text-xs text-neutral-500">{description}</p>
      </div>
    </div>
  );
};

export default StatCard;
