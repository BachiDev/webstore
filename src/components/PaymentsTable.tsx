"use client";

import { Payment } from "@invertase/firestore-stripe-payments";
import { DataTable } from "./ui/DataTable";
import { Pill } from "./ui/Pill";
import { formatDate, formatPrice } from "@/lib/format";

interface PaymentsTableProps {
  payments: Payment[];
}

const PaymentsTable = ({ payments }: PaymentsTableProps) => {
  const rows = payments.filter((payment) => payment.amount && payment.created);
  return (
    <section aria-labelledby="payments-heading" className="mt-8 w-full">
      <h2 id="payments-heading" className="mb-4 text-xl font-bold text-zinc-100">
        Payments
      </h2>
      <DataTable
        caption="Payment history"
        rows={rows}
        columns={[
          {
            key: "date",
            header: "Date",
            render: (payment) => formatDate(payment.created),
          },
          {
            key: "amount",
            header: "Amount",
            render: (payment) => (
              <span className="font-mono">{formatPrice(payment.amount, payment.currency)}</span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (payment) => <Pill>{payment.status}</Pill>,
          },
        ]}
      />
    </section>
  );
};

export default PaymentsTable;
