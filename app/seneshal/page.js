'use client';

// lib imports

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ApolloProvider } from '@apollo/client';
import { useState } from 'react';
import { Web3Button } from '@web3modal/react';
import { useRouter } from 'next/navigation';
import {
  useAccount,
  useContractRead,
  useNetwork,
  useSwitchNetwork
} from 'wagmi';
import {
  Wallet,
  Loader2,
  PenSquare,
  Stamp,
  Gem,
  ConciergeBell
} from 'lucide-react';

// file imports

import { SponsorForm } from '@/components/SponsorForm';
import { WitnessForm } from '@/components/WitnessForm';
import { PokingForm } from '@/components/PokingForm';
import { RecipientForm } from '@/components/RecipientForm';
import {
  AREWEAVE_GRAPHQL_CLIENT,
  SUBGRAPH_GRAPHQL_CLIENT
} from '@/graphql/config';
import {
  HATS_PROTOCOL_CONTRACT_ADDRESS,
  SPONSOR_HAT_ID,
  WITNESS_HAT_ID
} from '@/config';
import HatsAbi from '../../abis/Hats.json';

export default function Home() {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const router = useRouter();

  const [tabValue, setTabValue] = useState('sponsor');

  const {
    chains,
    isLoading: switchingNetwork,
    switchNetwork
  } = useSwitchNetwork();

  const { data: isSponsor, isLoading: sponsorHatValidating } = useContractRead({
    address: HATS_PROTOCOL_CONTRACT_ADDRESS,
    abi: HatsAbi,
    functionName: 'isWearerOfHat',
    args: [address, SPONSOR_HAT_ID],
    enabled: address && chain?.id == chains[0]?.id
  });

  const { data: isWitness, isLoading: witnessHatValidating } = useContractRead({
    address: HATS_PROTOCOL_CONTRACT_ADDRESS,
    abi: HatsAbi,
    functionName: 'isWearerOfHat',
    args: [address, WITNESS_HAT_ID],
    enabled: address && chain?.id == chains[0]?.id
  });

  return (
    <main className=' min-h-screen max-w-7xl grid grid-flow-row gap-4 px-24 pt-12 pb-4 mx-auto'>
      <div className='flex flex-row min-w-full justify-between items-center'>
        <h2
          className='text-3xl font-semibold tracking-tight transition-colors cursor-pointer'
          onClick={() => router.push('/')}
        >
          The Seneschal
        </h2>
        <Web3Button />
      </div>

      <div className='min-h-[750px] border rounded bg-[#fafbfc] p-4'>
        {!address ? (
          <div className=' flex flex-col items-center lg:p-16 p-8 mt-auto mb-auto'>
            <Wallet />
            <p className='mt-4 text-sm opacity-50'>
              Connect your wallet to authenticate.
            </p>
          </div>
        ) : chain?.id != chains[0]?.id ? (
          <div className=' flex flex-col items-center lg:p-16 p-8 mt-auto mb-auto'>
            <Button
              onClick={() => switchNetwork(chains[0]?.id)}
              disabled={switchingNetwork}
            >
              {switchingNetwork && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              )}
              {switchingNetwork ? 'Switching to Gnosis..' : 'Switch to Gnosis'}
            </Button>
          </div>
        ) : sponsorHatValidating || witnessHatValidating ? (
          <div className='flex flex-row items-center justify-center'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <p className='ml-2 text-muted-foreground'>Validating hats</p>
          </div>
        ) : (
          <Tabs
            defaultValue='sponsor'
            value={tabValue}
            onValueChange={(value) => setTabValue(value)}
            className='w-full '
          >
            <TabsList className='w-full bg-slate-200 '>
              <TabsTrigger value='sponsor' className='font-semibold'>
                <PenSquare className='h-4 w-4 mr-2' /> <p>Sponsor</p>
              </TabsTrigger>
              <TabsTrigger value='witness' className='font-semibold'>
                <Stamp className='h-4 w-4 mr-2' /> <p>Verify</p>
              </TabsTrigger>
              <TabsTrigger value='poking' className='font-semibold'>
                <ConciergeBell className='h-4 w-4 mr-2' /> <p>Submit</p>
              </TabsTrigger>
              <TabsTrigger value='recipient' className='font-semibold'>
                <Gem className='h-4 w-4 mr-2' /> <p>Claim</p>
              </TabsTrigger>
            </TabsList>
            <TabsContent value='sponsor'>
              <ApolloProvider client={AREWEAVE_GRAPHQL_CLIENT}>
                <SponsorForm isSponsor={isSponsor} setTabValue={setTabValue} />
              </ApolloProvider>
            </TabsContent>

            <TabsContent className='h-full overflow-y-scroll' value='witness'>
              <ApolloProvider client={SUBGRAPH_GRAPHQL_CLIENT}>
                <WitnessForm isWitness={isWitness} />
              </ApolloProvider>
            </TabsContent>

            <TabsContent className='h-full overflow-y-scroll' value='poking'>
              <ApolloProvider client={SUBGRAPH_GRAPHQL_CLIENT}>
                <PokingForm />
              </ApolloProvider>
            </TabsContent>

            <TabsContent className='h-full overflow-y-scroll' value='recipient'>
              <ApolloProvider client={SUBGRAPH_GRAPHQL_CLIENT}>
                <RecipientForm />
              </ApolloProvider>
            </TabsContent>
          </Tabs>
        )}
      </div>

      <div className='flex flex-row min-w-full justify-between items-center pt-8 mt-auto'>
        <a
          href='https://silverdoor.ai'
          target='_blank'
          className='scroll-m-20 text-xs font-semibold tracking-tight transition-colors first:mt-0 cursor-pointer'
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
            Kyle
          </a>{' '}
          &{' '}
          <a
            href='https://twitter.com/saimano1996'
            target='_blank'
            className='cursor-pointer underline'
          >
            Saimano
          </a>
        </small>
      </div>
    </main>
  );
}
