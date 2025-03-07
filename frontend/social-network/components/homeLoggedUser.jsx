import Image from "next/image";
import Link from "next/link";

export function HomeProfile() {
    return (
        <Link href={"/profile"} className="primary" style={{textDecoration:"none"}}>
            <div className="postHeader">
                <span className="status profileStatusXY online"></span>
                <Image
                    src={
                        window.userState.avatar?.startsWith("http")
                            ? window.userState.avatar
                            : (window.userState.avatar && window.userState.avatar !== "undefined")
                                ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/public/${window.userState.avatar}`
                                : "/images/test.jpg"
                    }
                    alt="Profile Image"
                    className="profileImg"
                    width={40}
                    height={40}
                    unoptimized={true}
                />
                <div className="postInfo">
                    <span className="postName">{window.userState.fullname}</span>
                </div>
            </div>
        </Link>
    );
}