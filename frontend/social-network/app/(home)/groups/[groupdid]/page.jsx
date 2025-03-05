import ProfileGrp from '../../../../components/Groups/ProfileGrp'
import CreateEvent from '../../../../components/Groups/CreateEvent'
import DisplayEvents from '../../../../components/Groups/DisplayEvents'

export default function Profile() {
  return (
    <>
      <div>
        <CreateEvent />
        <DisplayEvents />
      </div>
      <div className="rightSidebar">
        <ProfileGrp />
      </div>
    </>
  )
}
