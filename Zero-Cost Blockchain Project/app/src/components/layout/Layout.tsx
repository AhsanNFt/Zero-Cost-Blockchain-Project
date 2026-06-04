import type { ReactNode } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export default function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#0B0E1A] text-[#F1F5F9]">
      <Navbar />
      <main className="pt-16">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
