import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ApolloProviderWrapper from "@/components/ApolloProvider";
import { Toaster } from "sonner";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ApolloProviderWrapper>
    <ClerkProvider>
    <html lang="en">
      <body className="min-h-screen flex">
        {children}

        <Toaster position='bottom-center'/>
      </body>
    </html>
    </ClerkProvider>
    </ApolloProviderWrapper>
  );
}
