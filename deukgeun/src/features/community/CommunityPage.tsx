// import { PostGrid } from './components/PostGrid'

// export default function CommunityPage() {
//   return (
//     <div className="min-h-screen bg-neutral-950 text-white p-6">
//       <h1 className="text-3xl font-bold mb-6">Community</h1>
//       <PostGrid />
//     </div>
//   )
// }

import { PostGrid } from './components/PostGrid'
import './CommunityPage.module.css'

export default function CommunityPage() {
  return (
    <div className="container">
      <h1 className="title">Community</h1>
      <PostGrid />
    </div>
  )
}
