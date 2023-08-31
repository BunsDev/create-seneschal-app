'use client';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Image, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { useChat } from 'ai/react';
import { useToast } from '@/components/ui/use-toast';

import { isAddress } from 'viem';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Arweave from 'arweave';

import { GetMirrorTransactions } from '@/graphql/queries';

const formSchema = z.object({
  loot: z.string().refine((val) => Number(val) > 0 && Number(val) < 100, {
    message: 'Must be between 1 & 99'
  }),
  proposalDigest: z.string(),
  recipientWallet: z.string().refine((value) => isAddress(value), {
    message: 'Not a valid ethereum address.'
  })
});

export function SponsorForm() {
  const [imgUrl, setImgUrl] = useState('');
  const [aiProposalSummary, setAiProposalSummary] = useState('');

  const { toast } = useToast();
  const { messages, append, isLoading } = useChat({
    onFinish: (msg) => {
      setAiProposalSummary(msg.content);
    }
  });

  const form = useForm({
    resolver: zodResolver(formSchema)
  });

  const [getMirrorTx, { loading, error, data }] = useLazyQuery(
    GetMirrorTransactions
  );

  const getArweaveContent = async () => {
    if (data.transactions.edges.length) {
      const arweave = Arweave.init({});
      let res = await arweave.transactions.getData(
        data.transactions.edges[0].node.id,
        { decode: true, string: true }
      );
      res = JSON.parse(res);
      if (res.content) {
        append({
          content: `You are good at writing project proposals. Based on the context below, summarize the proposal strictly in not more than 100 words. \nContext:\n${res.content.body}`,
          role: 'user',
          createdAt: new Date()
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Mirror Digest',
        description: 'Are you sure the proposal digest is valid?'
      });
    }
  };

  function onSubmit(values) {
    if (aiProposalSummary) {
    } else {
      getMirrorTx({
        variables: { digest: values.proposalDigest }
      });
    }
  }

  useEffect(() => {
    if (data) {
      getArweaveContent();
    }
  }, [data]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 mt-12'>
        <div className='grid grid-cols-2 gap-5'>
          <FormField
            control={form.control}
            name='loot'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-bold'>Loot</FormLabel>
                <FormControl>
                  <Input
                    placeholder='1'
                    type='number'
                    inputMode='decimal'
                    {...field}
                  />
                </FormControl>
                <FormDescription>Amount of loot to reward.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='recipientWallet'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-bold'>Recipient</FormLabel>
                <FormControl>
                  <Input placeholder='0x..' type='string' {...field} />
                </FormControl>
                <FormDescription>
                  Wallet address of the recipient
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-2 gap-5'>
          <div className='flex flex-col'>
            <FormField
              control={form.control}
              name='proposalDigest'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-bold'>Proposal Digest</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormDescription>
                    Content digest hash of the proposal's mirror article.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='proposalImage'
              render={({ field }) => (
                <FormItem className='mt-4'>
                  <FormLabel className='font-bold'>Proposal Image</FormLabel>
                  <FormControl className=''>
                    <div className='grid grid-cols-2 gap-5 w-full'>
                      <label
                        htmlFor='dropzone-file'
                        className='flex flex-col items-center justify-center h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600'
                      >
                        <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                          <svg
                            className='w-8 h-8 mb-4 text-gray-500 dark:text-gray-400'
                            aria-hidden='true'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 20 16'
                          >
                            <path
                              stroke='currentColor'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth='2'
                              d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
                            />
                          </svg>
                          <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                            <span className='font-semibold'>
                              Click to upload
                            </span>{' '}
                            or drag and drop
                          </p>
                          <p className='text-xs text-gray-500 dark:text-gray-400'>
                            PNG or JPEG
                          </p>
                        </div>
                        <Input
                          id='dropzone-file'
                          type='file'
                          accept='image/png, image/jpeg'
                          className='hidden'
                          onChange={(e) => {
                            setImgUrl(URL.createObjectURL(e.target.files[0]));
                          }}
                        />
                      </label>
                      <div className='h-32 flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600'>
                        {imgUrl ? (
                          <img
                            id='preview_img'
                            className='h-full w-full object-cover'
                            src={imgUrl}
                          />
                        ) : (
                          <Image className='h-16 w-16 ' />
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>Image to use in metadata.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormItem>
            <FormLabel className='font-bold'>Proposal Description</FormLabel>
            <FormControl>
              <Textarea
                className='h-full'
                disabled
                value={
                  messages.length > 1
                    ? messages[messages.length - 1].content
                    : 'A short summary of the proposal will be ai generated based on the proposal digest contents.'
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>

        {aiProposalSummary ? (
          <Button disabled={isLoading || loading}>
            {(isLoading || loading) && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            {isLoading || loading ? 'Writing..' : 'Sponsor'}
          </Button>
        ) : (
          <Button type='submit' disabled={isLoading || loading}>
            {(isLoading || loading) && (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            )}
            {isLoading || loading ? 'Writing..' : 'Generate Proposal'}
          </Button>
        )}
      </form>
    </Form>
  );
}
