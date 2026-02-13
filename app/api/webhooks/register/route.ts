import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { error } from "console";

export async function POST(req: Request){
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

    if(!WEBHOOK_SECRET){
        throw new Error("Please add Webhook secret in env!")
    }

    const headerPayload = headers();
    const svix_id =(await headerPayload).get("svix-id");
    const svix_signature = (await headerPayload).get("svix-signature");
    const svix_timestamp = (await headerPayload).get("svix-timestamp");

    if(!svix_id || !svix_signature || !svix_timestamp){
        throw new Error("Error occured: No svix headers!")
    }

    const payload = await req.json()
    const body = JSON.stringify(payload)

    const wh = new Webhook(WEBHOOK_SECRET)

    let evt: WebhookEvent

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-signature": svix_signature,
            "svix-timestamp": svix_timestamp
        }) as WebhookEvent;

    } catch (err) {
        console.error("Error verifying webhook!", err)
        return new Response("Error occured!", {status:400})
    }

    const {id} = evt.data
    const eventType = evt.type

    //logs

    if(eventType === "user.created"){
        try {
            const {email_addresses, primary_email_address_id} = evt.data;

        // log practice
        const primaryEmail = email_addresses.find(
            (email) => email.id === primary_email_address_id
        )

        if(!primaryEmail){
            return new Response("No Primary email found!", {status:400})
        }

        //create a user in neon(postgresql)
        const newUser = await prisma.user.create({
            data:{
                id: evt.data.id!,
                email: primaryEmail.email_address,
                isSubscribed: false
            }
        })
        console.log("New user created", newUser);

        } catch (error) {
           return new Response("error creating user in database!", {status:400})

        }
    }

    return new Response("Webhook received successfully!", {status:200})

}