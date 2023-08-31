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
import { Image } from 'lucide-react';
import { useState } from 'react';

import { isAddress } from 'viem';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  proposal: z
    .string()
    .min(10, {
      message: 'Proposal must be at least 10 characters.'
    })
    .max(160, {
      message: 'Proposal must not be longer than 30 characters.'
    }),
  loot: z
    .number()
    .min(1, {
      message: 'Loot must be atleast 1.'
    })
    .max(100, {
      message: 'Loot cannot be more than 100.'
    }),
  mirrorUrl: z.string().url({ message: 'Need to be a valid URL.' }),
  recipientWallet: z.string().refine((value) => isAddress(value), {
    message: 'Not a valid ethereum address.'
  })
});

export function SponsorForm() {
  const [imgUrl, setImgUrl] = useState('');

  const form = useForm({
    resolver: zodResolver(formSchema)
  });

  function onSubmit(values) {
    console.log(values);
  }

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
                  <Input placeholder='1' type='number' {...field} />
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
          <FormField
            control={form.control}
            name='proposalImage'
            render={({ field }) => (
              <FormItem>
                <FormLabel className='font-bold'>Proposal Image</FormLabel>
                <FormControl className='border rounded-lg'>
                  <div class='grid grid-cols-2 gap-5 w-full'>
                    <label
                      for='dropzone-file'
                      class='flex flex-col items-center justify-center h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600'
                    >
                      <div class='flex flex-col items-center justify-center pt-5 pb-6'>
                        <svg
                          class='w-8 h-8 mb-4 text-gray-500 dark:text-gray-400'
                          aria-hidden='true'
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 20 16'
                        >
                          <path
                            stroke='currentColor'
                            stroke-linecap='round'
                            stroke-linejoin='round'
                            stroke-width='2'
                            d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
                          />
                        </svg>
                        <p class='mb-2 text-sm text-gray-500 dark:text-gray-400'>
                          <span class='font-semibold'>Click to upload</span> or
                          drag and drop
                        </p>
                        <p class='text-xs text-gray-500 dark:text-gray-400'>
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
                    <div class='h-64  flex flex-col items-center justify-center  border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600'>
                      {imgUrl ? (
                        <img
                          id='preview_img'
                          class='h-full w-full object-cover'
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
          <div className='flex flex-col'>
            <FormField
              control={form.control}
              name='proposal'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-bold'>
                    Proposal Description
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder='Tell us a little bit about the proposal'
                      className='resize-none'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='mirrorUrl'
              render={({ field }) => (
                <FormItem className='mt-4'>
                  <FormLabel className='font-bold'>Proposal URL</FormLabel>
                  <FormControl>
                    <Input placeholder='https://' type='url' {...field} />
                  </FormControl>
                  <FormDescription>
                    The mirror url of the proposal.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type='submit'>Sponsor</Button>
      </form>
    </Form>
  );
}
