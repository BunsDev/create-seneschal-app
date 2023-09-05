import { useEffect, useState } from 'react';
import { GetMirrorTransactions } from '@/graphql/queries';
import { useChat } from 'ai/react';
import { useLazyQuery } from '@apollo/client';
import { useToast } from '@/components/ui/use-toast';

export const useProposal = () => {
  const { toast } = useToast();
  const [proposalSummary, setProposalSummary] = useState('');
  const [arweaveTx, setArweaveTx] = useState('');
  const [writing, setWriting] = useState('');

  const [getMirrorTx, { data: mirrorData }] = useLazyQuery(
    GetMirrorTransactions
  );

  const {
    messages: gptMessages,
    append,
    setMessages
  } = useChat({
    onFinish: (msg) => {
      setProposalSummary(msg.content);
      setWriting(false);
    }
  });

  const generateSummary = async (_fullProposal) => {
    setMessages([]);
    append({
      content: `You are good at writing project proposals. Based on the context below, summarize the proposal strictly in not more than 100 words. \nContext:\n${_fullProposal}`,
      role: 'user',
      createdAt: new Date()
    });
  };

  const getArweaveContent = async () => {
    let res = await fetch(
      `https://arweave.net/${mirrorData.transactions.edges[0].node.id}`
    );
    res = await res.json();
    if (res.content) {
      generateSummary(res.content.body);
    }
  };

  const getProposalSummary = async (digest) => {
    setWriting(true);
    getMirrorTx({
      variables: { digest: digest }
    });
  };

  useEffect(() => {
    if (mirrorData?.transactions.edges.length) {
      setArweaveTx(mirrorData.transactions.edges[0].node.id);
      getArweaveContent();
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid Mirror Digest',
        description: 'Are you sure the proposal digest is valid?'
      });
      setProposalSummary('');
      setWriting(false);
    }
  }, [mirrorData]);

  return {
    getProposalSummary,
    gptMessages,
    writing,
    proposalSummary,
    setProposalSummary,
    arweaveTx
  };
};
