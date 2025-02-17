"use client"
import { useState, useEffect } from "react"

export default function Todo(){
    const [todo, setTodo] = useState({})
    useEffect(()=>{
        // fetch
        setTodo("data")
    })

    return(
        <div>
            {/* {todo.name} */}
        </div>
    )
}