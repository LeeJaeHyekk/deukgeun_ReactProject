// import { PostGrid } from './components/PostGrid'

// export default function CommunityPage() {
//   return (
//     <div className="min-h-screen bg-neutral-950 text-white p-6">
//       <h1 className="text-3xl font-bold mb-6">Community</h1>
//       <PostGrid />
//     </div>
//   )
// }

import { ProjectGrid } from "./components/PostGrid";
import styles from "./CommunityPage.module.css";

const mockProjects = [
  {
    id: 1,
    title: "High-Tech Campus Renovation",
    category: "Innovation",
    imageUrl: "/img/heroSection_IMG.jpg",
  },
  {
    id: 2,
    title: "Green Urban Living Tower",
    category: "Architecture",
    imageUrl: "/img/heroSection_IMG.jpg",
  },
  {
    id: 3,
    title: "Medical Research Center",
    category: "Healthcare",
    imageUrl: "/img/heroSection_IMG.jpg",
  },
  {
    id: 4,
    title: "AI Robotics Lab",
    category: "Technology",
    imageUrl: "/img/heroSection_IMG.jpg",
  },
  {
    id: 5,
    title: "National Innovation Museum",
    category: "Culture",
    imageUrl: "/img/heroSection_IMG.jpg",
  },
  {
    id: 6,
    title: "Smart Grid Control Center",
    category: "Energy",
    imageUrl: "/img/heroSection_IMG.jpg",
  },
];

export default function CommunityPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Community</h1>
      <ProjectGrid projects={mockProjects} />
    </div>
  );
}
