import ScrollToTop from "@/components/ui/ScrollToTop";
import { Providers } from "./providers";
import { Inter } from "next/font/google";
import "node_modules/react-modal-video/css/modal-video.css";
import "../styles/index.css";
import LayoutClient from "@/components/layout/LayoutClient";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Activos Greenfield",
  description: "Sistema de gestión de activos",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body suppressHydrationWarning className={`bg-[#FCFCFC] dark:bg-black ${inter.className}`}>
        <Providers>
          <LayoutClient>{children}</LayoutClient>
          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}
