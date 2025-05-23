import React from 'react';

interface Milestone {
  id: string;
  name: string;
  date: string;
  completed: boolean;
}

interface Phase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  progress: number;
  milestones?: Milestone[];
}

interface ProjectTimelineProps {
  phases: Phase[];
  currentDate?: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ 
  phases, 
  currentDate = new Date().toISOString().split('T')[0]
}) => {
  // Calculate timeline positioning
  const startDate = new Date(phases.reduce(
    (min, phase) => min < phase.startDate ? min : phase.startDate,
    phases[0].startDate
  ));
  
  const endDate = new Date(phases.reduce(
    (max, phase) => max > phase.endDate ? max : phase.endDate,
    phases[0].endDate
  ));
  
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Function to calculate position percentage based on date
  const getPositionPercentage = (date: string) => {
    const targetDate = new Date(date);
    const daysDiff = Math.ceil((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return (daysDiff / totalDays) * 100;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-md font-semibold text-neutral-800">Chronologie du projet</h3>
        
        {/* Mobile view toggle button (you can implement functionality later) */}
        <button className="text-xs text-primary-600 md:hidden">
          <i className="fas fa-expand mr-1"></i>
          Vue détaillée
        </button>
      </div>
      
      {/* Desktop Timeline View */}
      <div className="hidden md:block relative mb-8" style={{ height: phases.length * 60 + 40 }}>
        {currentDate && (
          <div 
            className="absolute h-full border-l-2 border-red-500 z-10"
            style={{ 
              left: `${getPositionPercentage(currentDate)}%`
            }}
          >
            <div className="absolute -left-[10px] -top-6 w-20 text-center">
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded">Aujourd'hui</div>
            </div>
          </div>
        )}
        
        {/* Render phases */}
        {phases.map((phase, index) => (
          <div 
            key={phase.id} 
            className="relative my-8"
            style={{ height: '60px' }}
          >
            {/* Phase label */}
            <div className="absolute -top-5 left-0 z-10 text-sm font-medium text-neutral-700">
              {phase.name}
            </div>
            
            {/* Phase bar */}
            <div 
              className="absolute h-4 bg-neutral-200 rounded"
              style={{
                left: `${getPositionPercentage(phase.startDate)}%`,
                width: `${getPositionPercentage(phase.endDate) - getPositionPercentage(phase.startDate)}%`,
                top: '20px'
              }}
            >
              {/* Progress indicator */}
              <div 
                className="h-full bg-blue-500 rounded"
                style={{ width: `${phase.progress}%` }}
              ></div>
            </div>
            
            {/* Start date */}
            <div 
              className="absolute -bottom-6 text-xs text-neutral-500"
              style={{ left: `${getPositionPercentage(phase.startDate)}%` }}
            >
              {formatDate(phase.startDate)}
            </div>
            
            {/* End date */}
            <div 
              className="absolute -bottom-6 text-xs text-neutral-500"
              style={{ left: `${getPositionPercentage(phase.endDate)}%` }}
            >
              {formatDate(phase.endDate)}
            </div>
            
            {/* Milestones */}
            {phase.milestones && phase.milestones.map((milestone) => (
              <div 
                key={milestone.id}
                className="absolute z-20"
                style={{ 
                  left: `${getPositionPercentage(milestone.date)}%`,
                  top: '16px'
                }}
              >
                <div 
                  className={`h-8 w-8 rounded-full flex items-center justify-center -ml-4 
                    ${milestone.completed ? 'bg-green-500' : 'bg-amber-400'} text-white`}
                >
                  <i className={`fas ${milestone.completed ? 'fa-check' : 'fa-flag'} text-xs`}></i>
                </div>
                <div className="absolute w-32 -ml-16 text-center mt-1 text-xs font-medium">
                  {milestone.name}
                </div>
              </div>
            ))}
          </div>
        ))}      </div>
      
      {/* Mobile Timeline View */}
      <div className="md:hidden space-y-4">
        {phases.map((phase, index) => (
          <div key={phase.id} className="border-l-2 border-neutral-200 pl-4 ml-2 pb-4 relative">
            {/* Phase dot */}
            <div 
              className={`absolute -left-[5px] top-0 h-3 w-3 rounded-full ${
                phase.progress === 100 ? 'bg-green-500' : 
                phase.progress > 0 ? 'bg-blue-500' : 'bg-neutral-300'
              }`}
            ></div>
            
            {/* Phase content */}
            <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-neutral-700">{phase.name}</h4>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  {phase.progress}%
                </span>
              </div>
              
              <div className="text-xs text-neutral-600 mb-2">
                {formatDate(phase.startDate)} - {formatDate(phase.endDate)}
              </div>
              
              {/* Progress bar */}
              <div className="h-1.5 bg-neutral-200 rounded-full w-full mb-3">
                <div 
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${phase.progress}%` }}
                ></div>
              </div>
              
              {/* Milestones */}
              {phase.milestones && phase.milestones.length > 0 && (
                <div className="space-y-2 mt-2 pt-2 border-t border-neutral-200">
                  {phase.milestones.map(milestone => (
                    <div key={milestone.id} className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center 
                        ${milestone.completed ? 'bg-green-500' : 'bg-amber-400'} text-white flex-shrink-0`}>
                        <i className={`fas ${milestone.completed ? 'fa-check' : 'fa-flag'} text-[8px]`}></i>
                      </div>
                      <span className="text-xs">{milestone.name}</span>
                      <span className="text-xs text-neutral-500 ml-auto">{formatDate(milestone.date).split(' ').slice(0, 2).join(' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectTimeline;
