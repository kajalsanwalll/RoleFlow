"use client"
import React, { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ReactFormState } from 'react-dom/client'
import {Eye, EyeOff} from "lucide-react";
import { Label } from '@/components/ui/label'

function SignUp() {
  
  const {isLoaded, signUp, setActive} = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("")
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [ error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  if(!isLoaded){
    return null;
  }
 
  // when someone presses on submit button:
  async function submit(e: React.FormEvent){
    e.preventDefault();
    if(!isLoaded){
     return;
    }

    try {

      //create
      await signUp.create({
        emailAddress,
        password
      })

      //email code
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code"
      })

      //now check!
      setPendingVerification(true);

    } catch (error:any) {
      console.log(JSON.stringify(error, null,2));
      setError(error.errors[0].message)
      
    }
  }

  // when someone presses on Verify button (email):
  async function onPressVerify(e: React.FormEvent){
    e.preventDefault();

    if(!isLoaded){
      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({code})  //someone attempted with this code
      
      if(completeSignUp.status !== "complete"){
      console.log(JSON.stringify(completeSignUp, null, 2));
      }

      if(completeSignUp.status === "complete"){

        await setActive({session: completeSignUp.createdSessionId})
        router.push("/dashboard")
      }
      
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      setError(err.errors[0].message)
    }
  }

  return(
    <div className='flex items-center justify-center min-h-screen bg-background'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <CardTitle className='text-2xl font-bold text-center'>
            Sign up for Todo Master
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!pendingVerification ? (
           <form onSubmit={submit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor="email">Email</Label>
              <Input 
               type='email' 
               id='email' 
               value={emailAddress} 
               onChange={(e) => setEmailAddress(e.target.value)}
               required
               />
            </div>
            <div className='space-y-2'>
              <Label htmlFor="password">Password</Label>
              <div className='relative'>
                <Input 
                 type={showPassword ? 'text' : 'password'} 
                 id='password' 
                 value={password} 
                 onChange={(e) => setPassword(e.target.value)}
                 required
                 />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-2 top-1/2 -translate-y-1/2'
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4 text-gray-500' />
                    ): (
                      <Eye className='h-4 w-4 text-gray-500' />
                    )}
                  </button>
              </div>
            </div>
            {error && <p className='text-red-500 text-sm'>{error}</p>}
            <Button type='submit' className='w-full'>Sign Up</Button>
           </form>  
          ) : (
            <form onSubmit={onPressVerify} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor="code">Verification Code</Label>
                <Input 
                 type='text' 
                 id='code' 
                 value={code} 
                 onChange={(e) => setCode(e.target.value)}
                 required
                 />
              </div>
              {error && <p className='text-red-500 text-sm'>{error}</p>}
              <Button type='submit' className='w-full'>Verify Email</Button>
            </form>
          )}
        </CardContent>
        <CardFooter className='justify-center'>
          <p className='text-sm text-muted-foreground'>Already have an account? {" "}
            <Link href="/sign-in" className='font-medium text-primary hover:underline'>Sign in</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default SignUp