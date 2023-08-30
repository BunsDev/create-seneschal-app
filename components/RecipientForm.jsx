'use client';

import { Gem, ExternalLink, ConciergeBell } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { getAccountString } from '@/lib/helpers';

const notifications = [
  {
    title: 'Proposal One',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    loot: '100',
    recipient: '0x6d2e03b7EfFEae98BD302A9F836D0d6Ab0002766',
    delayed: true
  },
  {
    title: 'Proposal Two',
    description:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    loot: '100',
    recipient: '0x6d2e03b7EfFEae98BD302A9F836D0d6Ab0002766',
    delayed: false
  }
];

export function RecipientForm() {
  return (
    <div className='grid grid-cols-3 gap-10 mt-12'>
      {notifications.map((value) => (
        <Card>
          <CardHeader>
            <div className='mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0'>
              <span className='flex h-2 w-2 translate-y-1 rounded-full bg-sky-500' />
              <div className='space-y-1'>
                <p className='text-sm font-medium leading-none'>Status</p>
                <p className='text-sm text-muted-foreground'>Processed</p>
              </div>
            </div>
            <div className='flex flex-row items-center'>
              <CardTitle className='mr-2'>{value.title}</CardTitle>
              <ExternalLink className='w-4 h-4' />
            </div>

            <CardDescription>{value.description}</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-4'>
            <div>
              <div className='mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0'>
                <div className='space-y-1'>
                  <p className='text-sm font-medium leading-none'>
                    Loot Amount
                  </p>
                  <p className='text-sm text-muted-foreground'>{value.loot}</p>
                </div>
              </div>
              <div className='mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0'>
                <div className='space-y-1'>
                  <p className='text-sm font-medium leading-none'>Recipient</p>
                  <p className='text-sm text-muted-foreground'>
                    {getAccountString(value.recipient)}
                  </p>
                </div>
              </div>
            </div>
            <Alert variant={value.delayed && 'destructive'}>
              <AlertTitle>
                {value.delayed ? 'Past Due' : 'Claimable'}
              </AlertTitle>
              <AlertDescription>
                {value.delayed
                  ? 'This commitment is past claim delay.'
                  : 'Processed & ready to claim.'}
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter>
            <Button className='w-full mb-2' disabled={!value.delayed}>
              <Gem className='mr-2 h-4 w-4' /> Claim Reward
            </Button>
            <Button
              className='w-full'
              variant='outline'
              disabled={value.delayed}
            >
              <ConciergeBell className='mr-2 h-4 w-4' /> Poke
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
