'use client';

import { Loader2, ExternalLink, BookOpen } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';

import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { ImageOff } from 'lucide-react';
import { getAccountString } from '@/lib/helpers';

import { useQuery } from '@apollo/client';
import { GetSponsoredProposals } from '@/graphql/queries';
import { useState } from 'react';
import { useRedis } from '@/hooks/useRedis';
import {
  useSignTypedData,
  useWaitForTransaction,
  useContractWrite,
  useContractRead,
  useAccount
} from 'wagmi';

import axios from 'axios';

import { getTypes } from '@/lib/helpers';
import { SENESCHAL_CONTRACT_ADDRESS } from '@/config';
import SeneschalAbi from '../abis/Seneschal.json';

export function ProcessorForm({ isProcessor }) {
  const { address } = useAccount();

  const [decoded, setDecoded] = useState({});
  const [commitment, setCommitment] = useState('');
  const [txSuccess, setTxSuccess] = useState(false);
  const [proposals, setProposals] = useState([]);

  const { toast } = useToast();
  const { loading, refetch } = useQuery(GetSponsoredProposals, {
    onCompleted: (data) => setProposals(data.proposals),
    pollInterval: 270000
  });
  const { getMeta } = useRedis();

  const { signTypedData, isLoading: signaturePending } = useSignTypedData({
    onSuccess(signature) {
      write({
        args: [commitment, signature]
      });
    }
  });

  const { data: claimDelay } = useContractRead({
    address: SENESCHAL_CONTRACT_ADDRESS,
    abi: SeneschalAbi,
    functionName: 'claimDelay'
  });

  const {
    isLoading: writePending,
    write,
    data: writeData
  } = useContractWrite({
    address: SENESCHAL_CONTRACT_ADDRESS,
    abi: SeneschalAbi,
    functionName: 'process',
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
      setProposals(data.data.proposals);
    }
  });

  const decodeHash = async (proposal) => {
    let ipfsHash = await getMeta(proposal.id);
    if (ipfsHash) {
      let { data } = await axios.get(
        `https://seneschal-silverdoor.infura-ipfs.io/ipfs/${ipfsHash}`
      );

      setDecoded((prevDecoded) => ({
        ...prevDecoded,
        [proposal.id]: {
          meta: data,
          commitment: proposal.commitmentDetails
        }
      }));
    } else {
      setDecoded((prevDecoded) => ({
        ...prevDecoded,
        [proposal.id]: {
          meta: null,
          commitment: proposal.commitmentDetails
        }
      }));
    }
  };

  const handleProcess = async (_commitment) => {
    let commitmentArray = [
      Number(_commitment.eligibleHat),
      Number(_commitment.shares),
      Number(_commitment.loot),
      Number(_commitment.extraRewardAmount),
      Number(_commitment.timeFactor),
      Number(_commitment.sponsoredTime),
      Number(_commitment.expirationTime),
      _commitment.contextURL,
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
            let isEarly =
              Number(claimDelay) +
                Number(proposal.commitmentDetails.sponsoredTime) >
              Date.now() / 1000;
            let contextURL = proposal.commitmentDetails.contextURL;
            let proposalId = proposal.id;
            let proposalImage =
              decoded[proposalId]?.['meta']?.['proposalImage'];
            let loot = proposal.commitmentDetails.loot;
            let recipient = proposal.recipient;
            let sponsoredTime = new Date(
              Number(proposal.commitmentDetails.sponsoredTime * 1000)
            ).toDateString();
            let expiryTime = new Date(
              Number(proposal.commitmentDetails.expirationTime) * 1000
            ).toDateString();
            let proposalSummary =
              decoded[proposalId]?.['meta']?.['proposalSummary'];
            let commitmentDetails = proposal.commitmentDetails;

            return (
              <Card key={index}>
                <CardHeader>
                  <div
                    className='flex flex-row items-center cursor-pointer hover:underline mb-2'
                    onClick={() => window.open(contextURL, '_blank')}
                  >
                    <CardTitle className='mr-2'>{`SDS #${proposalId
                      .substring(proposalId.length - 4)
                      .toUpperCase()}`}</CardTitle>
                    <ExternalLink className='w-4 h-4' />
                  </div>

                  <Badge
                    variant='outline'
                    className={`w-fit rounded-sm text-white ${
                      isEarly ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                  >
                    {isEarly ? 'Too early to process' : 'Ready to process'}
                  </Badge>

                  <CardDescription>
                    <div className='relative'>
                      <div className='h-32 mt-4 flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg bg-white'>
                        {!(proposalId in decoded) && (
                          <Button
                            variant='outline'
                            disabled={!isProcessor}
                            className='right-0 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                            onClick={() => decodeHash(proposal)}
                          >
                            Decode Hash
                          </Button>
                        )}

                        {!(proposalId in decoded) ? null : proposalImage ? (
                          <img
                            id='preview_img'
                            className='h-32 w-full object-cover'
                            src={`https://seneschal-silverdoor.infura-ipfs.io/ipfs/${proposalImage}`}
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
                  <div className='grid grid-cols-2 '>
                    <div>
                      <div className='space-y-1'>
                        <p className='text-xs text-muted-foreground '>
                          Sponsored Time
                        </p>
                        <p className='text-sm font-medium '>{sponsoredTime}</p>
                      </div>
                    </div>

                    <div>
                      <div className='space-y-1'>
                        <p className='text-xs text-muted-foreground'>
                          Expires On
                        </p>
                        <p className='text-sm font-medium '>{expiryTime}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardFooter>
                  <AlertDialog
                    onOpenChange={async (e) => {
                      if (!e && txSuccess) {
                        setTxSuccess(false);
                        setDecoded({});
                      }
                    }}
                  >
                    <AlertDialogTrigger asChild>
                      <Button
                        className='w-full'
                        variant={isEarly ? 'outline' : 'default'}
                        disabled={!(proposalId in decoded) || isEarly}
                      >
                        <BookOpen className='mr-2 h-4 w-4' />
                        View Summary
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {`SDS #${proposalId
                            .substring(proposalId.length - 4)
                            .toUpperCase()}`}
                        </AlertDialogTitle>
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
                          {!txSuccess && decoded ? 'Cancel' : 'Close'}
                        </AlertDialogCancel>
                        {!txSuccess && decoded && (
                          <Button
                            disabled={
                              signaturePending || writePending || txPending
                            }
                            onClick={() => {
                              handleProcess(commitmentDetails);
                            }}
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
                              : 'Process'}
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
          <p className='ml-2 text-muted-foreground'>No proposals to process.</p>
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
