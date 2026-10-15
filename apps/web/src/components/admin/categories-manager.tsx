'use client';

import { type CategoryDto, slugify } from '@bv/shared';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { SITE_URL } from '@/lib/config';
import { AdminCard, FormField, PageHeader } from './admin-ui';
import { type ContentLang, countMissingEn, fallbackHelp, LangTabs } from './bilingual';
import { ConfirmButton } from './confirm-button';
import { useMutation, useSortable } from './hooks';
import { SortableItem } from './sortable-item';

const NEW = '__nova__';
const countLabel = (n: number) => (n === 0 ? 'Nenhum projeto' : n === 1 ? '1 projeto' : `${n} projetos`);

interface Form {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  visibleInFilter: boolean;
}

const toForm = (c: CategoryDto | null): Form => ({
  name: c?.name ?? '',
  nameEn: c?.nameEn ?? '',
  description: c?.description ?? '',
  descriptionEn: c?.descriptionEn ?? '',
  visibleInFilter: c?.visibleInFilter ?? true,
});

export function CategoriesManager({ categories }: { categories: CategoryDto[] }) {
  const { run, attempt, busy } = useMutation();
  const [selectedId, setSelectedId] = useState(categories[0]?.id ?? NEW);
  const current = categories.find((c) => c.id === selectedId) ?? null;
  const [form, setForm] = useState<Form>(() => toForm(current));
  const [lang, setLang] = useState<ContentLang>('pt');
  const [error, setError] = useState<string>();
  const sortable = useSortable(categories, (ids) => void attempt(() => api('/categories/order', { method: 'PUT', json: { ids } }), 'Ordem dos filtros salva'));
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const select = (c: CategoryDto | null) => {
    setSelectedId(c?.id ?? NEW);
    setForm(toForm(c));
    setError(undefined);
  };

  const save = async () => {
    setError(undefined);
    try {
      const saved = await run(
        () => api<CategoryDto>(current ? `/categories/${current.id}` : '/categories', { method: current ? 'PUT' : 'POST', json: form }),
        'Categoria salva • o filtro do site já foi atualizado',
      );
      if (saved) setSelectedId(saved.id);
    } catch (e) {
      if (e instanceof ApiError) {
        setLang('pt');
        setError(e.fieldErrors().name ?? e.message);
      }
    }
  };

  const slug = slugify(form.name);
  const nameIn = (c: CategoryDto) => {
    const live = c.id === current?.id ? form : c;
    return (lang === 'en' && live.nameEn) || live.name || c.name;
  };
  const preview = sortable.list.filter((c) => (c.id === current?.id ? form.visibleInFilter : c.visibleInFilter));
  const missingEn = countMissingEn([
    [form.name, form.nameEn],
    [form.description, form.descriptionEn],
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Filtros do portfólio"
        title="Categorias"
        actions={<Button onClick={() => select(null)}><Plus className="size-4" strokeWidth={2} aria-hidden />Nova categoria</Button>}
      />
      <p className="max-w-[760px] text-sm leading-[22px] text-ink-muted">
        As categorias viram os botões de filtro dos projetos no site e aparecem na ficha de cada projeto. Arraste pela alça para mudar a ordem dos botões.
      </p>
      <div className="flex flex-wrap items-start gap-6">
        <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-2.5">
          <ul className="flex flex-col gap-2.5">
            {sortable.list.map((c, i) => (
              <SortableItem
                key={c.id}
                selected={c.id === selectedId}
                onSelect={() => select(c)}
                title={c.name}
                subtitle={`${countLabel(c.projectCount)}${c.nameEn ? ` • EN: ${c.nameEn}` : ' • sem tradução'}`}
                pill={<Badge variant={c.visibleInFilter ? 'default' : 'outline'}>{c.visibleInFilter ? 'No filtro' : 'Oculta'}</Badge>}
                dragProps={sortable.itemProps(c.id)}
                onMove={(d) => sortable.moveBy(c.id, d)}
                first={i === 0}
                last={i === sortable.list.length - 1}
              />
            ))}
          </ul>
          <div className="mt-2 flex flex-col gap-2.5 rounded-md border border-hairline p-4">
            <span className="label-caps">Prévia dos filtros no site ({lang.toUpperCase()})</span>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-md bg-ink px-3 py-2 text-xs font-medium text-surface">{lang === 'en' ? 'All' : 'Todos'}</span>
              {preview.map((c) => (
                <span key={c.id} className="rounded-md border border-hairline px-3 py-2 text-xs text-ink-muted">
                  {nameIn(c)}
                </span>
              ))}
            </div>
          </div>
        </div>

        <AdminCard
          className="min-w-0 flex-[999_1_460px]"
          title={current ? 'Editar categoria' : 'Nova categoria'}
          aside={
            <span className="flex items-center gap-2.5 text-[13px] text-ink-muted">
              Botão de filtro no site
              <Switch checked={form.visibleInFilter} onCheckedChange={(v) => set('visibleInFilter', v)} aria-label="Mostrar esta categoria como filtro no site" />
            </span>
          }
        >
          <LangTabs value={lang} onChange={setLang} missingEn={missingEn} className="self-start" />
          {lang === 'pt' ? (
            <>
              <FormField id="cat-nome" label="Nome" error={error}>
                <Input id="cat-nome" value={form.name} onChange={(e) => set('name', e.target.value)} />
              </FormField>
              <FormField id="cat-slug" label="Endereço (gerado automaticamente)" help={`${SITE_URL.replace(/^https?:\/\//, '')}/#projetos → ${slug || '…'}`}>
                <Input id="cat-slug" value={slug} readOnly className="text-ink-muted" />
              </FormField>
              <FormField id="cat-desc" label="Descrição (opcional)">
                <Textarea id="cat-desc" rows={3} placeholder="Uma linha que aparece no topo dos projetos quando esta categoria está filtrada." value={form.description} onChange={(e) => set('description', e.target.value)} />
              </FormField>
            </>
          ) : (
            <>
              <FormField id="cat-nome-en" label="Nome em inglês" help={fallbackHelp(lang, form.name)}>
                <Input id="cat-nome-en" lang="en" placeholder={form.name} value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} />
              </FormField>
              <FormField id="cat-desc-en" label="Descrição em inglês (opcional)" help={fallbackHelp(lang, form.description)}>
                <Textarea id="cat-desc-en" lang="en" rows={3} value={form.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} />
              </FormField>
            </>
          )}
          {current && (
            <div className="flex flex-col gap-2 rounded-md border border-hairline bg-surface p-4">
              <span className="label-caps">Projetos nesta categoria</span>
              <span className="text-sm leading-[22px]">{countLabel(current.projectCount)}</span>
              {current.projectCount > 0 && (
                <span className="text-xs text-ink-muted">Para excluir, mova antes os projetos para outra categoria. Ocultar o filtro mantém os projetos no site.</span>
              )}
            </div>
          )}
          <div className="flex flex-wrap justify-between gap-3 border-t border-hairline pt-5">
            {current ? (
              <ConfirmButton
                trigger={<Button variant="outline" disabled={current.projectCount > 0}>Excluir</Button>}
                title={`Excluir “${current.name}”?`}
                description="O botão de filtro sai do site."
                onConfirm={async () => {
                  await attempt(() => api(`/categories/${current.id}`, { method: 'DELETE' }), 'Categoria excluída');
                  select(categories.find((c) => c.id !== current.id) ?? null);
                }}
              />
            ) : (
              <span />
            )}
            <Button disabled={busy} onClick={() => void save()}>Salvar categoria</Button>
          </div>
        </AdminCard>
      </div>
    </>
  );
}
