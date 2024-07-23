import "@/styles/globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { QueryClient,QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}><GoogleOAuthProvider clientId="1042646315160-ui6lcsdba80domnnof08fk22dftb1qdp.apps.googleusercontent.com">
    <div className={inter.className}>
      <Component {...pageProps} />{" "}
        <Toaster />
      <ReactQueryDevtools/>
    </div>
  </GoogleOAuthProvider></QueryClientProvider>
    
  );
}
