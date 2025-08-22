'use client';

import Link from 'next/link';
import { useUser } from '../lib/UserContext';

export default function Home() {
  const { user } = useUser();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-black">Welcome to the Demo WebStore</h1>
        <p className="text-lg mb-8 text-black">This is a demo webstore with secure simulated Stripe payments.</p>
        {user ? (
          <p className="text-lg mb-8 text-black">You are automatically signed in as Guest. You can <Link href="/profile" className="text-blue-500 hover:underline">register on your profile</Link> to save your data.</p>
        ) : (
          <p className="text-lg mb-8 text-black">You need to be <Link href="/auth" className="text-blue-500 hover:underline">logged in</Link> (as Guest) to purchase subscriptions. </p> 
        )}
        <p className="text-lg mb-8 text-black">Here&apos;s what you can do:</p>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        <Link href="/store">
         <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-neutral-900 hover:bg-neutral-700 cursor-pointer text-center">
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">One-Time Payments</div>
              <p className="text-gray-400 text-base">
                Make a purchase in the store.
              </p>
            </div>
          </div>
        </Link>
        {user && (
          <Link href="/subscription">
            <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-neutral-900 hover:bg-neutral-700 cursor-pointer text-center"> 
              <div className="px-6 py-4">
                <div className="font-bold text-xl mb-2">Recurring Payments</div>
                <p className="text-gray-400 text-base">
                  Purchase a subscription.
                </p>
              </div>
            </div>
          </Link>
        )}
      </div>
    </main>
  );
}
