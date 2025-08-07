import Head from "next/head";

export default function Layout({ children }) {
  // const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <>
        <Head>
            <title>Gorriato Logger</title>
        </Head>
        <main className="h-full">{children}</main>
    </>
  );
}