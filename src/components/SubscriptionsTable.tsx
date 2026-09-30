"use client";

import { Subscription } from "@invertase/firestore-stripe-payments";
import { DataTable } from "./ui/DataTable";
import { Pill } from "./ui/Pill";
import { formatDate } from "@/lib/format";

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
}

const SubscriptionsTable = ({ subscriptions }: SubscriptionsTableProps) => {
  return (
    <section aria-labelledby="subscriptions-heading" className="mt-8 w-full">
      <h2 id="subscriptions-heading" className="mb-4 text-xl font-bold text-zinc-100">
        Active Subscriptions
      </h2>
      <DataTable
        caption="Active subscriptions"
        rows={subscriptions}
        columns={[
          {
            key: "role",
            header: "Role",
            render: (subscription) => <Pill>{subscription.role}</Pill>,
          },
          {
            key: "period-end",
            header: "Current Period End",
            render: (subscription) => formatDate(subscription.current_period_end),
          },
        ]}
      />
    </section>
  );
};

export default SubscriptionsTable;
