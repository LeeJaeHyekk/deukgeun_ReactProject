// import styles from "./PostCard.module.css";

// export interface Project {
//   id: number;
//   title: string;
//   category: string;
//   imageUrl: string;
// }

// interface ProjectCardProps {
//   project: Project;
// }

// export const ProjectCard = ({ project }: ProjectCardProps) => {
//   return (
//     <a href={`/projects/${project.id}`} className={styles.projectCard}>
//       <article className={styles.card}>
//         {/* <img src={project.imageUrl} alt={project.title} className="image" /> */}
//         <figure className={styles.cardImage}>
//           <img
//             src={project.imageUrl}
//             alt={project.title}
//             className={styles.image}
//           />
//         </figure>
//         <footer className="card-footer">
//           <p className={styles.category}>{project.category}</p>
//           <h4 className={styles.title}>{project.title}</h4>
//         </footer>
//       </article>
//     </a>
//   );
// };
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
