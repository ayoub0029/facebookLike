import { useCallback, useState, useEffect } from "react";
import { fetchApi } from "@/api/fetchApi";
import "./SearchSeactionStyle.css";
import { debounce } from "@/utiles/Debounce";
import Link from "next/link";

const UsersSearchEndpoint = "search/users";
const GroupsSearchEndpoint = "search/Groups";

const UserIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="green"><path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Zm80-80h480v-32q0-11-5.5-20T700-306q-54-27-109-40.5T480-360q-56 0-111 13.5T260-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T560-640q0-33-23.5-56.5T480-720q-33 0-56.5 23.5T400-640q0 33 23.5 56.5T480-560Zm0-80Zm0 400Z"/></svg>`;
const GroupIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="green"><path d="M0-240v-63q0-43 44-70t116-27q13 0 25 .5t23 2.5q-14 21-21 44t-7 48v65H0Zm240 0v-65q0-32 17.5-58.5T307-410q32-20 76.5-30t96.5-10q53 0 97.5 10t76.5 30q32 20 49 46.5t17 58.5v65H240Zm540 0v-65q0-26-6.5-49T754-397q11-2 22.5-2.5t23.5-.5q72 0 116 26.5t44 70.5v63H780Zm-455-80h311q-10-20-55.5-35T480-370q-55 0-100.5 15T325-320ZM160-440q-33 0-56.5-23.5T80-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T160-440Zm640 0q-33 0-56.5-23.5T720-520q0-34 23.5-57t56.5-23q34 0 57 23t23 57q0 33-23 56.5T800-440Zm-320-40q-50 0-85-35t-35-85q0-51 35-85.5t85-34.5q51 0 85.5 34.5T600-600q0 50-34.5 85T480-480Zm0-80q17 0 28.5-11.5T520-600q0-17-11.5-28.5T480-640q-17 0-28.5 11.5T440-600q0 17 11.5 28.5T480-560Zm1 240Zm-1-280Z"/></svg>`;

async function UsersSearch(target, lastid) {
    if (!lastid) {
        return await fetchApi(`${UsersSearchEndpoint}?target=${target}`, "GET", null, true);
    }
    return await fetchApi(`${UsersSearchEndpoint}?target=${target}&lastId=${lastid}`, "GET", null, true);
}

async function GroupSearch(target, lastid) {
    if (!lastid) {
        return await fetchApi(`${GroupsSearchEndpoint}?target=${target}`, "GET", null, true);
    }
    return await fetchApi(`${GroupsSearchEndpoint}?target=${target}&lastId=${lastid}`, "GET", null, true);
}

async function SearchData(data, FetchUsers = false, FetchGroups = false, lastid = null) {
    const Res = [];

    if (FetchUsers) {
        const users = await UsersSearch(data, lastid);
        if (users) Res.push(...users);
    }
    if (FetchGroups) {
        const groups = await GroupSearch(data, lastid);
        if (groups) Res.push(...groups);
    }

    return Res;
}

export function SearchInput({ FetchUsers = false, FetchGroups = false }) {
    const [searchResults, setSearchResults] = useState([]);
    const [lastId, setLastId] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = useCallback(
        debounce(async (e) => {
            const query = e.target.value;
            if (!query.trim()) return setSearchResults([]);

            setLoading(true);
            const data = await SearchData(query, FetchUsers, FetchGroups);
            setSearchResults(data);
            setLoading(false);

            if (data.length > 0) {
                setLastId(data[data.length - 1].id);
            }
        }, 200),
        [FetchUsers, FetchGroups]
    );

    const handleScroll = useCallback(
        debounce(async (e) => {
            const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
            if (bottom && lastId && !loading) {
                setLoading(true);
                const query = e.target.previousElementSibling.value;
                const data = await SearchData(query, FetchUsers, FetchGroups, lastId);
                setSearchResults(prev => [...prev, ...data]);
                setLoading(false);

                if (data.length > 0) {
                    setLastId(data[data.length - 1].id);
                }
            }
        }, 200),
        [lastId, loading, FetchUsers, FetchGroups]
    );

    useEffect(() => {
        const container = document.querySelector(".search-Section");
        container.addEventListener("scroll", handleScroll);
        return () => {
            container.removeEventListener("scroll", handleScroll);
        };
    }, [handleScroll]);

    return (
        <>
            <div className="searchBar">
                <input onInput={handleSearch} type="text" placeholder="&#xF002; Search..." />
                <div className="search-Section">
                    {searchResults.map((res, index) => (
                        <SearchResultItem key={index} data={res} />
                    ))}
                    {loading && <div className="loading">Loading...</div>}
                </div>
            </div>
        </>
    );
}

function SearchResultItem({ data }) {
    if (data.firstName) {
        data.firstName = data.firstName + " ";
    }
    return (
        <Link href={`${data.name ? "/groups/" + data.id : "/profile/" + data.id}`} className="res">
            <div>
                <img
                    src={`${data.name ? "/images/group.jpg" : data.avatar ? data.avatar : "/images/test.jpg"}`}
                    alt="profile"
                />
                <p>{(data.firstName + data.lastName) || data.name}</p>
            </div>
            <p dangerouslySetInnerHTML={{ __html: data.name ? GroupIcon : UserIcon }} />
        </Link>
    );
}
