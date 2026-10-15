'use client';

import type { MessageDto, MessageFilter, MessageListDto } from '@bv/shared';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { PageHeader } from './admin-ui';
import { ConfirmButton } from './confirm-button';
import { useMutation } from './hooks';

const FILTERS: [MessageFilter, string][] = [
  ['all', 'Todas'],
  ['pending', 'Aguardando resposta'],
  ['answered', 'Respondidas'],
];

function when(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const days = Math.floor((new Date(now.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 86_400_000);
  if (days === 0) return `hoje, ${time}`;
  if (days === 1) return `ontem, ${time}`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

const formatDesired = (v: string | null) => {
  if (!v) return 'A combinar';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : v;
};

const whatsappUrl = (m: MessageDto) => {
  const digits = (m.phone ?? '').replace(/\D/g, '');
  if (!digits) return null;
  const first = m.name.split(' ')[0];
  const text = encodeURIComponent(
    m.locale === 'en'
      ? `Hi, ${first}! This is Bruno Victor — I got your message through my website.`
      : `Olá, ${first}! Aqui é o Bruno Victor, recebi sua mensagem pelo site.`,
  );
  return `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}?text=${text}`;
};

export function MessagesInbox({ initial }: { initial: MessageListDto }) {
  const [filter, setFilter] = useState<MessageFilter>('all');
  const [data, setData] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | null>(initial.items[0]?.id ?? null);
  const { attempt, busy } = useMutation();

  const reload = async (f = filter) => {
    const next = await api<MessageListDto>(`/messages?filter=${f}`);
    setData(next);
    return next;
  };

  const pickFilter = async (f: MessageFilter) => {
    setFilter(f);
    const next = await attempt(() => reload(f));
    if (next && !next.items.some((m) => m.id === selectedId)) setSelectedId(next.items[0]?.id ?? null);
  };

  const select = async (m: MessageDto) => {
    setSelectedId(m.id);
    if (!m.read) await attempt(async () => { await api(`/messages/${m.id}/read`, { method: 'POST' }); await reload(); });
  };

  const sel = data.items.find((m) => m.id === selectedId) ?? null;

  return (
    <>
      <PageHeader
        eyebrow="Contatos do site"
        title="Mensagens"
        actions={
          <span className="inline-flex items-center gap-2 text-[13px] text-ink-muted">
            <Mail className="size-4" strokeWidth={1.5} aria-hidden />
            Cada nova mensagem também chega no e-mail definido em Configurações › Contato
          </span>
        }
      />

      <div role="group" aria-label="Filtrar mensagens" className="flex flex-wrap gap-2">
        {FILTERS.map(([key, label]) => (
          <Button key={key} size="sm" variant={filter === key ? 'default' : 'outline'} aria-pressed={filter === key} onClick={() => void pickFilter(key)}>
            {label}
          </Button>
        ))}
      </div>

      <div className="flex min-h-[620px] flex-wrap overflow-hidden rounded-md border border-hairline">
        <div className="min-w-0 flex-[1_1_320px] border-hairline bg-surface md:border-r">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3.5">
            <span className="text-[11px] font-medium tracking-label text-ink-muted uppercase">Caixa de entrada</span>
            <span className="text-xs text-ink-muted">{data.unreadCount} não lidas</span>
          </div>
          {data.items.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => void select(m)}
              aria-current={m.id === selectedId ? 'true' : undefined}
              className={cn(
                'flex w-full flex-col gap-1.5 border-b border-hairline p-4 text-left hover:bg-surface-200',
                m.id === selectedId && 'bg-surface-200 shadow-[inset_2px_0_0_#ffffff]',
              )}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="flex items-center gap-2.5 text-sm font-medium">
                  <span aria-hidden className={cn('size-2 flex-none rounded-sm', m.read ? 'border border-line-strong' : 'bg-ink')} />
                  {m.name}
                  {!m.read && <span className="sr-only">(não lida)</span>}
                </span>
                <span className="text-xs text-ink-muted">{when(m.createdAt)}</span>
              </span>
              <span className="flex items-center gap-2 pl-[18px] text-[11px] font-medium tracking-[0.14em] text-ink uppercase">
                {m.workType}
                {m.locale === 'en' && <span className="rounded-sm border border-line-strong px-1 font-mono text-[10px] tracking-normal">EN</span>}
              </span>
              <span className="line-clamp-2 pl-[18px] text-[13px] leading-[19px] text-ink-muted">{m.message}</span>
            </button>
          ))}
          {data.items.length === 0 && <p className="px-4 py-6 text-sm text-ink-muted">Nenhuma mensagem neste filtro.</p>}
        </div>

        <article className="flex min-w-0 flex-[999_1_420px] flex-col gap-6 bg-surface-100 p-6 sm:p-8">
          {sel ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-medium tracking-label text-ink-muted uppercase">{sel.workType}</span>
                  <h2 className="text-[28px] leading-[34px] font-semibold">{sel.name}</h2>
                  <span className="text-[13px] text-ink-muted">
                    Recebida {when(sel.createdAt)} pelo formulário do site
                    {sel.locale === 'en' ? ' em inglês — responda em inglês' : ''}
                  </span>
                </div>
                <Badge variant={sel.answered ? 'default' : 'outline'}>{sel.answered ? 'Respondida' : 'Aguardando resposta'}</Badge>
              </div>
              <dl className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 rounded-md border border-hairline bg-surface p-5">
                {[
                  ['E-mail', sel.email],
                  ['WhatsApp', sel.phone ?? '—'],
                  ['Prazo desejado', formatDesired(sel.desiredDate)],
                  ['Idioma', sel.locale === 'en' ? 'Inglês (site em /en)' : 'Português'],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-1">
                    <dt className="text-[11px] font-medium tracking-label text-ink-muted uppercase">{label}</dt>
                    <dd className="text-sm font-semibold [overflow-wrap:anywhere]">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-medium tracking-label text-ink-muted uppercase">Mensagem</span>
                <p className="leading-[26px] whitespace-pre-line">{sel.message}</p>
              </div>
              {sel.answered && sel.answeredByName && <p className="text-[13px] text-ink-muted">Respondida por {sel.answeredByName}.</p>}
              <div className="mt-auto flex flex-wrap gap-3 border-t border-hairline pt-6">
                <Button asChild>
                  <a href={`mailto:${sel.email}?subject=${encodeURIComponent(sel.locale === 'en' ? 'Re: your message — Bruno Victor' : 'Re: seu contato — Bruno Victor')}`}>Responder por e-mail</a>
                </Button>
                {whatsappUrl(sel) && (
                  <Button asChild variant="outline">
                    <a href={whatsappUrl(sel)!} target="_blank" rel="noopener noreferrer">
                      Abrir no WhatsApp
                    </a>
                  </Button>
                )}
                <Button
                  variant="outline"
                  disabled={busy}
                  onClick={() =>
                    void attempt(async () => {
                      await api(`/messages/${sel.id}/answered`, { method: 'PATCH', json: { answered: !sel.answered } });
                      await reload();
                    }, sel.answered ? 'Marcada como pendente' : 'Marcada como respondida')
                  }
                >
                  {sel.answered ? 'Marcar como pendente' : 'Marcar como respondida'}
                </Button>
                <ConfirmButton
                  trigger={<Button variant="outline">Arquivar</Button>}
                  title="Arquivar mensagem?"
                  description={`A mensagem de ${sel.name} sai da caixa de entrada.`}
                  confirmLabel="Arquivar"
                  onConfirm={() =>
                    attempt(async () => {
                      await api(`/messages/${sel.id}/archive`, { method: 'POST' });
                      const next = await reload();
                      setSelectedId(next.items[0]?.id ?? null);
                    }, 'Mensagem arquivada')
                  }
                />
              </div>
            </>
          ) : (
            <p className="m-auto text-sm text-ink-muted">Nenhuma mensagem selecionada.</p>
          )}
        </article>
      </div>
    </>
  );
}
