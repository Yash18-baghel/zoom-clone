"use client"
import Alert from '@/components/Alerts'
import Loader from '@/components/Loader'
import MeetingRoom from '@/components/MeetingRoom'
import MeetingSetup from '@/components/MeetingSetup'
import { useGetCallByid } from '@/hooks/useGetCallById'
import { useUser } from '@clerk/nextjs'
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk'
import React, { useState } from 'react'

const Meeting = ({ params: { id } }: { params: { id: string } }) => {
    const { user, isLoaded } = useUser();
    const [isSetupComplete, SetIsSetupComplete] = useState<boolean>(false);
    const { call, isCallLoading } = useGetCallByid(id);

    if (!isLoaded || isCallLoading) return <Loader />

    if (!call) return (
        <p className="text-center text-3xl font-bold text-white">
            Call Not Found
        </p>
    );

    const notAllowed = call.type === 'invited' && (!user || !call.state.members.find((m) => m.user.id === user.id));


    if (notAllowed) return <Alert title="You are not allowed to join this meeting" />;

    return (
        <main className='h-screen w-full'>
            <StreamCall call={call}>
                <StreamTheme>
                    {
                        !isSetupComplete ?
                            <MeetingSetup setIsSetupComplete={(value) => SetIsSetupComplete(value)} /> :
                            <MeetingRoom />
                    }
                </StreamTheme>
            </StreamCall>
        </main>
    )
}

export default Meeting