'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import {
  EthereumClient,
  w3mConnectors,
  w3mProvider
} from '@web3modal/ethereum';
import { Toaster } from '@/components/ui/toaster';
import { Web3Modal } from '@web3modal/react';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import { gnosis } from 'wagmi/chains';
import { WALLETCONNECT_PROJECT_ID } from '@/config';

const chains = [gnosis];
const projectId = WALLETCONNECT_PROJECT_ID;

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })]);
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
});

const ethereumClient = new EthereumClient(wagmiConfig, chains);

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <WagmiConfig config={wagmiConfig}>
          <div className='hidden lg:block'>{children}</div>
          <div className='flex lg:hidden min-h-screen flex-col justify-center'>
            <p className='text-sm opacity-50 px-24 py-12 text-center'>
              Seneschal is not yet available for smaller screen sizes.
            </p>
          </div>
          <Toaster />
        </WagmiConfig>
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      </body>
    </html>
  );
}
