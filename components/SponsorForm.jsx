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
import {
  useContractWrite,
  useContractRead,
  useSignTypedData,
  useSignMessage
} from 'wagmi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ethers } from 'ethers';
import * as z from 'zod';

import { useProposal } from '@/hooks/useProposal';
import { uploadProposal } from '@/lib/helpers';
import { SENESCHAL_CONTRACT_ADDRESS } from '@/config';
import SeneschalAbi from '../abis/Seneschal.json';

const formSchema = z.object({
  loot: z.string().refine((val) => Number(val) > 0 && Number(val) < 100, {
    message: 'Must be between 1 & 99'
  }),
  proposalUrl: z.string().url(),
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
  // const [functionParams, setFunctionParams] = useState('');
  const [commitment, setCommitment] = useState('');
  const [commitmentDigest, setCommitmentDigest] = useState('');
  console.log(commitment);

  const {} = useContractRead({
    address: SENESCHAL_CONTRACT_ADDRESS,
    abi: SeneschalAbi,
    functionName: 'getDigest',
    enabled: commitment ? true : false,
    args: [commitment],
    onSuccess(data) {
      console.log('Digest', data);
      setCommitmentDigest(data);
    }
  });

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

  // const { signTypedData, isLoading: signaturePending } = useSignTypedData({
  //   domain: functionParams?.domain,
  //   message: functionParams?.commitmentTypedValues,
  //   types: functionParams?.types,
  //   primaryType: 'Commitment',
  //   onSuccess(signature) {
  //     write({
  //       args: [functionParams.commitment, signature]
  //     });
  //   }
  // });

  const { signMessage, isLoading: signaturePending } = useSignMessage({
    message: commitmentDigest,
    onSuccess(data) {
      console.log('signature', data);
      write({
        args: [commitment, data]
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
    console.log(
      values.proposalUrl.substring(values.proposalUrl.lastIndexOf('/') + 1)
    );
    getProposal(
      values.proposalUrl.substring(values.proposalUrl.lastIndexOf('/') + 1)
    );
  }

  const handleSponsor = async () => {
    let commitment = [
      0,
      0,
      Number(formData.loot),
      0,
      Date.now() + 1000,
      Date.now(),
      Date.now() + 10000,
      formData.proposalUrl.substring(formData.proposalUrl.lastIndexOf('/') + 1),
      formData.recipientWallet,
      ethers.constants.AddressZero
    ];
    setCommitment(commitment);

    // let { commitment, commitmentTypedValues, domain, types } =
    //   await uploadProposal(
    //     imgUrl,
    //     formData.proposalUrl.substring(
    //       formData.proposalUrl.lastIndexOf('/') + 1
    //     ),
    //     mirrorData.transactions.edges[0].node.id,
    //     proposalSummary,
    //     formData.loot,
    //     formData.recipientWallet
    //   );

    // setFunctionParams({ commitmentTypedValues, commitment, domain, types });
  };

  useEffect(() => {
    if (commitmentDigest) {
      toast({
        title: 'Ready',
        description: 'Commitment configured & available.'
      });
      signMessage();
    }
  }, [commitmentDigest]);

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
                    placeholder=''
                    min={1}
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
              name='proposalUrl'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='font-bold'>Proposal Url</FormLabel>
                  <FormControl>
                    <Input placeholder='' {...field} />
                  </FormControl>
                  <FormDescription>
                    The full url of the mirror article.
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
