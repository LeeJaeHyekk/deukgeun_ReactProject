// import { useState } from "react";
// import { ProjectCard, Project } from "./PostCard";
// import { PostModal } from "./PostModal"; // PostModal을 Project 기반으로 활용
// import styles from "./PostGrid.module.css";

// const mockProjects: Project[] = [
//   {
//     id: 1,
//     title: "High-Tech Campus Renovation",
//     category: "Innovation",
//     imageUrl: "/img/heroSection_IMG.jpg",
//   },
//   {
//     id: 2,
//     title: "Green Urban Living Tower",
//     category: "Architecture",
//     imageUrl: "/img/heroSection_IMG.jpg",
//   },
//   {
//     id: 3,
//     title: "Medical Research Center",
//     category: "Healthcare",
//     imageUrl: "/img/heroSection_IMG.jpg",
//   },
//   {
//     id: 4,
//     title: "AI Robotics Lab",
//     category: "Technology",
//     imageUrl: "/img/heroSection_IMG.jpg",
//   },
//   {
//     id: 5,
//     title: "National Innovation Museum",
//     category: "Culture",
//     imageUrl: "/img/heroSection_IMG.jpg",
//   },
//   {
//     id: 6,
//     title: "Smart Grid Control Center",
//     category: "Energy",
//     imageUrl: "/img/heroSection_IMG.jpg",
//   },
// ];

// export const ProjectGrid = () => {
//   const [selectedProject, setSelectedProject] = useState<Project | null>(null);

//   const handleCardClick = (project: Project) => {
//     setSelectedProject(project);
//   };

//   const handleCloseModal = () => {
//     setSelectedProject(null);
//   };

//   return (
//     <>
//       <div
//         className={styles.grid}
//         style={{
//           display: "grid",
//           gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
//           gap: "24px",
//           padding: "40px",
//           justifyItems: "center",
//           backgroundColor: "red",
//           minHeight: "100vh",
//         }}
//       >
//         {mockProjects.map((project) => (
//           <div key={project.id} onClick={() => handleCardClick(project)}>
//             <ProjectCard project={project} />
//           </div>
//         ))}
//       </div>

//       {selectedProject && (
//         <PostModal
//           post={{
//             id: selectedProject.id,
//             title: selectedProject.title,
//             content: `${selectedProject.category} 프로젝트의 상세 정보입니다.`,
//             author: "관리자",
//             createdAt: "2025-07-25",
//           }}
//           onClose={handleCloseModal}
//         />
//       )}
//     </>
//   );
// };

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

  return (
    <>
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
      </div>

      {selectedProject && (
        <PostModal post={selectedProject} onClose={handleCloseModal} />
      )}
    </>
  );
};
