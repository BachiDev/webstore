"use client";

import { UserProvider } from "../lib/UserContext";
import { CartProvider } from "../lib/CartContext";
import { Toaster } from "react-hot-toast";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <CartProvider>
      <UserProvider>
        <Navbar />
        <Toaster
          toastOptions={{
            style: {
              background: "#18181b",
              color: "#f4f4f5",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
        <main id="main" className="flex-grow">
          {children}
        </main>
        <Footer />
      </UserProvider>
    </CartProvider>
  );
};

export default Providers;
