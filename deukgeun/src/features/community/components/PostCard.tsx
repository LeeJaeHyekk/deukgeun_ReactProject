// components/ProjectCard.tsx
import styles from "./PostCard.module.css";

export interface Project {
  id: number;
  title: string;
  category: string;
  imageUrl: string;
}

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  return (
    <article className={styles.card}>
      <figure className={styles.imageWrapper}>
        <img src={project.imageUrl} alt={project.title} />
      </figure>
      <div className={styles.content}>
        <h3>{project.title}</h3>
        <p>{project.category}</p>
      </div>
    </article>
  );
};
