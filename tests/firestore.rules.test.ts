// Security-boundary tests for firestore.rules.
// Run against the local emulator — never production:
//   npm run test:rules
// (firebase emulators:exec --only firestore, isolated "demo-test" project.)

import fs from "fs";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { afterAll, beforeAll, describe, it } from "vitest";

let testEnv: RulesTestEnvironment;

function emulatorEndpoint(): { host: string; port: number } {
  // Set by `firebase emulators:exec`; fall back to firebase.json defaults.
  const fromEnv = process.env.FIRESTORE_EMULATOR_HOST?.split(":");
  return {
    host: fromEnv?.[0] ?? "127.0.0.1",
    port: Number(fromEnv?.[1] ?? 8080),
  };
}

beforeAll(async () => {
  const { host, port } = emulatorEndpoint();
  testEnv = await initializeTestEnvironment({
    projectId: "demo-test",
    firestore: {
      rules: fs.readFileSync("firestore.rules", "utf8"),
      host,
      port,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("public catalog", () => {
  it("lets anyone (even signed out) read products and prices", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(db, "products/prod_1")));
    await assertSucceeds(getDoc(doc(db, "products/prod_1/prices/price_1")));
  });

  it("blocks all client writes to the catalog", async () => {
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(db, "products/prod_1"), { name: "Hacked" }));
    await assertFails(setDoc(doc(db, "products/prod_1/prices/price_1"), { unit_amount: 1 }));
  });
});

describe("per-user Stripe data", () => {
  it("lets owners read and write their own customer docs and checkout sessions", async () => {
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertSucceeds(setDoc(doc(db, "customers/alice"), { email: "a@x.com" }));
    await assertSucceeds(getDoc(doc(db, "customers/alice")));
    await assertSucceeds(
      setDoc(doc(db, "customers/alice/checkout_sessions/sess_1"), { mode: "payment" }),
    );
  });

  it("blocks reads and writes to other users' customer data", async () => {
    const db = testEnv.authenticatedContext("bob").firestore();
    await assertFails(getDoc(doc(db, "customers/alice")));
    await assertFails(setDoc(doc(db, "customers/alice"), { email: "b@x.com" }));
    await assertFails(getDoc(doc(db, "customers/alice/checkout_sessions/sess_1")));
  });

  it("blocks signed-out access to customer data", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "customers/alice")));
    await assertFails(setDoc(doc(db, "customers/alice"), { email: "anon@x.com" }));
  });

  it("blocks client writes to extension-managed subscriptions and payments", async () => {
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertFails(setDoc(doc(db, "customers/alice/subscriptions/sub_1"), { role: "Premium" }));
    await assertFails(setDoc(doc(db, "customers/alice/payments/pay_1"), { amount: 1 }));
    // …while the owner can still read their own (extension-written) rows.
    await assertSucceeds(getDoc(doc(db, "customers/alice/subscriptions/sub_1")));
    await assertSucceeds(getDoc(doc(db, "customers/alice/payments/pay_1")));
  });
});

describe("gated content", () => {
  it("lets any signed-in user (incl. anonymous) read, but never write", async () => {
    const db = testEnv.authenticatedContext("alice").firestore();
    for (const collection of ["content-starter", "content-pro", "content-premium"]) {
      await assertSucceeds(getDoc(doc(db, `${collection}/welcome`)));
      await assertFails(setDoc(doc(db, `${collection}/welcome`), { content: "Hacked" }));
    }
  });

  it("blocks signed-out reads", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "content-premium/welcome")));
  });
});

describe("default deny", () => {
  it("blocks everything not explicitly allowed", async () => {
    const db = testEnv.authenticatedContext("alice").firestore();
    await assertFails(getDoc(doc(db, "admin/secrets")));
    await assertFails(setDoc(doc(db, "anything/goes"), { x: 1 }));
  });
});
