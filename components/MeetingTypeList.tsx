'use client';

import Image from 'next/image';
import HomeCard from './HomeCard';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MeetingModal from './MeetingModal';
import { useUser } from '@clerk/nextjs';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { toast } from './ui/use-toast';
import { Textarea } from './ui/textarea';
import ReactDatePicker from 'react-datepicker';
import { Input } from './ui/input';


const MeetingTypeList = () => {
  const [meetingState, setMeetingState] = useState<'isInstantMeeting' | 'isScheduleMeeting' | 'isJoiningMeeting'>();
  const router = useRouter();
  const { user } = useUser();
  const client = useStreamVideoClient();
  const [callDetail, setCallDetail] = useState<Call>();
  const [values, setValues] = useState({
    dateTime: new Date(),
    description: '',
    link: ''
  })

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast({ title: 'Please select a date and time' });
        return;
      }
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setCallDetail(call);
      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      toast({
        title: 'Meeting Created',
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to create Meeting' });
    }
  };

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`

  return (
    <section
      className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4"
      onClick={() => { }}
    >
      <HomeCard
        icon_src="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        onClick={() => setMeetingState('isInstantMeeting')}
      />
      <HomeCard
        icon_src="/icons/join-meeting.svg"
        title="Join Meeting"
        description="via invitation link"
        bg_class="bg-blue-1"
        onClick={() => setMeetingState('isJoiningMeeting')}
      />
      <HomeCard
        icon_src="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan your meeting"
        bg_class="bg-purple-1"
        onClick={() => setMeetingState('isScheduleMeeting')}
      />
      <HomeCard
        icon_src="/icons/recordings.svg"
        title="View Recordings"
        description="Meeting Recordings"
        bg_class="bg-yellow-1"
        onClick={() => router.push('/recordings')}
      />

      {!callDetail ? (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-sky-2">
              Add a description
            </label>
            <Textarea
              className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
            />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-sky-2">
              Select Date and Time
            </label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeIntervals={15}
              timeCaption='time'
              timeFormat='HH:mm'
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full rounded bg-dark-3 p-2 focus:outline-none"
            />
          </div>
        </MeetingModal>) : (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          className="text-center"
          buttonText="Copy Meeting Link"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink)
            toast({ title: "Link Copied" })
          }}
          image='/icons/checked.svg'
          buttonIcon='/icons/copy.svg'
        />
      )
      }

      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Start An Instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />

      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Type the Link Here"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => router.push(values.link)}
      >
        <Input
          placeholder='Meeting Link...'
          value={values.link}
          className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
          onChange={e => setValues({ ...values, link: e.target.value })}
        />
      </MeetingModal>
    </section>
  );
}

export default MeetingTypeList