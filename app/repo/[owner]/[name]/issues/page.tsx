import RepoDetailPage from "../page";

export default function RepoIssuesPage({
  params,
}: {
  params: Promise<{ owner: string; name: string }>;
}) {
  return <RepoDetailPage params={params} initialTab={2} />;
}
