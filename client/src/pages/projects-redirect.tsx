import { useEffect } from "react";
import { useRouter } from "next/router";

const ProjectsRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the enhanced projects page
    router.replace("/projects-enhanced");
  }, [router]);

  return null;
};

export default ProjectsRedirect;
