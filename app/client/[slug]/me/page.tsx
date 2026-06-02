import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Rota antiga — a área do cliente agora vive em páginas separadas.
export default async function MeRedirectPage({ params }: PageProps) {
  const { slug } = await params;
  redirect(`/client/${slug}/agendamentos`);
}
