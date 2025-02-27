import ProfileGrp from '../../../components/Groups/ProfileGrp'
export default function Profile() {
  return (
    <>
      <div className="rightSidebar">
        <ProfileGrp />
        <CreateEvent />
        <Events />
      </div>
    </>
  )
}
