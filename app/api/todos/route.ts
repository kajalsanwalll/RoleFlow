import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const ITEMS_PER_PAGE = 10

export async function GET(req: NextRequest){

  const { userId} = await auth();

    if(!userId){
        return NextResponse.json({error:"Unauthorized!"}, {status:400})
    }

   const {searchParams} = new URL(req.url) 
   const page = parseInt(searchParams.get("page") || "1")
   const search = searchParams.get("search") || ""

   try {
    const todos = await prisma.todo.findMany({
        where: 
        {
            userId,
            title:{
                contains: search,
                mode: "insensitive"
            }
        },
        orderBy: {createdAt: "desc"},
        take: ITEMS_PER_PAGE,
        skip: (page - 1) * ITEMS_PER_PAGE
    })

    const totalItems = await prisma.todo.count({
        where:
        {
            userId,
            title: {
                contains: search,
                mode: "insensitive"
            }
        },
    
    })
    
    const totalPages = Math.ceil(totalItems/ ITEMS_PER_PAGE )

    return NextResponse.json({
        todos,
        currentPage: page,
        totalPages
    })
   } catch (err) {
    console.error("error grabbing your todos bruh!",err)

        return NextResponse.json({
            error: "Internal Server Error!"
        }, {status:500})
   }
}


export async function POST(){
  const { userId} = await auth();

    if(!userId){
        return NextResponse.json({error:"Unauthorized!"}, {status:400})
    }
}