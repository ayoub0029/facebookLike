"use client"

import  GroupRequests  from "@/components/Groups/GroupRequests"
import  JoinedGrp  from "@/components/Groups/JoinedGrp"
import CreateGroup from "@/components/Groups/CreateGroup";
import MyGroups from "@/components/Groups/MyGroups";
import { useState, useCallback } from 'react'
export default function Groups() {
  const [reloadKey, setReloadKey] = useState(0);

  const handleReload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);
  return (
    <>
      <div>
        <CreateGroup onSuccess={handleReload}/>
        <JoinedGrp/>
        <MyGroups key={reloadKey}/>
      </div>
      <div className="rightSidebar">
        {/* <GroupRequests /> */}
      </div>
    </>
  );
}
/* import { useState, useEffect, useCallback } from 'react'

  const handleReload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);
onSuccess={handleReload} */