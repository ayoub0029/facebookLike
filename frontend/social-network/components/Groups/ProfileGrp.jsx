"use client"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { fetchApi } from "@/api/fetchApi"
import '../../styles/groupProfile.css'

export default function ProfileGrp() {
    const fullPath = usePathname();
    const pathParts = fullPath.split("/");
    const pathname = pathParts[pathParts.length - 1];
    const [GroupProfile, setGroupProfile] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchGroupProfile = async () => {
            try {
                setLoading(true)
                const data = await fetchApi(`/groupInfo?group=${pathname}`, 'GET', null, false)
                console.log('User data:', data)
                setGroupProfile(data || [])
                setError(null)
            } catch (err) {
                console.error('Error fetching Grp Profile:', err)
                setError('Failed to load user data')
            } finally {
                setLoading(false)
            }
        }

        fetchGroupProfile()
    }, [])

    return (
        <div className="ProfileContainer">
            {loading && <p>Loading Data</p>}
            {error && <p className="error">{error}</p>}
            {!loading && !error && GroupProfile.length === 0 ? (
                <p>No Data Found</p>
            ) : (
                <div className="GroupHeader">
                    <h1 className="GroupName">{GroupProfile.name}</h1>
                    <h3 className="GroupDescription">{GroupProfile.description}</h3>
                    <p className="MemberCount">{GroupProfile.members + 1} Members</p>
                </div>
            )}
        </div>
    )
}