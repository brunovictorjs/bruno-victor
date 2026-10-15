import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { ProjectView } from '@/components/site/project-view';
import { SiteHeader } from '@/components/site/site-header';
import { admin } from '@/lib/api/admin';

export const metadata: Metadata = { title: 'Pré-visualização', robots: { index: false } };

type Props = PageProps<'/painel/portfolio/[id]/previa'>;

/** Mostra o projeto exatamente como ficará no site — inclusive rascunhos — em PT ou EN (?lang=en). */
async function Preview({ params, searchParams }: Props) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const locale = query.lang === 'en' ? 'en' : 'pt';
  const project = await admin.project(id);
  const other = locale === 'en' ? 'pt' : 'en';
  return (
    <>
      <div role="status" className="sticky top-0 z-50 flex flex-wrap items-center justify-center gap-4 bg-ink px-4 py-2.5 text-[13px] font-medium text-surface">
        <span>
          Pré-visualização ({locale.toUpperCase()}) • {project.status === 'PUBLISHED' ? 'publicado' : 'rascunho — não aparece no site'}
        </span>
        <Link href={`/painel/portfolio/${project.id}/previa${other === 'en' ? '?lang=en' : ''}`} className="underline underline-offset-2">
          Ver em {other === 'en' ? 'inglês' : 'português'}
        </Link>
        <Link href={`/painel/portfolio/${project.id}`} className="underline underline-offset-2">
          Voltar ao editor
        </Link>
      </div>
      <SiteHeader locale={locale} path={`/portfolio/${project.slug}`} variant="project" />
      <ProjectView project={project} next={null} locale={locale} />
    </>
  );
}

export default function Page(props: Props) {
  return (
    <Suspense>
      <Preview {...props} />
    </Suspense>
  );
}
