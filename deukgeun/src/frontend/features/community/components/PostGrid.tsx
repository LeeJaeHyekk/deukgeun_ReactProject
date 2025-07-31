// components/ProjectGrid.tsx
import { useState } from "react";
import { ProjectCard, Project } from "./PostCard";
import { PostModal } from "./PostModal";
import styles from "./PostGrid.module.css";

interface ProjectGridProps {
  projects: Project[];
}

export const ProjectGrid = ({ projects }: ProjectGridProps) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleCardClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };
  console.log("projects", projects);

  return (
    <div className={styles.grid}>
      {projects.map((project) => (
        <div
          key={project.id}
          className={styles.cardWrapper}
          onClick={() => handleCardClick(project)}
        >
          <ProjectCard project={project} />
        </div>
      ))}

      {selectedProject && (
        <PostModal post={selectedProject} onClose={handleCloseModal} />
      )}
    </div>
  );
};
