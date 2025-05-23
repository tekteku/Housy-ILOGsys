interface ProjectCardProps {
  imageUrl: string;
  title: string;
  description: string;
  progress: number; // 0-100
  status: string;
  date: string;
}

const ProjectCard = ({ imageUrl, title, description, progress, status, date }: ProjectCardProps) => {
  const getProgressBarColor = (prog: number) => {
    if (prog < 30) return 'bg-red-500';
    if (prog < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-neutral-200 hover:shadow-lg transition-shadow duration-200">
      <img src={imageUrl} alt={title} className="w-full h-32 object-cover" />
      <div className="p-4">
        <h3 className="font-semibold text-md mb-1 truncate text-neutral-800">{title}</h3>
        <p className="text-xs text-neutral-500 mb-3 truncate">{description}</p>
        
        <div className="mb-2">
          <div className="flex justify-between text-xs text-neutral-600 mb-1">
            <span>Progression</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${getProgressBarColor(progress)}`}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-neutral-500 pt-2 border-t border-neutral-100">
          <span>{status}</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
