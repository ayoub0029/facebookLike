import { CreatePost } from "@/components/Posts/CreatePost"

export default function Home() {
  return (
    <>
      <aside className="feed">
        <CreatePost />
      </aside>

      <div className="rightSidebar">
      </div>
    </>
  )
}
