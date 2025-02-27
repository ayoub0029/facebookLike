"use client"
import { useEffect } from "react"

export default function ProfileGrp() {
    const [GroupProfile, setGroupProfile] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchGroupProfile = async () => {
            try {
                setLoading(true)
                // Fetch group profile data from the API endpoint
                const data = await fetchApi('GET', '/GrpProfileDta', null, false)
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
            {!loading && !error && GroupProfile.lenght === 0 ? (<p>No Data Found</p>
            ) : (
                {
                    // Display the group profile data
                    // ms 9bl khassni n3rf les attributs li kayn f data
                }
            )
        }
        </div>
    )
}