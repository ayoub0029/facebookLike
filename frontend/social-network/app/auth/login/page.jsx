"use client" 
import Link from "next/link";
import "../auth.css"
import "/styles/globals.css"
import { fetchApi } from "/api/fetchApi";
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
export default function Loginform() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    let email = emailRef.current.value;
    let password = passwordRef.current.value;
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', password);
      const result = await fetchApi('auth/login', 'POST', formData,true);
      
      if (result.error) {
        throw new Error(result.error || 'Login failed');
      }

      router.push("/")

    } catch (error) {
      alert(error);
    }
  };
  return (
    <div className="form">
      <input ref={emailRef}  type="text" placeholder="Email" />
      <input ref={passwordRef} type="password" placeholder="password" />
      <p className="redirect">don't have account <Link href={"/auth/register"}> register</Link></p>
      <input type="button" value="submit" onClick={handleLogin} />
    </div>
  );
}


async function Isloggedin(){
  try{
    const result = await fetchApi('/auth/status', 'GET', null);
    if(result.error){
      throw new Error(result.error || 'Failed to check login status')
    }
    return result.data
    }catch(error){
      return false
    }
}