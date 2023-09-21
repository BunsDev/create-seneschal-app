'use client';

import { ApolloProvider } from '@apollo/client';
import { Web3Button } from '@web3modal/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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

import { SponsorForm } from '@/components/SponsorForm';
import { ProcessorForm } from '@/components/ProcessorForm';
import { RecipientForm } from '@/components/RecipientForm';

import {
  AREWEAVE_GRAPHQL_CLIENT,
  SUBGRAPH_GRAPHQL_CLIENT
} from '@/graphql/config';

import {
  HATS_PROTOCOL_CONTRACT_ADDRESS,
  SPONSOR_HAT_ID,
  PROCESSOR_HAT_ID
} from '@/config';
import HatsAbi from '../abis/Hats.json';
import { PokingForm } from '@/components/PokingForm';

export default function Home() {
  const { address } = useAccount();
  const { chain } = useNetwork();

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

  const { data: isProcessor, isLoading: processorHatValidating } =
    useContractRead({
      address: HATS_PROTOCOL_CONTRACT_ADDRESS,
      abi: HatsAbi,
      functionName: 'isWearerOfHat',
      args: [address, PROCESSOR_HAT_ID],
      enabled: address && chain?.id == chains[0]?.id
    });

  return (
    <main className='flex min-h-screen max-w-7xl flex-col items-center p-24 mx-auto'>
      <div className='flex flex-row min-w-full justify-between items-center mb-10'>
        <h2 className='scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0'>
          The Seneschal
        </h2>
        <Web3Button />
      </div>

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
      ) : sponsorHatValidating || processorHatValidating ? (
        <div className='flex flex-row items-center justify-center'>
          <Loader2 className='h-4 w-4 animate-spin' />
          <p className='ml-2 text-muted-foreground'>Validating hats</p>
        </div>
      ) : (
        <Tabs defaultValue='sponsor' className='w-full'>
          <TabsList className='w-full bg-slate-200 '>
            <TabsTrigger value='sponsor' className='font-semibold'>
              <PenSquare className='h-4 w-4 mr-2' /> <p>For Sponsoring</p>
            </TabsTrigger>
            <TabsTrigger value='processor' className='font-semibold'>
              <Stamp className='h-4 w-4 mr-2' /> <p>For Processing</p>
            </TabsTrigger>
            <TabsTrigger value='poking' className='font-semibold'>
              <ConciergeBell className='h-4 w-4 mr-2' /> <p>For Poking</p>
            </TabsTrigger>
            <TabsTrigger value='recipient' className='font-semibold'>
              <Gem className='h-4 w-4 mr-2' /> <p>For Claiming</p>
            </TabsTrigger>
          </TabsList>
          <TabsContent value='sponsor'>
            <ApolloProvider client={AREWEAVE_GRAPHQL_CLIENT}>
              <SponsorForm isSponsor={isSponsor} />
            </ApolloProvider>
          </TabsContent>

          <TabsContent value='processor'>
            <ApolloProvider client={SUBGRAPH_GRAPHQL_CLIENT}>
              <ProcessorForm isProcessor={isProcessor} />
            </ApolloProvider>
          </TabsContent>

          <TabsContent value='poking'>
            <ApolloProvider client={SUBGRAPH_GRAPHQL_CLIENT}>
              <PokingForm />
            </ApolloProvider>
          </TabsContent>

          <TabsContent value='recipient'>
            <ApolloProvider client={SUBGRAPH_GRAPHQL_CLIENT}>
              <RecipientForm />
            </ApolloProvider>
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}
