"use client"
import { fetchApi } from "@/api/fetchApi"
import { useRouter } from 'next/navigation';

export default async function logout(){
    const router = useRouter();
    try {
    let response = await fetchApi('auth/logout','POST',{},true)
    if (response.error) {
        throw new Error(response.error || 'Login failed');
    }
    router.push("/auth/login")
    }catch(error){
        console.log(error)
    }
}