'use client';

import { Web3Button } from '@web3modal/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { SponsorForm } from '@/components/SponsorForm';
import { ProcessorForm } from '@/components/ProcessorForm';
import { RecipientForm } from '@/components/RecipientForm';

export default function Home() {
  return (
    <main className='flex min-h-screen max-w-7xl flex-col items-center p-24 mx-auto'>
      <div className='flex flex-row min-w-full justify-between items-center mb-10'>
        <h2 className='scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0'>
          The Seneschal
        </h2>
        <Web3Button />
      </div>
      <Tabs defaultValue='sponsor' className='w-full'>
        <TabsList className='w-full'>
          <TabsTrigger value='sponsor'>For Sponsor</TabsTrigger>
          <TabsTrigger value='processor'>For Processor</TabsTrigger>
          <TabsTrigger value='recipient'>For Recipients</TabsTrigger>
        </TabsList>
        <TabsContent value='sponsor'>
          <SponsorForm />
        </TabsContent>
        <TabsContent value='processor'>
          <ProcessorForm />
        </TabsContent>
        <TabsContent value='recipient'>
          <RecipientForm />
        </TabsContent>
      </Tabs>
    </main>
  );
}
