import { useEffect } from "react";
import TimelineSection from "@/components/projects/TimelineSection";
import ProjectCard from "@/components/projects/ProjectCard";
import StatCard from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";

// Sample project data
const projectsData = [
  {
    id: "project-1",
    title: "Résidence Les Oliviers",
    description: "Complexe résidentiel haut de gamme à Tunis",
    imageUrl: "/static/images/projects/project1.jpg",
    progress: 75,
    status: "En cours",
    date: "Fin: Oct 2025",
  },
  {
    id: "project-2",
    title: "Tour Méditerranée",
    description: "Tour de bureaux au centre-ville",
    imageUrl: "/static/images/projects/project2.jpg",
    progress: 45,
    status: "En cours",
    date: "Fin: Jan 2026",
  },
  {
    id: "project-3",
    title: "Clinique El Manar",
    description: "Centre médical moderne à Sousse",
    imageUrl: "/static/images/projects/project3.jpg",
    progress: 90,
    status: "En finalisation",
    date: "Fin: Juin 2025",
  },
  {
    id: "project-4",
    title: "Hôtel Marina Bay",
    description: "Complexe touristique à Hammamet",
    imageUrl: "/static/images/projects/project4.jpg",
    progress: 30,
    status: "Début de construction",
    date: "Fin: Mars 2026",
  },
];

const ProjectDetails = () => {
  // Set document title
  useEffect(() => {
    document.title = "Détails du Projet | Housy";
  }, []);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">
            Détails du Projet
          </h1>
          <p className="text-neutral-500 mt-1">
            Résidence Les Oliviers - Suivi et gestion
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center">
            <i className="fas fa-file-export mr-2"></i>
            Exporter
          </Button>
          <Button className="flex items-center">
            <i className="fas fa-edit mr-2"></i>
            Modifier
          </Button>
        </div>
      </div>      {/* Project stats - grid on larger screens, horizontal scroll on mobile */}
      <div className="relative -mx-4 md:mx-0">
        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 px-4 md:px-0 overflow-x-auto pb-2 md:overflow-visible md:pb-0">
          <div className="min-w-[260px] md:min-w-0 md:w-auto">
            <StatCard 
              title="Budget total" 
              value="3,8M TND" 
              description="2,9M TND dépensés (76%)" 
              icon="fa-money-bill-wave" 
              iconBgColor="bg-green-100" 
              iconColor="text-green-600"
            />
          </div>
          
          <div className="min-w-[260px] md:min-w-0 md:w-auto">
            <StatCard 
              title="Progression" 
              value="75%" 
              description="Avance de 5% sur le planning" 
              icon="fa-chart-line" 
              iconBgColor="bg-blue-100" 
              iconColor="text-blue-600"
            />
          </div>
          
          <div className="min-w-[260px] md:min-w-0 md:w-auto">
            <StatCard 
              title="Personnel" 
              value="48" 
              description="6 équipes sur le chantier" 
              icon="fa-hard-hat" 
              iconBgColor="bg-amber-100" 
              iconColor="text-amber-600"
            />
          </div>
          
          <div className="min-w-[260px] md:min-w-0 md:w-auto">
            <StatCard 
              title="Livraison estimée" 
              value="Oct 2025" 
              description="Dans les délais prévus" 
              icon="fa-calendar-check" 
              iconBgColor="bg-purple-100" 
              iconColor="text-purple-600"
            />
          </div>
        </div>
        
        {/* Fade effect to indicate more content is scrollable on mobile */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none md:hidden"></div>
      </div>

      {/* Project Timeline Section */}
      <TimelineSection />      {/* Related Projects */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-neutral-800">Autres Projets</h2>
          <button className="text-sm text-primary-600 hover:text-primary-700 md:hidden">
            Voir tout <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
        
        {/* Scrollable container on mobile, grid on larger screens */}
        <div className="md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 -mx-4 md:mx-0 px-4 md:px-0">
          <div className="flex md:block overflow-x-auto pb-4 md:pb-0 space-x-4 md:space-x-0">
            {projectsData.map((project) => (
              <div key={project.id} className="min-w-[250px] w-[250px] md:w-auto md:min-w-0">
                <ProjectCard 
                  title={project.title}
                  description={project.description}
                  imageUrl={project.imageUrl}
                  progress={project.progress}
                  status={project.status}
                  date={project.date}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
