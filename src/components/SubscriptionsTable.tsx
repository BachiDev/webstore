'use client';

import { Subscription } from '@invertase/firestore-stripe-payments';

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
}

const SubscriptionsTable = ({ subscriptions }: SubscriptionsTableProps) => {
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Active Subscriptions</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border">Role</th>
            <th className="p-2 border">Current Period End</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map(subscription => (
            <tr key={subscription.id}>
              <td className="p-2 border">{subscription.role}</td>
              <td className="p-2 border">{new Date(subscription.current_period_end).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubscriptionsTable;
