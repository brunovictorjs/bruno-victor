'use client';

import {
  formatPrice,
  type PriceMode,
  PRICE_MODE_LABEL,
  PRICE_MODES,
  parsePrice,
  SERVICE_ICON_LABEL,
  SERVICE_ICONS,
  type ServiceDto,
  type ServiceIcon as ServiceIconName,
} from '@bv/shared';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { ServiceIcon } from '@/components/icons';
import { ServiceCard } from '@/components/site/services-section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { cn } from '@/lib/utils';
import { AdminCard, FormField, PageHeader } from './admin-ui';
import { type ContentLang, countMissingEn, fallbackHelp, LangTabs } from './bilingual';
import { ConfirmButton } from './confirm-button';
import { useMutation, useSortable } from './hooks';
import { priceLine } from './price';
import { SortableItem } from './sortable-item';

interface Form {
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  includes: string;
  includesEn: string;
  priceMode: PriceMode;
  price: string;
  icon: ServiceIconName;
  visible: boolean;
}

const toForm = (s: ServiceDto | null): Form => ({
  name: s?.name ?? 'Novo serviço',
  nameEn: s?.nameEn ?? '',
  description: s?.description ?? '',
  descriptionEn: s?.descriptionEn ?? '',
  includes: s?.includes.join('\n') ?? '',
  includesEn: s?.includesEn.join('\n') ?? '',
  priceMode: s?.priceMode ?? 'ON_REQUEST',
  price: s?.priceCents != null ? formatPrice(s.priceCents) : '',
  icon: s?.icon ?? 'WEB',
  visible: s?.visible ?? false,
});

const lines = (text: string) => text.split('\n').map((l) => l.trim()).filter(Boolean);

