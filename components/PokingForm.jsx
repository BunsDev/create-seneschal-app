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
import { ConciergeBell } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Loader2, ExternalLink, ImageOff } from 'lucide-react';
import { getAccountString } from '@/lib/helpers';

import { useQuery } from '@apollo/client';
import { GetSponsoredProposals } from '@/graphql/queries';
import { useState } from 'react';
import {
  useWaitForTransaction,
  useContractWrite,
  useContractRead,
  useAccount
} from 'wagmi';
import { formatEther, keccak256 } from 'viem';
import axios from 'axios';

import { CountdownTimer } from './CountdownTimer';
import { IPFS_BASE_GATEWAY, SENESCHAL_CONTRACT_ADDRESS } from '@/config';
import SeneschalAbi from '../abis/Seneschal.json';

export function PokingForm() {
  const { address } = useAccount();
  const [txSuccess, setTxSuccess] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  const { refetch } = useQuery(GetSponsoredProposals, {
    onCompleted: (data) => decodeHash(data.proposals)
    // pollInterval: 270000
  });

  const { data: claimDelay } = useContractRead({
    address: SENESCHAL_CONTRACT_ADDRESS,
    abi: SeneschalAbi,
    functionName: 'getClaimDelay'
  });

  const {
    isLoading: writePending,
    write,
    data: writeData
  } = useContractWrite({
    address: SENESCHAL_CONTRACT_ADDRESS,
    abi: SeneschalAbi,
    functionName: 'poke',
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
        description: 'Proposal poked.'
      });
      setTxSuccess(true);
      let data = await refetch();
      decodeHash(data.data.proposals);
    }
  });

  const decodeHash = async (_proposals) => {
    let formattedProposals = _proposals.filter(
      (p) => p.status === 'Sponsored' && p.status !== 'Poked'
    );

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

  const handlePoke = async (_commitment) => {
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

    write({
      args: [commitmentArray, keccak256(_commitment.metadata)]
    });
  };

  return (
    <div>
      {!loading && proposals.length > 0 && (
        <div className='grid grid-cols-3 gap-10 mt-12'>
          {proposals.map((proposal, index) => {
            let isEarly =
              Number(claimDelay) +
                Number(proposal.commitmentDetails.sponsoredTime) >
              Date.now() / 1000;

            let contextURL = proposal.commitmentDetails.contextURL;
            let proposalId = proposal.id;
            let proposalImage = proposal.metadata.proposalImage;
            let loot = formatEther(proposal.commitmentDetails.loot);
            let recipient = proposal.recipient;
            let sponsoredTime = new Date(
              Number(proposal.commitmentDetails.sponsoredTime * 1000)
            ).toLocaleString();
            let timeFactor = new Date(
              Number(proposal.commitmentDetails.timeFactor) * 1000
            ).toLocaleString();

            let proposalSummary = proposal.metadata.proposalSummary;
            let proposalTitle =
              proposal.metadata.proposalTitle ||
              `SDS #${proposalId
                .substring(proposalId.length - 4)
                .toUpperCase()}`;
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
                      timeFactor={Number(proposal.commitmentDetails.timeFactor)}
                      delay={
                        Number(claimDelay) +
                        Number(proposal.commitmentDetails.sponsoredTime)
                      }
                    />
                  </div>

                  <CardDescription>
                    <div className='relative'>
                      <div className='h-32 mt-4 flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg bg-white'>
                        {proposalImage ? (
                          <img
                            id='preview_img'
                            className='h-32 w-full object-cover'
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
                            : getAccountString(recipient)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='grid grid-cols-1 '>
                    <div>
                      <div className='space-y-1'>
                        <p className='text-xs text-muted-foreground '>
                          Sponsored Time
                        </p>
                        <p className='text-xs font-medium '>{sponsoredTime}</p>
                      </div>
                    </div>

                    <div className='mt-4'>
                      <div className='space-y-1'>
                        <p className='text-xs text-muted-foreground'>
                          Cannot be processed after
                        </p>
                        <p className='text-xs font-medium '>{timeFactor}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <AlertDialog
                    onOpenChange={async (e) => {
                      if (!e && txSuccess) {
                        setTxSuccess(false);
                      }
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        className='w-full'
                        variant={
                          isEarly ||
                          address.toLowerCase() !== recipient.toLowerCase()
                            ? 'outline'
                            : 'default'
                        }
                        disabled={
                          isEarly ||
                          address.toLowerCase() !== recipient.toLowerCase()
                        }
                      >
                        <ConciergeBell className='mr-2 h-4 w-4' />
                        {address.toLowerCase() !== recipient.toLowerCase()
                          ? 'Cannot Poke'
                          : 'Poke'}
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
                        <AlertDialogCancel disabled={writePending || txPending}>
                          {!txSuccess ? 'Cancel' : 'Close'}
                        </AlertDialogCancel>
                        {!txSuccess && (
                          <Button
                            disabled={writePending || txPending}
                            onClick={() => {
                              handlePoke(commitmentDetails);
                            }}
                          >
                            {(writePending || txPending) && (
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            )}

                            {writePending || txPending
                              ? 'Pending transaction'
                              : 'Poke'}
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
          <p className='ml-2 text-muted-foreground'>No proposals to poke.</p>
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
