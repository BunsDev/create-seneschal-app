import { ethers } from 'ethers';
import { SENESCHAL_CONTRACT_ADDRESS } from '@/config';

const digestMessage = async (proposalDigest) => {
  const msgUint8 = new TextEncoder().encode(proposalDigest);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray;
};

export const getAccountString = (account) => {
  const len = account.length;
  return `0x${account.substr(2, 3).toUpperCase()}...${account
    .substr(len - 3, len - 1)
    .toUpperCase()}`;
};

export const uploadProposal = async (
  proposalImgData,
  proposalUrl,
  arweaveTx,
  proposalSummary,
  loot,
  recipient
) => {
  try {
    // let metadata = {
    //   proposalImage: '',
    //   proposalDigest: proposalDigest,
    //   arweaveTx: arweaveTx,
    //   proposalSummary: proposalSummary
    // };

    // const response = await fetch(proposalImgData);
    // const blob = await response.blob();
    // let imgBlob = new File([blob], 'file.png', { type: 'image/png' });
    // let ipfsImgHash = await IPFS_CLIENT.add(imgBlob);

    // const proposalImageHash = `ipfs://${ipfsImgHash.path}`;
    // metadata['proposalImage'] = proposalImageHash;

    // const objectString = JSON.stringify(metadata);
    // const bufferedString = Buffer.from(objectString);
    // const result = await IPFS_CLIENT.add(bufferedString);

    // let digest = await digestMessage(proposalDigest);

    let commitment = [
      0,
      0,
      Number(loot),
      0,
      Date.now() + 1000,
      Date.now(),
      Date.now() + 10000,
      proposalUrl,
      recipient,
      ethers.constants.AddressZero
    ];

    let commitmentHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        [
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'uint256',
          'string',
          'address',
          'address'
        ],
        commitment
      )
    );
    console.log(commitmentHash);
    // return result.path;

    const domain = {
      name: 'Seneschal',
      version: '1',
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
      commitmentTypedValues: {
        eligibleHat: 0,
        shares: 0,
        loot: Number(loot),
        extraRewardAmount: 0,
        timeFactor: Date.now() + 1000,
        sponsoredTime: Date.now(),
        expirationTime: Date.now() + 10000,
        contextURL: proposalUrl,
        recipient: recipient,
        extraRewardToken: ethers.constants.AddressZero
      },
      commitment
    };
  } catch (err) {
    console.log(err);
  }
};

ethers.utils.defaultAbiCoder;
