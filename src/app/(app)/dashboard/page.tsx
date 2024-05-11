'use client';
import { toast, useToast } from '@/components/ui/use-toast';
import { Message } from '@/models/User';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';
import { MessageCard } from '@/components/MessageCard';
import { Loader2, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

const dashboard = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setisLoading] = useState(false);
  const [isSwitchLoading, setisSwitchLoading] = useState(false);
  const Toast = useToast();

  const handleDeleteMessage = (messageId: string) => {
    //  following optimistic approach to delete the message from UI first and then server will handle the rest ( This approach is used by Instagram, Facebook, Twitter etc.) where server failure chnaces are very less and in this way the Ui will be more responsive and user will not have to wait for the server to respond.
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession();

  //  doc link for form object : https://react-hook-form.com/get-started
  const form = useForm({
    resolver: zodResolver(acceptMessageSchema),
  });

  const { register, watch, setValue } = form;

  const acceptMessages = watch('acceptmessages');

  const fetchAcceptMessage = useCallback(async () => {
    setisSwitchLoading(true);
    try {
      const res = await axios.get<ApiResponse>('/api/accept-message');
      setValue('acceptmessages', res.data.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'error',
        description:
          axiosError.response?.data.message ||
          'failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setisSwitchLoading(false);
    }
  }, [setValue]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setisLoading(true);
      setisSwitchLoading(false);
      try {
        const res = await axios.get<ApiResponse>('/api/get-messages');
        setMessages(res.data.messages || []);
        if (refresh) {
          toast({
            title: 'Messages refreshed',
            description: 'showing latest messages',
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: 'error',
          description:
            axiosError.response?.data.message || 'failed to fetch messages',
          variant: 'destructive',
        });
      } finally {
        setisLoading(false);
        setisSwitchLoading(false);
      }
    },
    [setisLoading, setMessages]
  );

  useEffect(() => {
    if (!session || !session.user) return;
    fetchMessages();
    fetchAcceptMessage();
  }, [session, setValue, fetchAcceptMessage, fetchMessages]);

  const handleSwitchChnage = async () => {
    try {
      const res = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });
      setValue('acceptmessages', !acceptMessages);
      toast({
        title: 'success',
        description: res.data.message,
        variant: 'default',
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'error',
        description:
          axiosError.response?.data.message || 'failed to update messages',
        variant: 'destructive',
      });
    }
  };

  const { username } = session?.user || {};

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'Copied',
      description: 'Profile link copied to clipboard',
    });
  };

  if (!session || !session.user) return <p>You are not logged in</p>;

  return (
    <>
      <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
        <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
          <div className="flex items-center">
            <input
              type="text"
              value={profileUrl}
              disabled
              className="input input-bordered w-full p-2 mr-2"
            />
            <Button onClick={copyToClipboard}>Copy</Button>
          </div>
        </div>

        <div className="mb-4">
          <Switch
            {...register('acceptMessages')}
            checked={acceptMessages}
            onCheckedChange={handleSwitchChnage}
            disabled={isSwitchLoading}
          />
          <span className="ml-2">
            Accept Messages: {acceptMessages ? 'On' : 'Off'}
          </span>
        </div>
        <Separator />

        <Button
          className="mt-4"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            fetchMessages(true);
          }}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
        </Button>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <MessageCard
                key={message._id}
                message={message}
                onMessageDelete={handleDeleteMessage}
              />
            ))
          ) : (
            <p>No messages to display.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default dashboard;
