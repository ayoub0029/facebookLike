"use client"
import React, { useState } from 'react'
import { fetchApi } from '@/api/fetchApi'
import { usePathname } from "next/navigation"
import Link from 'next/link'
import '../../styles/creategroup.css'

export default function EventContainer(/* {onAction} */) {
    const [isClicked, setIsClicked] = useState(false)
    const [error, setError] = useState(null)
    const [isSubmitted, setSubmitted] = useState(false)
    const fullPath = usePathname();
    const pathParts = fullPath.split("/");
    const groupID = pathParts[pathParts.length - 1];

    function showPopUp() {
        setIsClicked(true)
    }

    function hidePopUp() {
        setSubmitted(false)
        setIsClicked(false)
    }

    const createEvent = async (event) => {
        event.preventDefault()
        const data = new FormData(event.target)
        data.append('group', groupID)
        try {
            const res = await fetchApi(`group/event`, 'POST', data, true)
            if (res.status !== undefined) {
                console.error('Failed to create event:', res)
                setError(`Error: ${res.message || 'Could not create event'}`)
                return
            }
            setError(null)
            setSubmitted(true)
            /* onAction() */
            event.target.reset()
        } catch (err) {
            console.error('Error creating event:', err)
            setError('An unexpected error occurred')
        }
    }

    return (
        <div className="CreateGroup">
            <h2>Create Event</h2>
            <button className='btn btnGreen' onClick={showPopUp} type="submit">Add Event</button>
            {isClicked && (
                <>
                    <div className='overlay' onClick={hidePopUp}></div>
                    <div className='createGrp'>
                        <form onSubmit={createEvent}>
                            <label htmlFor="title">Event Title:</label>
                            <input type="text" id="name" name="title" required />
                            <label htmlFor="description">Description:</label>
                            <textarea id="description" name="description" required />
                            <label htmlFor="startDate">Start Event:</label>
                            <input type="datetime-local" id="start" name='start' required />
                            <label htmlFor="endDate">End Event:</label>
                            <input type="datetime-local" id="end" name='end' required />
                            <button className='btn btnGrey' type="submit" >Create Event</button>
                            {error && <p className="error-message">{error}</p>}
                            {!error && isSubmitted && <p className="success-message">Event has been created!</p>}
                        </form>
                        <button className='btn btnWhite' onClick={hidePopUp}>x</button>
                    </div>
                </>
            )}
        </div>
    )
}
