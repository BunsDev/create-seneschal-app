import { useState } from 'react';
import { pinToIpfs } from '@/lib/helpers';

export const useIpfs = () => {
  const [ipfsUploading, setIpfsUploading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState('');

  const uploadToIpfs = async (
    imgUrl,
    contextURL,
    arweaveTx,
    proposalSummary
  ) => {
    setIpfsUploading(true);
    let ipfsHash = await pinToIpfs(
      imgUrl,
      contextURL,
      arweaveTx,
      proposalSummary
    );
    setIpfsHash(ipfsHash);
    setIpfsUploading(false);
  };

  return {
    ipfsUploading,
    uploadToIpfs,
    ipfsHash
  };
};
