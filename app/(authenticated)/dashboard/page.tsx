"use client";

import { useUser } from '@clerk/nextjs';
import { Todo } from '@prisma/client';
import { title } from 'process';
import React, { useCallback, useEffect, useState } from 'react'
import { useDebounceValue } from 'usehooks-ts';

function Dashboard() {

    const {user} = useUser();
    const [todos, setTodos] = useState<Todo[]>([])
    const [searchTerm, useSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [totalPages, setTotalPages] = useState(false)
    const [currentPage, setCurrentPage] = useState(1);
    const [isSubscribed, setIsSubscribed] = useState(false);


    const [debounceSearchTerm] = useDebounceValue(searchTerm, 300)

    const fetchTodos = useCallback(async (page: number) => {

        try {
            setLoading(true);
            const response = await fetch(`/api/todos?page=${page}&search=${debounceSearchTerm}`)
            
            if(!response.ok){
                throw new Error("Failed to fetch todos")

            }

            const data = await response.json()
            setTodos(data.todos)
            setTotalPages(data.totalPages)
            setCurrentPage(data.currentPage)
            setLoading(false)

        } catch (error) {
            setLoading(false)
        }
    }, [debounceSearchTerm])

    useEffect(() => {
        fetchTodos(1)
        fetchSubscriptionStatus() 
    }, [])

    const fetchSubscriptionStatus = async() => {
        const response = await fetch("/api/subscription")

        if(!response.ok){
           const data = await response.json();
           setIsSubscribed(data.isSubscribed);
        }
    }

    const handleAddTodo = async(title: string) => {

        try {
            const response = await fetch("/api/todos",{
                method:"POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({title})
            })

            if(!response.ok){
                throw new Error("Failed to add todo")
            }
            await fetchTodos(currentPage)
        } catch (error) {
            console.log(error)
            
        }

    }

    const handleUpdateTodo = async(id: string, completed: boolean) => {
        try {
            const response = await fetch(`/api/todos/${id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({completed})
            })

            if(!response.ok){
                throw new Error("Failed to update todo")
            }
            await fetchTodos(currentPage)

        } catch (error) {
            
        }
    }

    const handleDeleteTodo = async(id: string) => {
        const response = await fetch(`/api/todos/${id}`,{
         method:"DELETE",
        })

        if(!response.ok){
            throw new Error("Failed to delete todo")
        }

        await  fetchTodos(currentPage);
    }


  return (
    <div>Dashboard</div>
  )
}

export default Dashboard