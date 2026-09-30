"use client";

import { auth, payments } from "../../lib/firebase";
import { stripePortalRegion } from "../../lib/env";
import { signOut } from "firebase/auth";
import { sendEmailVerification } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useRouter } from "next/navigation";
import { useUser } from "../../lib/UserContext";
import withAuth from "../../components/withAuth";
import {
  getCurrentUserSubscriptions,
  getCurrentUserPayments,
  Payment,
  Subscription,
} from "@invertase/firestore-stripe-payments";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import PaymentsTable from "../../components/PaymentsTable";
import SubscriptionsTable from "../../components/SubscriptionsTable";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { EmptyState } from "../../components/ui/ShopBits";

const ProfilePage = () => {
  const router = useRouter();
  const { user } = useUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subscriptions = await getCurrentUserSubscriptions(payments, {
          status: "active",
        });
        setSubscriptions(subscriptions);
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
      }
    };
    if (user) {
      fetchSubscriptions();
    }
  }, [user]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const fetchedPayments = await getCurrentUserPayments(payments);
        setUserPayments(fetchedPayments);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      }
    };
    if (user) {
      fetchPayments();
    }
  }, [user]);

  const handleSendVerification = async () => {
    if (!user?.email) return;
    setIsSendingVerification(true);
    try {
      await sendEmailVerification(user);
      toast.success("Verification email sent — check your inbox.");
    } catch (error) {
      console.error("Failed to send verification email:", error);
      toast.error("Could not send verification email. Please try again.");
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.setItem("logged_out", "true");
      await signOut(auth);
      toast.success("Logged out successfully!");
      router.push("/"); // Redirect to home page after logout
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const functions = getFunctions(undefined, stripePortalRegion);
      const createPortalLink = httpsCallable(
        functions,
        "ext-firestore-stripe-payments-createPortalLink",
      );
      const { data } = await createPortalLink({
        returnUrl: window.location.origin + "/profile",
      });
      const { url } = data as { url: string };
      router.push(url);
    } catch (error) {
      console.error("Error managing subscription:", error);
      toast.error("Could not open the customer portal. Please try again.");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 md:px-6 md:py-16">
      <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-brand-400">
        Account
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-50 md:text-4xl">Profile</h1>
      {user ? (
        <Card className="mt-10 items-center gap-2 p-8 text-center">
          <Avatar user={user} size={96} className="mb-2 ring-1 ring-white/15" />
          <p className="font-mono text-sm text-zinc-300">{user.email || "Guest"}</p>
          <p className="font-mono text-xs break-all text-zinc-400">UID: {user.uid}</p>
          {user.email && !user.emailVerified && (
            <div
              className="mt-2 flex flex-col items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3"
              role="note"
            >
              <p className="text-sm text-amber-200">
                Email not verified yet — verify to protect this account.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSendVerification}
                disabled={isSendingVerification}
              >
                {isSendingVerification ? "Sending…" : "Resend verification email"}
              </Button>
            </div>
          )}
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Button onClick={handleManageSubscription} disabled={isLoadingPortal}>
              {isLoadingPortal ? "Loading..." : "Customer Portal"}
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Card>
      ) : (
        <div className="mt-10">
          <EmptyState
            title="Not signed in"
            lede="Please log in to view your profile."
            action={<Button href="/auth">Go to login</Button>}
          />
        </div>
      )}
      {subscriptions.length > 0 ? (
        <SubscriptionsTable subscriptions={subscriptions} />
      ) : (
        user && (
          <div className="mt-8">
            <EmptyState
              title="No active subscriptions"
              lede="Plans unlock role-gated demo content."
              action={
                <Button href="/subscription" variant="secondary">
                  See plans
                </Button>
              }
            />
          </div>
        )
      )}
      {userPayments.length > 0 ? (
        <PaymentsTable payments={userPayments} />
      ) : (
        user && (
          <div className="mt-8">
            <EmptyState
              title="No payments yet"
              lede="Your test-mode payment history will appear here."
              action={
                <Button href="/store" variant="secondary">
                  Browse products
                </Button>
              }
            />
          </div>
        )
      )}
    </div>
  );
};

export default withAuth(ProfilePage);
