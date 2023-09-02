'use client';

import { useEffect, useState } from 'react';

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
import { useToast } from '@/components/ui/use-toast';

import { Image, Loader2, RotateCcw } from 'lucide-react';

import { isAddress } from 'viem';
import { useContractWrite, useSignTypedData } from 'wagmi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useProposal } from '@/hooks/useProposal';
import { uploadProposal } from '@/lib/helpers';
import { SENESCHAL_CONTRACT_ADDRESS } from '@/config';
import SeneschalAbi from '../abis/Seneschal.json';

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
  const { toast } = useToast();
  const { getProposal, gptMessages, writing, proposalSummary, mirrorData } =
    useProposal();

  const [imgUrl, setImgUrl] = useState('');
  const [formData, setFormData] = useState('');
  const [functionParams, setFunctionParams] = useState('');

  const {
    data,
    isLoading: writePending,
    isSuccess,
    write
  } = useContractWrite({
    address: SENESCHAL_CONTRACT_ADDRESS,
    abi: SeneschalAbi,
    functionName: 'sponsor',
    onError(err) {
      console.log(err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Function call failed.'
      });
    }
  });

  const { signTypedData, isLoading: signaturePending } = useSignTypedData({
    domain: functionParams?.domain,
    message: functionParams?.commitmentTypedValues,
    types: functionParams?.types,
    primaryType: 'Commitment',
    onSuccess(signature) {
      write({
        args: [functionParams.commitment, signature]
      });
    }
  });

  const form = useForm({
    resolver: zodResolver(formSchema)
  });

  function onSubmit(values) {
    if (!imgUrl) {
      return toast({
        variant: 'destructive',
        title: 'Missing Input',
        description: 'Proposal image is required.'
      });
    }
    setFormData(values);
    getProposal(values.proposalDigest);
  }

  const handleSponsor = async () => {
    let { commitment, commitmentTypedValues, domain, types } =
      await uploadProposal(
        imgUrl,
        formData.proposalDigest,
        mirrorData.transactions.edges[0].node.id,
        proposalSummary,
        formData.loot,
        formData.recipientWallet
      );

    setFunctionParams({ commitmentTypedValues, commitment, domain, types });
  };

  useEffect(() => {
    if (functionParams) {
      toast({
        title: 'Ready',
        description: 'Commitment configured & available.'
      });
      signTypedData();
    }
  }, [functionParams]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          !proposalSummary ? onSubmit : handleSponsor
        )}
        className='space-y-8 mt-12'
      >
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
                <FormItem className='mt-4 cursor-pointer'>
                  <FormLabel className='font-bold'>Proposal Image</FormLabel>
                  <FormControl>
                    <Input
                      className='cursor-pointer hover:bg-gray-100'
                      id='image-input'
                      type='file'
                      accept='image/png, image/jpeg'
                      {...field}
                      onChange={(e) => {
                        setImgUrl(
                          e.target.files.length
                            ? URL.createObjectURL(e.target.files[0])
                            : ''
                        );
                      }}
                    />
                  </FormControl>
                  <FormDescription>Image to use in metadata.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='h-32 mt-4 flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg bg-gray-50   '>
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

          <FormItem>
            <div className='w-full flex flex-row justify-between'>
              <FormLabel className='font-bold'>Proposal Summary </FormLabel>
              <Button
                className='h-4 w-4'
                variant='outline'
                size='icon'
                disabled={writing || !formData}
                onClick={() => getProposal(formData.proposalDigest)}
              >
                <RotateCcw />
              </Button>
            </div>

            <FormControl>
              <Textarea
                className='h-full'
                disabled
                value={
                  gptMessages.length > 1
                    ? gptMessages[gptMessages.length - 1].content
                    : 'A short summary of the proposal will be ai generated based on the proposal digest contents.'
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>

        <Button
          type='submit'
          disabled={writing || signaturePending || writePending}
          variant='outline'
        >
          {(writing || signaturePending || writePending) && (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          )}
          {writing || signaturePending || writePending
            ? 'Please wait..'
            : !proposalSummary
            ? 'Confirm Proposal'
            : 'Sponsor'}
        </Button>
      </form>
    </Form>
  );
}
