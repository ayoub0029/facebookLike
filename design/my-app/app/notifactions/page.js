"use client"

import { useEffect, useState } from "react"

export default function Notif(){
    const [data, setData] = useState
    
    useEffect(()=>{
        const fetchData = async ()=>{
            const resp = await fetch("")
            if(!resp.ok){
                throw new Error("failde to get data, ", resp.status)
            }
            const data = await resp.json()
        }

        fetchData().catch((err) =>{
            console.error(err);
        })
    })
}