// docs link for login Ui from next js  😯 : https://next-auth.js.org/getting-started/example

// docs link for Shade cn : https://ui.shadcn.com/docs/components/toast
// docs link for DeBounceValue  website : https://usehooks-ts.com/react-hook/use-debounce-value
'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import Link from 'next/link';
import axios, { AxiosError } from 'axios';
import { useDebounceValue, useDebounceCallback } from 'usehooks-ts';
import { useToast } from '@/components/ui/use-toast';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signupSchema } from '@/schemas/signupSchema';
import { ApiResponse } from '@/types/ApiResponse';
import {
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
  Form,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const page = () => {
  const [username, setusername] = useState('');
  const [usernameMsg, setusernameMsg] = useState('');
  const [isCheckingUsername, setisCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debounced = useDebounceCallback(setusername, 2000);
  const { toast } = useToast();
  const router = useRouter();

  // zod implementation for form validation 😊

  // in docs they call "useform" as register 😅
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
    },
  });

  useEffect(() => {
    const checkUsernameUniqueness = async () => {
      if (username) {
        setisCheckingUsername(true);
        setusernameMsg('');
        try {
          const response = await axios.get(
            `/api/check-username-unique?username=${username}`
          );
          setusernameMsg(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setusernameMsg(
            axiosError.response?.data.message ??
              "Couldn't check username uniqueness"
          );
        } finally {
          setisCheckingUsername(false);
        }
      }
    };
    checkUsernameUniqueness();
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signupSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>('/api/sign-up', data);
      toast({
        title: 'success',
        description: response.data.message,
      });
      router.replace(`/verify/${username}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message;
      toast({
        title: 'error',
        description: errorMessage ?? 'SIGN UP FAILED',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Incognito Chats
          </h1>
          <p className="mb-4">Sign up to start your Secret feedbacks</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      debounced(e.target.value);
                    }}
                  />
                  {isCheckingUsername && <Loader2 className="animate-spin" />}
                  {!isCheckingUsername && usernameMsg && (
                    <p
                      className={`text-sm ${
                        usernameMsg === 'Username is unique'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {usernameMsg}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <Input {...field} name="email" />
                  <p className="text-muted text-gray-400 text-sm">
                    We will send you a verification code
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} name="password" />
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p>
            Already a member?{' '}
            <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default page;
