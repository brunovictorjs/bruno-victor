import { initials, USER_ROLE_LABEL } from '@bv/shared';
import { ArrowUpRight, LogOut } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { SidebarNav } from '@/components/admin/sidebar-nav';
import { logoutAction } from '@/lib/actions/auth';
import { admin, getSessionUser } from '@/lib/api/admin';
import { DEFAULT_IMAGES } from '@/lib/config';

async function SessionArea() {
  const [user, counters] = await Promise.all([getSessionUser(), admin.unreadCount()]);
  return (
    <>
      <SidebarNav unread={counters.unreadMessages} isAdmin={user.role === 'ADMIN'} />
      <div className="mt-auto flex flex-col gap-3.5 border-t border-hairline px-2 pt-5">
        <Link
          href="/"
          target="_blank"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-line-strong text-sm font-medium hover:border-ink"
        >
          <ArrowUpRight className="size-4" strokeWidth={1.5} aria-hidden />
          Ver site
        </Link>
        <div className="flex items-center justify-between gap-2.5">
          <span className="flex min-w-0 items-center gap-2.5">
            <span aria-hidden className="flex size-10 flex-none items-center justify-center rounded-sm bg-ink text-[13px] font-semibold text-surface">
              {initials(user.name)}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[13px] font-medium">{user.name}</span>
              <span className="text-xs text-ink-muted">{USER_ROLE_LABEL[user.role]}</span>
            </span>
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Sair do painel"
              className="flex size-10 items-center justify-center rounded-sm border border-hairline hover:border-ink"
            >
              <LogOut className="size-4" strokeWidth={1.5} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function SessionSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-2 px-2 pt-4" aria-hidden>
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="h-10 rounded-sm bg-surface-200" />
      ))}
    </div>
  );
}

/** Estrutura do painel: barra lateral + conteúdo. */
export default function AdminLayout({ children }: LayoutProps<'/painel'>) {
  return (
    <div className="min-h-dvh bg-surface lg:flex">
      <AdminSidebar
        brand={
          <Link href="/painel/mensagens" className="flex items-center gap-3 px-2 lg:flex-col lg:items-start lg:gap-2.5">
            <Image src={DEFAULT_IMAGES.logo} alt="Bruno Victor" width={132} height={39} className="h-[29px] w-[98px] lg:h-[39px] lg:w-[132px]" priority />
            <span className="font-mono text-xs font-light text-ink-muted max-sm:sr-only lg:not-sr-only">&lt;painel /&gt;</span>
          </Link>
        }
      >
        <Suspense fallback={<SessionSkeleton />}>
          <SessionArea />
        </Suspense>
      </AdminSidebar>
      <main className="flex min-w-0 flex-1 flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10 lg:py-8">{children}</main>
    </div>
  );
}
