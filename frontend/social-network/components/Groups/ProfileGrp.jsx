"use client"
import { useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { fetchApi } from "@/api/fetchApi"
export default function ProfileGrp() {
    const fullPath = usePathname();
    const pathParts = fullPath.split("/");
    const pathname = pathParts[pathParts.length - 1];
    console.log("path: ",pathname);

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
            {error && <p>{error}</p>}
            {!loading && !error && GroupProfile.length === 0 ? (
                <p>No Data Found</p>
            ) : (
                <div>
                    {/* handling profile data */}
                </div>
            )}
        </div>
    )
}