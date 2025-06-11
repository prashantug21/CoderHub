import type { Metadata } from "next";
import "./css/globals.scss";
import {
  ClerkProvider,
} from '@clerk/nextjs'
import ReduxProvider from "./Components/ReduxProvider";
import QueryProvider from "./Components/QueryProvider";
import Navbar from "./Components/Navbar";


export const metadata: Metadata = {
  title: "CoderHub",
  description: "All coding profiles in one place",
  icons: {
    icon: {
      url: "./logo.svg",
    },
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body  >
          <ReduxProvider>
            <QueryProvider>
              <Navbar />
              <div className="bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:16px_16px] min-h-[calc(100vh-76.2px)]">
                {children}
              </div>
            </QueryProvider>
          </ReduxProvider>
        </body>
      </html >
    </ClerkProvider >
  );
}
