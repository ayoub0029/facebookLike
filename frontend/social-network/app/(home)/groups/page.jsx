"use client"

import GroupRequests from "@/components/Groups/GroupRequests"
import JoinedGrp from "@/components/Groups/JoinedGrp"
import CreateGroup from "@/components/Groups/CreateGroup";
import MyGroups from "@/components/Groups/MyGroups";
import { useState, useCallback } from 'react'
import { SearchInput } from "@/components/Search/SearchInput";

export default function Groups() {
  const [reloadKey, setReloadKey] = useState(0);
  const [hamberMenu, setHamberMenu] = useState(false);

  const handleReload = useCallback(() => {
    setReloadKey((key) => key + 1);
  }, []);
  const toggleMenu = () => {
    if (hamberMenu) {
      setHamberMenu(false);
    } else {
      setHamberMenu(true);
    }
  };
  return (
    <>
      <div>
          <SearchInput FetchGroups={true} />
        <div>
          <button onClick={toggleMenu} className="rightMenuToggle">
            <i className="fas fa-bars"></i>
          </button>
          <CreateGroup onSuccess={handleReload} />
          <JoinedGrp />
          <MyGroups key={reloadKey} />
        </div>
        {hamberMenu === true && <div className={"rightSidebar" + (hamberMenu ? " show" : "")}>
          <GroupRequests />
        </div>}
      </div>
      <div className="rightSidebar">
        <GroupRequests />
      </div>
    </>
  );
}
