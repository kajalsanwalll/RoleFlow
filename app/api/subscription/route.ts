import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { error } from "console";
import { use } from "react";

export async function POST() {
    const { userId} = await auth();

    if(!userId){
        return NextResponse.json({error:"Unauthorized!"}, {status:400})
    }

    // capture payment

    try {
        const user = await prisma.user.findUnique({where: {id: userId}})

        if(!user){
        return NextResponse.json({error:"No user found!"}, {status:400})
        }

        const subscriptionEnds = new Date()
        subscriptionEnds.setMonth(subscriptionEnds.getMonth() + 1)

        // now updating value
        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: {
                isSubscribed: true,
                subscriptionEnds: subscriptionEnds
            }
            
        })

        return NextResponse.json({
            message: "Subscription added!",
            subscriptionEnds: updatedUser.subscriptionEnds
        })
    } catch (err) {
        console.error("error updating your subscription bruh!",err)

        return NextResponse.json({
            error: "Internal Server Error!"
        }, {status:500})
    }
}