export function ServicesManager({ services }: { services: ServiceDto[] }) {
  const { run, attempt, busy } = useMutation();
  const [selectedId, setSelectedId] = useState<string | null>(services[0]?.id ?? null);
  const current = services.find((s) => s.id === selectedId) ?? null;
  const [form, setForm] = useState<Form>(() => toForm(current));
  const [lang, setLang] = useState<ContentLang>('pt');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const sortable = useSortable(services, (ids) => void attempt(() => api('/services/order', { method: 'PUT', json: { ids } }), 'Ordem dos serviços salva'));

  const select = (s: ServiceDto | null) => {
    setSelectedId(s?.id ?? null);
    setForm(toForm(s));
    setErrors({});
  };
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const body = {
    name: form.name,
    nameEn: form.nameEn,
    description: form.description,
    descriptionEn: form.descriptionEn,
    includes: lines(form.includes),
    includesEn: lines(form.includesEn),
    priceMode: form.priceMode,
    priceCents: form.priceMode === 'ON_REQUEST' ? null : parsePrice(form.price),
    icon: form.icon,
    visible: form.visible,
  };

  const save = async () => {
    setErrors({});
    try {
      const saved = await run(
        () => api<ServiceDto>(current ? `/services/${current.id}` : '/services', { method: current ? 'PUT' : 'POST', json: body }),
        'Serviço salvo • o site já está atualizado',
      );
      if (saved) setSelectedId(saved.id);
    } catch (e) {
      if (e instanceof ApiError) {
        const fe = e.fieldErrors();
        if (fe.name || fe.description || fe.includes) setLang('pt');
        setErrors(fe);
      }
    }
  };

  const preview: ServiceDto = {
    id: 'preview',
    position: 0,
    ...body,
    nameEn: body.nameEn || null,
    description: body.description || null,
    descriptionEn: body.descriptionEn || null,
    priceCents: body.priceCents ?? null,
  };
  const missingEn = countMissingEn([
    [form.name, form.nameEn],
    [form.description, form.descriptionEn],
    [form.includes, form.includesEn],
  ]);
  const index = current ? sortable.list.findIndex((s) => s.id === current.id) : services.length;

  return (
    <>
      <PageHeader
        eyebrow="O que eu faço"
        title="Serviços"
        actions={<Button onClick={() => select(null)}><Plus className="size-4" strokeWidth={2} aria-hidden />Novo serviço</Button>}
      />
      <div className="flex flex-wrap items-start gap-6">
        <ul className="flex min-w-0 flex-[1_1_300px] flex-col gap-2.5">
          {sortable.list.map((s, i) => (
            <SortableItem
              key={s.id}
              selected={s.id === selectedId}
              onSelect={() => select(s)}
              title={s.name}
              subtitle={priceLine(s)}
              pill={<Badge variant={s.visible ? 'default' : 'outline'}>{s.visible ? 'No site' : 'Oculto'}</Badge>}
              dragProps={sortable.itemProps(s.id)}
              onMove={(d) => sortable.moveBy(s.id, d)}
              first={i === 0}
              last={i === sortable.list.length - 1}
            />
          ))}
          {!current && (
            <li className="rounded-md border border-ink bg-surface-200 p-4 text-sm font-medium">{form.name || 'Novo serviço'} <span className="font-normal text-ink-muted">(não salvo)</span></li>
          )}
        </ul>

        <div className="flex min-w-0 flex-[999_1_460px] flex-col gap-6">
          <AdminCard
            title={current ? 'Editar serviço' : 'Novo serviço'}
            aside={
              <span className="flex items-center gap-2.5 text-[13px] text-ink-muted">
                Visível no site
                <Switch checked={form.visible} onCheckedChange={(v) => set('visible', v)} aria-label="Mostrar este serviço no site" />
              </span>
            }
          >
            <LangTabs value={lang} onChange={setLang} missingEn={missingEn} className="self-start" />
            {lang === 'pt' ? (
              <>
                <FormField id="s-nome" label="Nome do serviço" error={errors.name}>
                  <Input id="s-nome" value={form.name} onChange={(e) => set('name', e.target.value)} />
                </FormField>
                <FormField id="s-desc" label="Descrição curta" error={errors.description} help="Uma frase concreta: nomeie o serviço e o resultado.">
                  <Textarea id="s-desc" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
                </FormField>
                <FormField id="s-inc" label="O que está incluso (um item por linha)" error={errors.includes} help="Até 4 itens curtos, sem ponto final — o site põe a barra / como marcador.">
                  <Textarea id="s-inc" rows={4} value={form.includes} onChange={(e) => set('includes', e.target.value)} />
                </FormField>
              </>
            ) : (
              <>
                <FormField id="s-nome-en" label="Nome em inglês" help={fallbackHelp(lang, form.name)}>
                  <Input id="s-nome-en" lang="en" placeholder={form.name} value={form.nameEn} onChange={(e) => set('nameEn', e.target.value)} />
                </FormField>
                <FormField id="s-desc-en" label="Descrição em inglês" help={fallbackHelp(lang, form.description)}>
                  <Textarea id="s-desc-en" lang="en" rows={3} value={form.descriptionEn} onChange={(e) => set('descriptionEn', e.target.value)} />
                </FormField>
                <FormField id="s-inc-en" label="Itens inclusos em inglês (um por linha)" help={form.includesEn.trim() ? undefined : 'Em branco, usa a lista em português.'}>
                  <Textarea id="s-inc-en" lang="en" rows={4} placeholder={form.includes} value={form.includesEn} onChange={(e) => set('includesEn', e.target.value)} />
                </FormField>
              </>
            )}
            <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
              <FormField id="s-modo" label="Exibição do preço" help="Sem valor definido, deixe “Sob consulta”.">
                <select id="s-modo" className="field h-11.5 py-0 text-[15px]" value={form.priceMode} onChange={(e) => set('priceMode', e.target.value as PriceMode)}>
                  {PRICE_MODES.map((m) => <option key={m} value={m}>{PRICE_MODE_LABEL[m]}</option>)}
                </select>
              </FormField>
              <FormField id="s-preco" label="Valor (R$)" error={errors.priceCents}>
                <Input id="s-preco" inputMode="decimal" placeholder="0,00" disabled={form.priceMode === 'ON_REQUEST'} value={form.price} onChange={(e) => set('price', e.target.value)} />
              </FormField>
            </div>
            <div className="flex flex-col gap-2">
              <span className="label-caps">Ícone</span>
              <div role="group" aria-label="Escolher ícone" className="flex flex-wrap gap-2">
                {SERVICE_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    aria-label={SERVICE_ICON_LABEL[icon]}
                    aria-pressed={form.icon === icon}
                    onClick={() => set('icon', icon)}
                    className={cn('flex size-11 items-center justify-center rounded-sm border bg-surface hover:border-ink', form.icon === icon ? 'border-ink' : 'border-hairline')}
                  >
                    <ServiceIcon icon={icon} size={20} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap justify-between gap-3 border-t border-hairline pt-5">
              {current ? (
                <ConfirmButton
                  trigger={<Button variant="outline">Excluir</Button>}
                  title={`Excluir “${current.name}”?`}
                  description="O card sai do site. Projetos vinculados a este serviço ficam sem serviço."
                  onConfirm={async () => {
                    await attempt(() => api(`/services/${current.id}`, { method: 'DELETE' }), 'Serviço excluído');
                    select(services.find((s) => s.id !== current.id) ?? null);
                  }}
                />
              ) : (
                <span />
              )}
              <Button disabled={busy} onClick={() => void save()}>Salvar serviço</Button>
            </div>
          </AdminCard>

          <div className="flex flex-col gap-2.5">
            <span className="label-caps">Prévia do card no site ({lang.toUpperCase()})</span>
            <div className="max-w-[380px]">
              <ServiceCard service={preview} locale={lang} index={Math.max(index, 0)} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
