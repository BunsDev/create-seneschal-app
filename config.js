import { create } from 'ipfs-http-client';

export const IPFS_CLIENT = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: `Basic ${Buffer.from(
      process.env.NEXT_PUBLIC_INFURA_IPFS_ID +
        ':' +
        process.env.NEXT_PUBLIC_INFURA_IPFS_SECRET
    ).toString('base64')}`
  }
});

export const SPONSOR_HAT_ID =
  '2129836198081039874080204730616846462554960655064671634402151046840320';
export const PROCESSOR_HAT_ID =
  '2129836609457179204381715269359142101892586900748638042797116883992576';

export const SENESCHAL_CONTRACT_ADDRESS =
  '0x9B5BB2fB9FE18C7Fde0abF55E92F28cf63a57564';
