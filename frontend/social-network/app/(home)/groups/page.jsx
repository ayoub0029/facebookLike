import  GroupRequests  from "@/components/Groups/GroupRequests"
import  JoinedGrp  from "@/components/Groups/JoinedGrp"
import CreateGroup from "@/components/Groups/CreateGroup";
import MyGroups from "@/components/Groups/MyGroups";
export default function Groups() {
  return (
    <>
      <div>
        <CreateGroup />
        <JoinedGrp/>
        <MyGroups />
      </div>
      <div className="rightSidebar">
        {/* <GroupRequests /> */}
      </div>
    </>
  );
}
