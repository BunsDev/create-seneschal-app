import { useState } from 'react';
import { pinToIpfs } from '@/lib/helpers';

export const useIpfs = () => {
  const [ipfsUploading, setIpfsUploading] = useState(false);

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
    setIpfsUploading(false);
    return ipfsHash;
  };

  return {
    ipfsUploading,
    uploadToIpfs
  };
};
