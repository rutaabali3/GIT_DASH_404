import RepoDetailPage from "../page";

export default function RepoCommitsPage({
  params,
}: {
  params: Promise<{ owner: string; name: string }>;
}) {
  return <RepoDetailPage params={params} initialTab={3} />;
}
