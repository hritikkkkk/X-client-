import "@/styles/globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <GoogleOAuthProvider clientId="1042646315160-ui6lcsdba80domnnof08fk22dftb1qdp.apps.googleusercontent.com">
      <div className={inter.className}>
        <Component {...pageProps} />{" "}
        <Toaster/>
      </div>
    </GoogleOAuthProvider>
  );
}
