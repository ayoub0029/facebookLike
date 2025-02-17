import Link from "next/link";

export const metadata = {
    title: "post Page",
}

export default function postsPage(){
    return (
        <div>
            <h1>page posts</h1>
        <Link href="/">
            <button>go to Home</button>
        </Link>
        </div>

    );
}