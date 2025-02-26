import { CreatePost } from "@/components/Posts/CreatePost"
import { FetchPosts } from "@/components/Posts/FetchPosts"

export default function Home() {
  return (
    <>
      <aside className="feed">
        <CreatePost />
        <FetchPosts endpoint="posts?last_id=0" edit={true} />
      </aside>

      <div className="rightSidebar">
      </div>
    </>
  )
}