'use client'

import { useGetCalls } from '@/hooks/useGetCalls'
import { Call, CallRecording } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import MeetingCard from './MeetingCard';
import Loader from './Loader';
import { Client } from '@clerk/nextjs/server';
import { useToast } from './ui/use-toast';

const CallList = ({
    type
}: { type: 'ended' | 'upcoming' | 'recordings' }) => {
    const [recordings, setRecordings] = useState<CallRecording[]>([])
    const { toast } = useToast();
    const router = useRouter();
    const { endedCalls, upcomingCalls, callRecordings, isLoading } = useGetCalls();

    const getCalls = () => {
        switch (type) {
            case "upcoming":
                return upcomingCalls;
            case "ended":
                return endedCalls
            case "recordings":
                return recordings;
            default:
                return [];
        }
    }

    const getNoCallMessage = () => {
        switch (type) {
            case "upcoming":
                return "No Upcoming Calls";
            case "ended":
                return "No Previous Calls";
            case "recordings":
                return "No Recordings"
            default:
                return "";
        }
    }

    useEffect(() => {
        const fetchRecordings = async () => {
            try {
                const callData = await Promise.all(
                    callRecordings?.map((meeting) => meeting.queryRecordings()) ?? [],
                );

                const recordings = callData
                    .filter((call) => call.recordings.length > 0)
                    .flatMap((call) => call.recordings);

                setRecordings(recordings);
            } catch (err){
                console.log(err);
                toast({title : "Try Again Later"})
                
            }
        };

        if (type === 'recordings') {
            fetchRecordings();
        }
    }, [type, callRecordings]);
    if (isLoading) return <Loader />

    const calls = getCalls();
    const noCallMessage = getNoCallMessage();

    return (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {calls && calls.length > 0 ? calls.map((meeting: Call | CallRecording) =>
                <MeetingCard
                    key={(meeting as Call).id}
                    icon={
                        type === "upcoming" ?
                            '/icons/upcoming.svg' :
                            type === 'recordings' ?
                                "/icons/recordings.svg"
                                : "/icons/previous.svg"
                    }
                    title={
                        (meeting as Call).state?.custom?.description?.substring(0, 20) ||
                        (meeting as CallRecording).filename?.substring(0, 20)
                        || 'No Description'
                    }
                    date={
                        (meeting as Call).state?.startsAt?.toLocaleString() ||
                        (meeting as CallRecording).start_time?.toLocaleString()
                    }
                    isPreviousMeeting={type === "ended"}
                    buttonIcon1={type === "recordings" ? '/icons/play.svg' : undefined}
                    buttonText={type === 'recordings' ? "Play" : "Start"}
                    link={
                        type === "recordings" ?
                            (meeting as CallRecording).url :
                            `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(meeting as Call).id}`
                    }
                    handleClick={
                        type === "recordings" ?
                            () => router.push(`${(meeting as CallRecording).url}`) :
                            () => router.push(`/meeting/${(meeting as Call).id}`)
                    }
                />
            ) : (
                <h1 className='text-center text-2xl font-bold'>{noCallMessage}</h1>
            )}

        </div>
    )
}

export default CallList;