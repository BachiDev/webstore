'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Demo WebStore</h1>
        <p className="text-lg mb-8">This is a demo webstore with simulated payments. You can test the one-time payment functionality without signing in. To test the subscription functionality, you will need to sign in.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-8">
        <Link href="/one-time-payment">
          <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-gray-800 hover:bg-gray-700 cursor-pointer">
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">One-Time Payment</div>
              <p className="text-gray-400 text-base">
                Make a one-time purchase without signing in.
              </p>
            </div>
          </div>
        </Link>
        <Link href="/subscription">
          <div className="max-w-sm rounded-lg overflow-hidden shadow-lg bg-gray-800 hover:bg-gray-700 cursor-pointer">
            <div className="px-6 py-4">
              <div className="font-bold text-xl mb-2">Subscription</div>
              <p className="text-gray-400 text-base">
                Sign in to purchase a subscription.
              </p>
            </div>
          </div>
        </Link>
      </div>
    </main>
  );
}