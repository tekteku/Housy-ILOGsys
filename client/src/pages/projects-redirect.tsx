import { useEffect } from "react";
import { useLocation } from "wouter";

const ProjectsRedirect = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to the enhanced projects page
    setLocation("/projects-enhanced");
  }, [setLocation]);

  return null;
};

export default ProjectsRedirect;
