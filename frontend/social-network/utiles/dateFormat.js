export function formatTime(timestamp) {
    const date = new Date(timestamp);
    const currentDate = new Date();
    const seconds = Math.floor((currentDate - date) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
    ) {
        return "Yesterday";
    }

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year:"numeric" });
}
