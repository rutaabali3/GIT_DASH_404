import RepoDetailPage from "../page";

export default function RepoPrsPage({
  params,
}: {
  params: Promise<{ owner: string; name: string }>;
}) {
  return <RepoDetailPage params={params} initialTab={1} />;
}
