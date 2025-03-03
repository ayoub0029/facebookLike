"use client"
import React, { useState,useEffect } from 'react'
import { fetchApi } from '@/api/fetchApi'
import '../../styles/creategroup.css'

export default function CreateGroup() {
    const [isClicked, useIsClicked] = useState(false)
    const [error, useError] = useState(null)
    const [isSubmitted, useSubmitted] = useState(false)
    function ShowPopUp() {
        useIsClicked(true)
    }

    function HidePopUp() {
        useSubmitted(false)
        useIsClicked(false)
    }

    const CreateGrp = async (event) => {
        event.preventDefault()
        const data = new FormData(event.target)
        console.log("data: ", data);
        const res = await fetchApi('group', 'POST', data, true)
        if (res.status != undefined) {
            console.error('Failed to create group')
            useError(`Error`)
            return
        }
        console.log('Group created:', res)
        useError(null)
        useSubmitted(true)
    }

    return (
        <div className="CreateGroup">
            <h2>Create Group</h2>
            <button className='btn btnGreen' onClick={ShowPopUp} type="submit">Add Group</button>
            {isClicked && (
                <>
                    <div className='overlay' onClick={HidePopUp}></div>
                    <div className='createGrp'>
                        <form onSubmit={CreateGrp}>
                            <label htmlFor="name">Group Name:</label>
                            <input type="text" id="name" name="name" required />
                            <label htmlFor="description">Description:</label>
                            <textarea id="description" name="description" required />
                            <button className='btn btnGrey' type="submit">Create Group</button>
                            {error && <p className="error-message">{error}</p>}
                            {!error && isSubmitted && <p className="success-message">Group has been created!</p>}
                        </form>
                        <button className='btn btnWhite' onClick={HidePopUp}>x</button>
                    </div>
                </>
            )}
        </div>
    )
}
