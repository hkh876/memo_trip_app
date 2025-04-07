import "@/styles/globals.css";
import { StyledEngineProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={new QueryClient}>
      <StyledEngineProvider injectFirst>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <title>여행 기록</title>
        </Head>
        <Component {...pageProps} />
      </StyledEngineProvider>
    </QueryClientProvider>
  )
}
