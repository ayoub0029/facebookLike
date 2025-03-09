export const PrivacyText = (privacy) => {
    privacy = privacy.privacy

    if (privacy === "public") {
        return (
            <>
                <i className="fa-solid fa-globe"></i>
                <span> public</span>
            </>
        )
    } else if (privacy === "almost private") {
        return (
            <>
                <i className="fa-solid fa-user-group"></i>
                <span> almost private</span>
            </>
        )
    } else {
        return (
            <>
                <i className="fa-solid fa-lock"></i>
                <span> private</span>
            </>
        )
    }
};