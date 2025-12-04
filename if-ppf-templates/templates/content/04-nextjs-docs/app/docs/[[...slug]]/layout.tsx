import { Leftbar } from "@/components/leftbar";
import { getRepoItemsList } from "@/lib/markdown";

export default async function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tree = await getRepoItemsList();
  return (
    <div className="flex items-start gap-14">
      <Leftbar tree={tree} />
      <div className="flex-[4]">{children}</div>{" "}
    </div>
  );
}
