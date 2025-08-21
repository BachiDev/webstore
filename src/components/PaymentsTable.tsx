
'use client';

import { Payment } from '@invertase/firestore-stripe-payments';

interface PaymentsTableProps {
  payments: Payment[];
}

const PaymentsTable = ({ payments }: PaymentsTableProps) => {
  return (
    <div className="mt-8 text-black">
      <h2 className="text-xl font-bold mb-4">Payments</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 border">Date</th>
            <th className="p-2 border">Amount</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(payment => (
            <tr key={payment.id}>
              <td className="p-2 border">{new Date(payment.created).toLocaleDateString()}</td>
              <td className="p-2 border">{(payment.amount / 100).toFixed(2)} {payment.currency.toUpperCase()}</td>
              <td className="p-2 border">{payment.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PaymentsTable;
