import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { error } from "console";

export async function DELETE(req:NextRequest, {params}: {params: {id:string}}){
 const {userId} = await auth();
  
 if(!userId){
    return NextResponse.json({
        error:"Unauthorized!"
    }, {status:404})
 }

 try {
    const todoId = params.id
    const todo = await prisma.todo.findUnique({
        where:{id:todoId}
    })

    if(!todo){
    return NextResponse.json({
        error:"no todo!"
    }, {status:404})
    }

    if(todo.userId !== userId){
        return NextResponse.json({
            error:"Forbidden!"
        }, {status:403})
    }

    await prisma.todo.delete({
        where:{id: todoId}
    })

    return NextResponse.json({
            message:"Todo deleted successfully!"
        }, {status:403})

 } catch (err) {
    console.error("Error deleting todo!", err);
    return NextResponse.json({
        error: "Error deleting todo"
    },{status:500})
 }





}