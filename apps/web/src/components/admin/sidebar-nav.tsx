'use client';

import { Code2, Grid2x2, Mail, Settings, Star, Tag, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const GROUPS = [
  { label: 'Atendimento', items: [{ href: '/painel/mensagens', label: 'Mensagens', icon: Mail, badge: true }] },
  {
    label: 'Conteúdo',
    items: [
      { href: '/painel/portfolio', label: 'Projetos', icon: Grid2x2 },
      { href: '/painel/categorias', label: 'Categorias', icon: Tag },
      { href: '/painel/servicos', label: 'Serviços', icon: Code2 },
      { href: '/painel/depoimentos', label: 'Depoimentos', icon: Star },
    ],
  },
  { label: 'Site', items: [{ href: '/painel/configuracoes', label: 'Configurações', icon: Settings }] },
  { label: 'Equipe', adminOnly: true, items: [{ href: '/painel/usuarios', label: 'Usuários', icon: Users }] },
];

export function SidebarNav({ unread, isAdmin }: { unread: number; isAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Seções do painel" className="flex flex-col gap-0.5">
      {GROUPS.filter((g) => isAdmin || !g.adminOnly).map((group) => (
        <div key={group.label} className="flex flex-col gap-0.5">
          <span className="px-3.5 pt-4 pb-2 text-[10px] font-medium tracking-label text-ink-muted uppercase">
            {group.label}
          </span>
          {group.items.map(({ href, label, icon: Icon, ...item }) => {
            const on = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? 'page' : undefined}
                className={cn(
                  'flex min-h-[42px] items-center justify-between gap-3 rounded-sm px-3.5 text-sm',
                  on ? 'bg-ink text-surface' : 'text-ink-muted hover:bg-surface-200 hover:text-ink',
                )}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} className="size-[18px]" strokeWidth={1.5} aria-hidden />
                  {label}
                </span>
                {'badge' in item && unread > 0 && (
                  <span
                    aria-label={`${unread} não lidas`}
                    className={cn(
                      'min-w-[22px] rounded-sm px-1.5 text-center text-[11px] leading-[22px] font-medium tracking-normal',
                      on ? 'bg-surface text-ink' : 'bg-ink text-surface',
                    )}
                  >
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
