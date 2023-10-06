import { NFTStorage } from 'nft.storage';
import { BigNumber } from 'ethers';

export const NFT_STORAGE = new NFTStorage({
  token: process.env.NEXT_PUBLIC_NFT_STORAGE_KEY
});

export const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

export const SPONSOR_HAT_ID = BigNumber.from(
  process.env.NEXT_PUBLIC_SPONSOR_HAT_ID
);

export const WITNESS_HAT_ID = BigNumber.from(
  process.env.NEXT_PUBLIC_WITNESS_HAT_ID
);

export const SENESCHAL_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_SENESCHAL_CONTRACT_ADDRESS;

export const HATS_PROTOCOL_CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_HATS_PROTOCOL_CONTRACT_ADDRESS;

export const IPFS_BASE_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY_BASE;

export const SENESCHAL_GRAPHQL_URI =
  process.env.NEXT_PUBLIC_SENESCHAL_GRAPHQL_URI;

export const EXPLORER_BASE_URL = 'https://gnosisscan.io';

export const AREWEAVE_GRAPHQL_URI = 'https://arweave.net/graphql';
