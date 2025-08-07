import "../styles/globals.css";
import type { AppProps } from "next/app";
import { createContext, useState } from "react";
import Layout from "./components/Layout";

export const AppContext = createContext({
  theme: "light",
  setTheme: (theme: "light" | "dark") => {},
  mode: "",
  setMode: (mode: "" | "cloud" | "hybrid" | "local") => {},
});

export default function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mode, setMode] = useState<"" | "cloud" | "hybrid" | "local">("");
  return (
    <div className="h-full w-full">
        <AppContext.Provider
          value={{
            theme,
            setTheme,
            mode,
            setMode,
          }}
        >
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AppContext.Provider>
    </div>
  );
}