'use client';

// lib imports

import { ApolloProvider } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// file imports

import { Proposals } from '@/components/Proposals';
import { SUBGRAPH_GRAPHQL_CLIENT } from '@/graphql/config';

export default function Home() {
  const router = useRouter();

  return (
    <main className='min-h-screen grid grid-flow-row gap-4 max-w-7xl px-24 pt-12 pb-4 mx-auto'>
      <div className='flex flex-row min-w-full justify-between items-center'>
        <h2 className='text-3xl font-semibold tracking-tight transition-colors'>
          The Seneschal
        </h2>
        <Button onClick={() => router.push('/seneshal')}>Open app</Button>
      </div>

      <div className='min-h-[750px] border rounded bg-[#fafbfc] p-4'>
        <p className='py-12 w-3/4 mr-auto text-muted-foreground '>
          The seneschal shaman enables a high degree of agency for DAO operators
          to grant shares, loot and rewards to value creating participants. It
          enables piecemeal task to task incentives for DAO participants. It’s
          entirely non-coersive; and useful for high-trust organizations.
        </p>

        <ApolloProvider client={SUBGRAPH_GRAPHQL_CLIENT}>
          <Proposals />
        </ApolloProvider>
      </div>

      <div className='flex flex-row min-w-full justify-between items-center'>
        <a
          href='https://silverdoor.ai'
          target='_blank'
          className='scroll-m-20 pb-2 text-xs font-semibold tracking-tight transition-colors first:mt-0 cursor-pointer'
        >
          Silverdoor @ 2023
        </a>
        <small className='text-xs font-medium leading-none text-muted-foreground'>
          Built by{' '}
          <a
            href='https://twitter.com/KyleSt4rgarden'
            target='_blank'
            className='cursor-pointer underline'
          >
            st4rgard3n
          </a>{' '}
          &{' '}
          <a
            href='https://twitter.com/saimano1996'
            target='_blank'
            className='cursor-pointer underline'
          >
            saimano
          </a>
        </small>
      </div>
    </main>
  );
}
