import ProjectTimeline from "./ProjectTimeline";

// Sample project phases and milestones data
const projectPhasesData = [
  {
    id: "phase-1",
    name: "Conception et planification",
    startDate: "2025-01-15",
    endDate: "2025-03-10",
    progress: 100,
    milestones: [
      {
        id: "ms-1",
        name: "Plans approuvés",
        date: "2025-02-10",
        completed: true
      },
      {
        id: "ms-2",
        name: "Budget finalisé",
        date: "2025-03-05",
        completed: true
      }
    ]
  },
  {
    id: "phase-2",
    name: "Fondations",
    startDate: "2025-03-15",
    endDate: "2025-04-30",
    progress: 100,
    milestones: [
      {
        id: "ms-3",
        name: "Excavation terminée",
        date: "2025-03-25",
        completed: true
      },
      {
        id: "ms-4",
        name: "Coulage béton",
        date: "2025-04-20",
        completed: true
      }
    ]
  },
  {
    id: "phase-3",
    name: "Construction principale",
    startDate: "2025-05-05",
    endDate: "2025-08-15",
    progress: 65,
    milestones: [
      {
        id: "ms-5",
        name: "Structure complète",
        date: "2025-06-30",
        completed: true
      },
      {
        id: "ms-6",
        name: "Toiture terminée",
        date: "2025-07-25",
        completed: false
      }
    ]
  },
  {
    id: "phase-4",
    name: "Finitions intérieures",
    startDate: "2025-07-01",
    endDate: "2025-09-30",
    progress: 30,
    milestones: [
      {
        id: "ms-7",
        name: "Électricité & plomberie",
        date: "2025-07-20",
        completed: true
      },
      {
        id: "ms-8",
        name: "Peinture terminée",
        date: "2025-09-15",
        completed: false
      }
    ]
  },
  {
    id: "phase-5",
    name: "Aménagements extérieurs",
    startDate: "2025-09-01",
    endDate: "2025-10-15",
    progress: 10,
    milestones: [
      {
        id: "ms-9",
        name: "Jardin aménagé",
        date: "2025-09-30",
        completed: false
      }
    ]
  }
];

const TimelineSection = () => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-neutral-800 mb-4">Chronologie Détaillée</h2>
      <ProjectTimeline 
        phases={projectPhasesData} 
        currentDate="2025-05-23" // Today's date for the demo
      />
    </div>
  );
};

export default TimelineSection;
