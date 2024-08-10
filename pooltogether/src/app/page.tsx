"use client";

import React from 'react';
import ConnectWallet from '../components/ConnectWallet';
import { Button } from '../components/ui/button';
import { PoolTable } from '@/components/PoolTable';
import { PoolPage } from '@/components/PoolPage';
import Link from 'next/link';

const HomePage: React.FC = () => {

  return (
    <div className="min-h-screen bg-purple-900 p-4 text-white">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pool</h1>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="#" className="hover:underline">Prizes</a></li>
            <li><a href="#" className="hover:underline">Vaults</a></li>
            <li><a href="#" className="hover:underline">Account</a></li>
            <li><Link href='/winners' className="hover:underline">Winners</Link></li>
          </ul>
        </nav>
        <ConnectWallet />
      </header>
      <main className="">
        <h2 className="text-3xl font-bold">Deposit to win up to $68,849</h2>
        <p>You can withdraw your full deposit at any time</p>
        <PoolPage />
        <PoolTable />
      </main>
    </div>
  );
};

export default HomePage;