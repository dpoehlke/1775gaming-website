import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "News, dev logs, and insights from the 1775 Gaming command center. Follow development of Omniverse: Ascension and the future of AI-powered mobile gaming.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
