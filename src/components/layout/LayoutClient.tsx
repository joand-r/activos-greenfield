"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface LayoutClientProps {
  children: React.ReactNode;
}

export default function LayoutClient({ children }: LayoutClientProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/signin" || pathname === "/signup";
  const isHomePage = pathname === "/";

  if (isAuthPage) {
    return (
      <main className="flex-grow min-h-screen flex items-center justify-center bg-[#FCFCFC] dark:bg-black">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-grow">{children}</main>
        {isHomePage && <Footer />}
      </div>
    </div>
  );
}
