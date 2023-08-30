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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

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
  const form = useForm({
    resolver: zodResolver(formSchema)
  });

  function onSubmit(values) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8 mt-12'>
        <FormField
          control={form.control}
          name='proposal'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposal Description</FormLabel>
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
          name='proposalImage'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposal Image</FormLabel>
              <FormControl>
                <Input
                  id='picture'
                  type='file'
                  accept='image/png, image/jpeg'
                />
              </FormControl>
              <FormDescription>Image to use in metadata.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='loot'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loot</FormLabel>
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
          name='mirrorUrl'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposal URL</FormLabel>
              <FormControl>
                <Input placeholder='https://' type='url' {...field} />
              </FormControl>
              <FormDescription>The mirror url of the proposal.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='recipientWallet'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient</FormLabel>
              <FormControl>
                <Input placeholder='0x..' type='string' {...field} />
              </FormControl>
              <FormDescription>Wallet address of the recipient</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit'>Sponsor</Button>
      </form>
    </Form>
  );
}
