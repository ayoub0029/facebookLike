import  GroupRequests  from "@/components/Groups/GroupRequests"
import  MyGroups  from "@/components/Groups/MyGroups"
import CreateGroup from "@/components/Groups/CreateGroup";
import GrpIjoined from "@/components/Groups/GrpIjoined";
export default function Groups() {
  return (
    <>
      <div>
        <CreateGroup />
        <MyGroups />
        <GrpIjoined />
        <GroupRequests />
      </div>
    </>
  );
}
