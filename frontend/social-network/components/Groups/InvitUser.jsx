// "use-cliant"
import React, { useState, useEffect, useRef, useCallback } from "react";
import { fetchApi } from "@/api/fetchApi";
import style from "../../styles/profile.module.css";
import "../../styles/inviteGrp.css";
import Link from "next/link";
import { usePathname } from "next/navigation"
import useLazyLoad from "@/hooks/lazyload"

export default function InvitUser({ userID }) {
    const [errorInvit, setErrorInvite] = useState(null)
    const [invitations, setInvitations] = useState([])
    const fullPath = usePathname();
    const pathParts = fullPath.split("/");
    const groupID = pathParts[pathParts.length - 1];
    const fetchUserToInvite = async (page) => {
        try {
            const data = await fetchApi(`group/people?group=${groupID}&page=${page}`, `GET`, null, false)
            if (data.status !== undefined) {
                return { error: data.error, status: data.status }
            }
            const groups = Array.isArray(data) ? data : []
            return {
                items: groups,
                nextPage: groups.length > 0 ? page + 5 : null
            }
        } catch (err) {
            console.error(`Error fetch groups: ${err}`);
            return { items: [], nextPage: null }
        }
    }
    const {
        data,
        loaderRef,
        loading,
        error,
        nextPage,
    } = useLazyLoad(fetchUserToInvite)

    const Invit = async (id) => {
        const formData = new FormData();
        formData.append("group", groupID);
        formData.append("member", id);
        try {
            const response = await fetchApi(`group/invite`, "POST", formData, true);
            if (response.error || response.status >= 400) {
                console.error("Error voting on event:", response.error);
                setErrorInvite(response.error?.message || `Error: ${response.status}`);
                return { error: response.error?.message || `Error: ${response.status}`, status: "error" };
            }
            for (let index = 0; index < invitations.length; index++) {
                const element = invitations[index];
                if (element.Id === id) {
                    invitations.splice(index, 1);
                }
                setInvitations([...invitations]);
            }
        } catch (error) {
            console.error("Invitation error:", error);
            setErrorInvite("Failed to process invitation")
            return { status: 500, error: "Failed to process invitation" };
        }
    }


    useEffect(() => {
        if (data) {
            setInvitations(data)
        }
    }, [data])

    return (
        <div className="ivitationCard-container">
            {error && <p className="error-message">{error}</p>}
            {errorInvit && <p className="error-message">{errorInvit}</p>}
            <div
                className="scrollable-container"
                style={{
                    maxHeight: '300px',
                    overflowY: 'auto',
                    padding: '10px',
                    border: '1px solid #eee',
                    borderRadius: '8px'
                }}
            >
                {loading && invitations.length === 0 && (<p className="loading-message">Loading invitation...</p>)}
                {!error && invitations.length === 0 && !loading && (
                    <p className="no-invitaion">No invitation found</p>
                )}
                <div className="Invitaion-loop">
                    {invitations.map(inviteCard => (
                        <div key={inviteCard.Id} className="inviters">
                            <Link href={`/profile/${inviteCard.Id}`}>
                                <div className={style["cont_user_list"]}>
                                    <img
                                        src={
                                            inviteCard.Avatar?.startsWith("http")
                                                ? inviteCard.ProfileData.Avatar
                                                : inviteCard.ProfileData.Avatar && inviteCard.ProfileData.Avatar !== "undefined"
                                                    ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/public/${inviteCard.Avatar}`
                                                    : "/images/test.jpg"
                                        }
                                        alt={inviteCard.ProfileData.Nickname}
                                    />
                                    <span>
                                        {inviteCard.ProfileData.First_Name} {inviteCard.ProfileData.Last_Name}
                                    </span>
                                </div>
                            </Link>
                            <button onClick={() => Invit(inviteCard.Id)}>
                                <i className="fas fa-plus"></i>invite
                            </button>
                        </div>
                    ))}
                    {loading && nextPage !== null && (
                        <p className="loading-more">Loading more events...</p>
                    )}
                    <div ref={loaderRef}></div>
                </div>
            </div >
        </div>
    )
}
