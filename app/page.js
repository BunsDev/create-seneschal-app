'use client';

import { ApolloProvider } from '@apollo/client';
import { Web3Button } from '@web3modal/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useAccount, useContractRead } from 'wagmi';

import { Wallet, Loader2 } from 'lucide-react';

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

export default function Home() {
  const { address } = useAccount();

  const { data: isSponsor, isLoading: sponsorHatValidating } = useContractRead({
    address: HATS_PROTOCOL_CONTRACT_ADDRESS,
    abi: HatsAbi,
    functionName: 'isWearerOfHat',
    args: [address, SPONSOR_HAT_ID],
    enabled: address
  });

  const { data: isProcessor, isLoading: processorHatValidating } =
    useContractRead({
      address: HATS_PROTOCOL_CONTRACT_ADDRESS,
      abi: HatsAbi,
      functionName: 'isWearerOfHat',
      args: [address, PROCESSOR_HAT_ID],
      enabled: address
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
      ) : sponsorHatValidating || processorHatValidating ? (
        <div className='flex flex-row items-center justify-center'>
          <Loader2 className='h-4 w-4 animate-spin' />
          <p className='ml-2 text-muted-foreground'>Validating hats</p>
        </div>
      ) : (
        <Tabs defaultValue='sponsor' className='w-full'>
          <TabsList className='w-full'>
            <TabsTrigger value='sponsor'>For Sponsor</TabsTrigger>
            <TabsTrigger value='processor'>For Processor</TabsTrigger>
            <TabsTrigger value='recipient'>For Recipients</TabsTrigger>
          </TabsList>
          <TabsContent value='sponsor'>
            <ApolloProvider client={AREWEAVE_GRAPHQL_CLIENT}>
              <SponsorForm />
            </ApolloProvider>
          </TabsContent>

          <TabsContent value='processor'>
            <ApolloProvider client={SUBGRAPH_GRAPHQL_CLIENT}>
              <ProcessorForm />
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
