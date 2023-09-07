import { ethers } from 'ethers';
import { File } from 'nft.storage';

import { SENESCHAL_CONTRACT_ADDRESS, NFT_STORAGE } from '@/config';

// const digestMessage = async (proposalDigest) => {
//   const msgUint8 = new TextEncoder().encode(proposalDigest);
//   const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
//   const hashArray = Array.from(new Uint8Array(hashBuffer));
//   return hashArray;
// };

export const getAccountString = (account) => {
  const len = account.length;
  return `0x${account.substr(2, 3).toUpperCase()}...${account
    .substr(len - 3, len - 1)
    .toUpperCase()}`;
};

export const formatCommitment = (values) => {
  const CLAIM_DELAY = 270;

  const SHARES = 0;
  const ELIGIBLE_HAT = 0;
  const EXTRA_REWARD_AMOUNT = 0;
  const EXTRA_REWARD_TOKEN_ADDRESS = ethers.constants.AddressZero;
  const SPONSORED_TIME = 0;
  const TIME_FACTOR = Date.now() + 24 * 60 * 60 + CLAIM_DELAY;

  let loot = values.loot;
  let expirationTime = new Date(values.expirationDate).getTime();
  let contextURL = values.proposalUrl;
  let recipient = values.recipientWallet;

  let commitment = [
    ELIGIBLE_HAT,
    SHARES,
    Number(loot),
    EXTRA_REWARD_AMOUNT,
    TIME_FACTOR,
    SPONSORED_TIME,
    expirationTime,
    contextURL,
    recipient,
    EXTRA_REWARD_TOKEN_ADDRESS
  ];

  return commitment;
};

export const pinToIpfs = async (
  proposalImgData,
  contextURL,
  arweaveTx,
  summary
) => {
  let metadata = {
    proposalImage: '',
    contextURL: contextURL,
    arweaveTx: arweaveTx,
    proposalSummary: summary
  };

  const response = await fetch(proposalImgData);
  const blob = await response.blob();

  let imgBlob = new File([blob], 'file.png', { type: 'image/png' });

  let ipfsImgHash = await NFT_STORAGE.storeBlob(imgBlob);

  const proposalImageHash = `${ipfsImgHash}`;
  metadata['proposalImage'] = proposalImageHash;

  const objectString = JSON.stringify(metadata);
  const metadataBlob = new Blob([objectString], { type: 'application/json' });

  let result = await NFT_STORAGE.storeBlob(metadataBlob);

  return result;
};

export const getTypes = async (commitment) => {
  try {
    const domain = {
      name: 'Seneschal',
      version: '1.0',
      chainId: 100,
      verifyingContract: SENESCHAL_CONTRACT_ADDRESS
    };

    const types = {
      Commitment: [
        { name: 'eligibleHat', type: 'uint256' },
        { name: 'shares', type: 'uint256' },
        { name: 'loot', type: 'uint256' },
        { name: 'extraRewardAmount', type: 'uint256' },
        { name: 'timeFactor', type: 'uint256' },
        { name: 'sponsoredTime', type: 'uint256' },
        { name: 'expirationTime', type: 'uint256' },
        { name: 'contextURL', type: 'string' },
        { name: 'recipient', type: 'address' },
        { name: 'extraRewardToken', type: 'address' }
      ]
    };

    return {
      domain,
      types,
      values: {
        eligibleHat: commitment[0],
        shares: commitment[1],
        loot: commitment[2],
        extraRewardAmount: commitment[3],
        timeFactor: commitment[4],
        sponsoredTime: commitment[5],
        expirationTime: commitment[6],
        contextURL: commitment[7],
        recipient: commitment[8],
        extraRewardToken: commitment[9]
      }
    };
  } catch (err) {
    console.log(err);
  }
};
