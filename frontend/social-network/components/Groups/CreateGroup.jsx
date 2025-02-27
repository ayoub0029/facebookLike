"use client"

import React, { useState } from 'react'
import { fetchApi } from '@/api/fetchApi'

export default function CreateGroup() {
    // handling the POST for cretaion group
    const CreateGrp = async (event) =>{
        event.preventDefault()
        const data = new FormData(event.target)
        const res = await fetchApi('POST', '/AddGroup', data, false)        
        if (res != null) {
            console.error('Failed to create group')
            return
        }
        console.log('Group created:', res)
    }
    return (
        <div className="CreateGroup">
            <h2>Create Group</h2>
            <form onSubmit={CreateGrp}>
                <label htmlFor="name">Group Name:</label>
                <input type="text" id="name" name="name" required />
                <label htmlFor="description">Description:</label>
                <textarea id="description" name="description" required />
                <button type="submit">Create Group</button>
            </form>
        </div>
    )
}
