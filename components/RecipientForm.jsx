'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { formatEther } from 'viem';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Loader2, ExternalLink, ImageOff, Gem } from 'lucide-react';
import { getAccountString } from '@/lib/helpers';

import { useQuery } from '@apollo/client';
import { GetProcessedProposals } from '@/graphql/queries';
import { useState } from 'react';

import {
  useSignTypedData,
  useWaitForTransaction,
  useContractWrite,
  useAccount
} from 'wagmi';

import axios from 'axios';

import { CountdownTimer } from './CountdownTimer';
import { getTypes } from '@/lib/helpers';
import { IPFS_BASE_GATEWAY, SENESCHAL_CONTRACT_ADDRESS } from '@/config';
import SeneschalAbi from '../abis/Seneschal.json';

export function RecipientForm() {
  const { address } = useAccount();
  const [commitment, setCommitment] = useState('');
  const [txSuccess, setTxSuccess] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const { refetch } = useQuery(GetProcessedProposals, {
    onCompleted: (data) => decodeHash(data.proposals)
  });

  const { signTypedData, isLoading: signaturePending } = useSignTypedData({
    onSuccess(signature) {
      write({
        args: [commitment, signature]
      });
    },
    onError(err) {
      console.log(err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Function call failed.'
      });
    }
  });

  const {
    isLoading: writePending,
    write,
    data: writeData
  } = useContractWrite({
    address: SENESCHAL_CONTRACT_ADDRESS,
    abi: SeneschalAbi,
    functionName: 'claim',
    onSuccess(data) {
      toast({
        title: 'Mining Transaction',
        description: 'Please do not close the tab.',
        action: (
          <ToastAction
            altText='View Tx'
            onClick={() =>
              window.open(`https://gnosisscan.io/tx/${data.hash}`, '_blank')
            }
          >
            View Tx
          </ToastAction>
        )
      });
    },
    onError(err) {
      console.log(err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Function call failed.'
      });
    }
  });

  const { isLoading: txPending } = useWaitForTransaction({
    hash: writeData?.hash,
    async onSuccess() {
      toast({
        title: 'Success',
        description: 'Proposal processed.'
      });
      setCommitment('');
      setTxSuccess(true);
      let data = await refetch();
      decodeHash(data.data.proposals);
    }
  });

  const decodeHash = async (_proposals) => {
    let formattedProposals = _proposals;

    for (let i = 0; i < formattedProposals.length; i++) {
      try {
        let { data } = await axios.get(
          `${IPFS_BASE_GATEWAY}/${formattedProposals[i].commitmentDetails.metadata}`
        );

        // Update the proposal object with the fetched metadata.
        formattedProposals[i].metadata = data;
      } catch (error) {
        console.log(error);
      }
    }
    setProposals(formattedProposals);
    setLoading(false);
  };

  const handleClaim = async (_commitment) => {
    let commitmentArray = [
      Number(_commitment.eligibleHat),
      Number(_commitment.shares),
      _commitment.loot,
      Number(_commitment.extraRewardAmount),
      Number(_commitment.timeFactor),
      Number(_commitment.sponsoredTime),
      Number(_commitment.expirationTime),
      _commitment.contextURL,
      _commitment.metadata,
      _commitment.recipient,
      _commitment.extraRewardToken
    ];

    setCommitment(commitmentArray);

    let { values, domain, types } = await getTypes(commitmentArray);

    signTypedData({
      domain,
      types,
      message: values,
      primaryType: 'Commitment'
    });
  };

  return (
    <div>
      {!loading && proposals.length > 0 && (
        <div className='grid grid-cols-3 gap-10 mt-12'>
          {proposals.map((proposal, index) => {
            let isExpired =
              Number(proposal.commitmentDetails.expirationTime) <
              Math.round(Date.now() / 1000);

            let contextURL = proposal.commitmentDetails.contextURL;
            let proposalId = proposal.id;
            let proposalImage = proposal.metadata.proposalImage;
            let loot = formatEther(proposal.commitmentDetails.loot);
            let recipient = proposal.recipient;
            let sponsoredTime = new Date(
              Number(proposal.commitmentDetails.sponsoredTime * 1000)
            ).toLocaleString();
            let processedTime = new Date(
              Number(proposal.processingDetails.blockTimestamp) * 1000
            ).toLocaleString();
            let expiryTime = new Date(
              Number(proposal.commitmentDetails.expirationTime) * 1000
            ).toLocaleString();
            let proposalTitle =
              proposal.metadata.proposalTitle ||
              `SDS #${proposalId
                .substring(proposalId.length - 4)
                .toUpperCase()}`;
            let proposalSummary = proposal.metadata.proposalSummary;
            let commitmentDetails = proposal.commitmentDetails;

            return (
              <Card key={index}>
                <CardHeader>
                  <div
                    className='flex flex-row items-center justify-between mb-2'
                    onClick={() => window.open(contextURL, '_blank')}
                  >
                    <div className='flex flex-row items-center cursor-pointer underline '>
                      <CardTitle className='mr-2'>{proposalTitle}</CardTitle>
                      <ExternalLink className='w-4 h-4' />
                    </div>

                    <CountdownTimer
                      timeFactor={Number(
                        proposal.commitmentDetails.expirationTime
                      )}
                      delay={0}
                    />
                  </div>

                  <CardDescription
                    onClick={() => window.open(contextURL, '_blank')}
                    className='hover:opacity-75 cursor-pointer'
                  >
                    <div className='relative'>
                      <div className='h-40 mt-4 flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg'>
                        {proposalImage ? (
                          <img
                            id='preview_img'
                            className='h-40 w-full object-cover'
                            src={`${IPFS_BASE_GATEWAY}/${proposalImage}`}
                          />
                        ) : (
                          <ImageOff className='h-16 w-16 ' />
                        )}
                      </div>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className='grid gap-4'>
                  <div className='grid grid-cols-2 '>
                    <div className='mb-4 grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0'>
                      <div className='space-y-1'>
                        <p className='text-xs text-muted-foreground '>
                          Loot Amount
                        </p>
                        <p className='text-sm font-medium '>{loot}</p>
                      </div>
                    </div>
                    <div className='mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0'>
                      <div className='space-y-1'>
                        <p className='text-xs text-muted-foreground '>
                          Recipient
                        </p>
                        <p
                          className='text-sm font-medium cursor-pointer underline hover:opacity-95'
                          onClick={() =>
                            window.open(
                              `https://gnosisscan.io/address/${recipient}`,
                              '_blank'
                            )
                          }
                        >
                          {address.toLowerCase() === recipient.toLowerCase()
                            ? 'You'
                            : getAccountString(proposal.recipient)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className='space-y-1'>
                      <p className='text-xs text-muted-foreground '>
                        Sponsored on
                      </p>
                      <p className='text-sm font-medium '>{sponsoredTime}</p>
                    </div>
                  </div>

                  <div>
                    <div className='space-y-1'>
                      <p className='text-xs text-muted-foreground'>
                        Processed on
                      </p>
                      <p className='text-sm font-medium '>{processedTime}</p>
                    </div>
                  </div>

                  <div>
                    <div className='space-y-1'>
                      <p className='text-xs text-muted-foreground'>
                        Cannot claim after
                      </p>
                      <p className='text-sm font-medium '>{expiryTime}</p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <AlertDialog
                    onOpenChange={(e) => {
                      if (!e && txSuccess) {
                        setTxSuccess(false);
                      }
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        className='w-full'
                        variant={isExpired ? 'outline' : 'default'}
                        disabled={
                          isExpired ||
                          address.toLowerCase() !== recipient.toLowerCase()
                        }
                      >
                        <Gem className='mr-2 h-4 w-4' />{' '}
                        {address.toLowerCase() !== recipient.toLowerCase()
                          ? 'Not a recipient'
                          : 'View Summary'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{proposalTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {proposalSummary
                            ? proposalSummary
                            : 'No proposal summary found.'}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          disabled={
                            signaturePending || writePending || txPending
                          }
                        >
                          {!txSuccess ? 'Cancel' : 'Close'}
                        </AlertDialogCancel>
                        {!txSuccess && (
                          <Button
                            disabled={
                              signaturePending || writePending || txPending
                            }
                            onClick={() => handleClaim(commitmentDetails)}
                          >
                            {(signaturePending ||
                              writePending ||
                              txPending) && (
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            )}

                            {signaturePending
                              ? 'Pending signature'
                              : writePending || txPending
                              ? 'Pending transaction'
                              : 'Claim'}
                          </Button>
                        )}
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && proposals.length == 0 && (
        <div className='h-96 flex flex-row items-center justify-center'>
          <p className='ml-2 text-muted-foreground'>No proposals to claim.</p>
        </div>
      )}

      {(loading || !proposals) && (
        <div className='h-96 flex flex-row items-center justify-center'>
          <Loader2 className='h-4 w-4 animate-spin' />
          <p className='ml-2 text-muted-foreground'>Fetching proposals..</p>
        </div>
      )}
    </div>
  );
}
