'use client';

import {
  ABOUT_CHIP_MAX_LENGTH,
  ABOUT_CHIPS_MAX,
  type ClientLogo,
  localized,
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_MAX,
  type SiteSettings,
  type SiteSettingsDto,
} from '@bv/shared';
import { ChevronLeft, ChevronRight, Trash2, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { DEFAULT_IMAGES, SITE_URL } from '@/lib/config';
import { AdminCard, FormField, PageHeader } from './admin-ui';
import { type ContentLang, countMissingEn, fallbackHelp, LangTabs } from './bilingual';
import { move, useMutation } from './hooks';
import { ImagePicker } from './image-picker';

const SECTIONS = [
  ['hero', 'Hero'],
  ['clientes', 'Logos de clientes'],
  ['sobre', 'Sobre'],
  ['contato', 'Contato'],
  ['metadados', 'Metadados (SEO)'],
] as const;

const strip = ({ updatedAt: _u, updatedByName: _n, ...s }: SiteSettingsDto): SiteSettings => s;
const newId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()));

/** Seções com textos traduzíveis e os campos que têm par `En`. */
const TRANSLATABLE = {
  hero: ['tag', 'line1', 'line2', 'text', 'primaryButton', 'secondaryButton', 'tagline'],
  clients: ['title'],
  about: ['opening', 'text', 'chips'],
  contact: ['city', 'responseTime'],
  seo: ['title', 'description'],
} as const;

type Section = keyof SiteSettings;
type Value = string | string[] | null | undefined;

export function SettingsEditor({ initial }: { initial: SiteSettingsDto }) {
  const { run, busy } = useMutation();
  const [saved, setSaved] = useState<SiteSettings>(() => strip(initial));
  const [s, setS] = useState<SiteSettings>(saved);
  const [lang, setLang] = useState<ContentLang>('pt');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dirty = JSON.stringify(s) !== JSON.stringify(saved);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  /** Atualiza um campo de uma seção. */
  const patch = <K extends Section>(section: K, value: Partial<SiteSettings[K]>) =>
    setS((cur) => ({ ...cur, [section]: { ...cur[section], ...value } }));

  const read = (section: Section, key: string): Value => (s[section] as Record<string, Value>)[key];

  /** Campo de idioma único (e-mail, links, imagens…). */
  const field = <K extends Section>(section: K, key: keyof SiteSettings[K] & string) => ({
    value: String(read(section, key) ?? ''),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => patch(section, { [key]: e.target.value } as Partial<SiteSettings[K]>),
    'aria-invalid': !!errors[`${section}.${key}`] || undefined,
  });

  /** Campo traduzível: na aba EN lê/grava `campoEn` e mostra o português como dica. */
  const tfield = <K extends Section>(section: K, key: string) => {
    const k = lang === 'en' ? `${key}En` : key;
    return {
      value: String(read(section, k) ?? ''),
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => patch(section, { [k]: e.target.value } as Partial<SiteSettings[K]>),
      'aria-invalid': !!errors[`${section}.${k}`] || undefined,
      lang: lang === 'en' ? 'en' : undefined,
      placeholder: lang === 'en' ? String(read(section, key) ?? '') || undefined : undefined,
    };
  };
  const thelp = (section: Section, key: string, ptHelp?: string) => (lang === 'en' ? fallbackHelp(lang, String(read(section, key) ?? '')) : ptHelp);
  const tid = (id: string) => (lang === 'en' ? `${id}-en` : id);
  const err = (path: string) => errors[path];

  const missingEn = countMissingEn(
    (Object.entries(TRANSLATABLE) as [Section, readonly string[]][]).flatMap(([section, keys]) =>
      keys.map((k) => [read(section, k), read(section, `${k}En`)] as [Value, Value]),
    ),
  );

  const save = async () => {
    setErrors({});
    try {
      const result = await run(() => api<SiteSettingsDto>('/site-settings', { method: 'PUT', json: s }), 'Configurações publicadas • o site já está atualizado');
      if (result) {
        const next = strip(result);
        setSaved(next);
        setS(next);
      }
    } catch (e) {
      if (e instanceof ApiError) setErrors(e.fieldErrors());
    }
  };

  const logos = s.clients.logos;
  const setLogos = (next: ClientLogo[]) => patch('clients', { logos: next });
  const chipsKey = lang === 'en' ? 'chipsEn' : 'chips';
  const chips = s.about[chipsKey];
  const setChips = (next: string[]) => patch('about', { [chipsKey]: next });
  const h = (key: keyof SiteSettings['hero'] & string) => localized(s.hero, key, lang);

  return (
    <>
      <PageHeader eyebrow="Textos e imagens do site" title="Configurações do site" actions={<Button disabled={busy || !dirty} onClick={() => void save()}>Salvar e publicar</Button>} />
      <div className="sticky top-16 z-10 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-md border border-hairline bg-surface-100/95 px-4 py-3 backdrop-blur-sm lg:top-0">
        <nav aria-label="Seções das configurações" className="flex flex-wrap gap-2">
          {SECTIONS.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="inline-flex min-h-9 items-center rounded-md border border-hairline px-3 text-xs text-ink-muted hover:border-ink hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
        <LangTabs value={lang} onChange={setLang} missingEn={missingEn} />
      </div>
      {lang === 'en' && (
        <p className="rounded-md border border-hairline bg-surface px-4 py-3 text-[13px] leading-5 text-ink-muted">
          Você está editando a versão em <strong className="font-medium text-ink">inglês</strong> (site em /en). Campos em branco mostram o texto em português.
        </p>
      )}

      {/* HERO */}
      <AdminCard id="hero" title="Hero — abertura do site" description="O primeiro bloco que o visitante vê. A prévia ao lado atualiza enquanto você digita.">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex min-w-0 flex-[1_1_360px] flex-col gap-4">
            <FormField id={tid('h-tag')} label="Tag acima do título" help={thelp('hero', 'tag', 'Uma palavra, em minúsculas. Aparece como <tag />.')}>
              <Input id={tid('h-tag')} className="font-mono" {...tfield('hero', 'tag')} />
            </FormField>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
              <FormField id={tid('h-l1')} label="Título — linha 1 (grossa)" help={thelp('hero', 'line1')}><Input id={tid('h-l1')} {...tfield('hero', 'line1')} /></FormField>
              <FormField id={tid('h-l2')} label="Linha 2 (fio fino)" help={thelp('hero', 'line2', 'Termine com ponto final.')}><Input id={tid('h-l2')} {...tfield('hero', 'line2')} /></FormField>
            </div>
            {lang === 'pt' && (
              <FormField id="h-code" label="Linha de código (mono)" help="Não é traduzida. Ex.: const dev = 'BV';">
                <Input id="h-code" className="font-mono" {...field('hero', 'code')} />
              </FormField>
            )}
            <FormField id={tid('h-text')} label="Mensagem" help={thelp('hero', 'text')}><Textarea id={tid('h-text')} rows={3} {...tfield('hero', 'text')} /></FormField>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-4">
              <FormField id={tid('h-b1')} label="Botão principal" help={thelp('hero', 'primaryButton')}><Input id={tid('h-b1')} {...tfield('hero', 'primaryButton')} /></FormField>
              <FormField id={tid('h-b2')} label="Botão secundário" help={thelp('hero', 'secondaryButton')}><Input id={tid('h-b2')} {...tfield('hero', 'secondaryButton')} /></FormField>
              {lang === 'pt' && (
                <FormField id="h-desde" label="Desde (ano)"><Input id="h-desde" inputMode="numeric" placeholder="Ex.: 2021" {...field('hero', 'since')} /></FormField>
              )}
              <FormField id={tid('h-tag2')} label="Frase curta (rodapé)" help={thelp('hero', 'tagline')}><Input id={tid('h-tag2')} {...tfield('hero', 'tagline')} /></FormField>
            </div>
            {lang === 'pt' && (
              <div className="flex flex-col gap-2">
                <span className="label-caps">Foto do hero</span>
                <div className="flex items-center gap-4">
                  <span className="bg-brand flex h-18 w-24 flex-none items-end justify-center overflow-hidden rounded-md border border-hairline">
                    <Image src={s.hero.imageUrl ?? DEFAULT_IMAGES.hero} alt="Foto atual do hero" width={96} height={96} className="h-auto w-full grayscale" />
                  </span>
                  <ImagePicker folder="site" onUploaded={(url) => patch('hero', { imageUrl: url })} />
                  {s.hero.imageUrl && <Button size="sm" variant="ghost" onClick={() => patch('hero', { imageUrl: null })}>Usar a padrão</Button>}
                </div>
                <span className="text-xs text-ink-muted">PNG com fundo transparente. O site aplica o preto e branco.</span>
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-2">
            <span className="label-caps">Prévia ({lang.toUpperCase()})</span>
            <div className="bg-brand flex items-end gap-2 overflow-hidden rounded-md border border-hairline pt-7 pl-7">
              <div className="flex min-w-0 flex-[1_1_60%] flex-col gap-3 pb-7">
                <span className="font-mono text-[11px] font-light text-ink-muted">&lt;{h('tag')} /&gt;</span>
                <span className="text-[30px] leading-[0.98] tracking-[-0.02em]">
                  <span className="font-semibold">{h('line1')}</span>
                  <br />
                  <span className="font-light text-ink-muted">{h('line2')}</span>
                </span>
                <span className="font-mono text-[10px] text-ink-muted">{s.hero.code}</span>
                <span className="text-[11px] leading-[17px] text-ink-muted">{h('text')}</span>
                <span className="flex flex-wrap gap-1.5">
                  <span className="rounded-sm bg-ink px-2.5 py-2 text-[10px] font-medium text-surface">{h('primaryButton')} →</span>
                  <span className="rounded-sm border border-ink px-2.5 py-[7px] text-[10px] font-medium">{h('secondaryButton')}</span>
                </span>
              </div>
              <Image src={s.hero.imageUrl ?? DEFAULT_IMAGES.hero} alt="" width={300} height={300} className="h-auto w-[40%] flex-none grayscale" />
            </div>
          </div>
        </div>
      </AdminCard>

      {/* CLIENTES */}
      <AdminCard
        id="clientes"
        title="Logos de clientes e parceiros"
        description="Faixa logo abaixo do hero. Use as setas para reordenar. No site, as logos aparecem em branco (a marca é monocromática)."
        aside={
          <span className="flex items-center gap-2.5 text-[13px] text-ink-muted">
            Mostrar a faixa
            <Switch checked={s.clients.visible} onCheckedChange={(v) => patch('clients', { visible: v })} aria-label="Mostrar faixa de clientes no site" />
          </span>
        }
      >
        <FormField id={tid('c-titulo')} label="Título da faixa" className="max-w-[420px]" help={thelp('clients', 'title')}><Input id={tid('c-titulo')} {...tfield('clients', 'title')} /></FormField>
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
          {logos.map((logo, i) => {
            const n = String(i + 1).padStart(2, '0');
            const update = (v: Partial<ClientLogo>) => setLogos(logos.map((l) => (l.id === logo.id ? { ...l, ...v } : l)));
            return (
              <li key={logo.id} className="flex flex-col gap-2.5 rounded-md border border-hairline bg-surface p-3.5">
                <div className="flex h-18 items-center justify-center rounded-md border border-dashed border-hairline bg-surface-100 p-2">
                  {logo.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- pode ser SVG
                    <img src={logo.imageUrl} alt={logo.name || `Logo ${n}`} className="max-h-full max-w-full object-contain brightness-0 invert" />
                  ) : (
                    <span className="font-mono text-[11px] text-ink-muted">&lt;logo {n} /&gt;</span>
                  )}
                </div>
                <label htmlFor={`logo-nome-${logo.id}`} className="sr-only">Nome do cliente {n}</label>
                <Input id={`logo-nome-${logo.id}`} className="h-9 text-[13px]" placeholder="Nome (texto alternativo)" value={logo.name} onChange={(e) => update({ name: e.target.value })} />
                <label htmlFor={`logo-link-${logo.id}`} className="sr-only">Link do cliente {n}</label>
                <Input id={`logo-link-${logo.id}`} type="url" className="h-9 text-[13px]" placeholder="Link (opcional)" value={logo.url} onChange={(e) => update({ url: e.target.value })} aria-invalid={!!err(`clients.logos.${i}.url`) || undefined} />
                {err(`clients.logos.${i}.url`) && <span className="text-xs text-danger">Link inválido (use https://…)</span>}
                <div className="flex items-center justify-between gap-2">
                  <ImagePicker folder="logos" accept="image/png,image/svg+xml,image/webp" label={logo.imageUrl ? 'Trocar' : 'Enviar'} onUploaded={(url) => update({ imageUrl: url })} />
                  <span className="flex gap-1">
                    <Button size="icon" variant="ghost" aria-label={`Mover logo ${n} para a esquerda`} disabled={i === 0} onClick={() => setLogos(move(logos, i, i - 1))}><ChevronLeft className="size-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label={`Mover logo ${n} para a direita`} disabled={i === logos.length - 1} onClick={() => setLogos(move(logos, i, i + 1))}><ChevronRight className="size-4" /></Button>
                    <Button size="icon" variant="ghost" aria-label={`Remover logo ${n}`} onClick={() => setLogos(logos.filter((l) => l.id !== logo.id))}><Trash2 className="size-4" strokeWidth={1.5} /></Button>
                  </span>
                </div>
              </li>
            );
          })}
          <li>
            <ImagePicker
              variant="drop"
              folder="logos"
              accept="image/png,image/svg+xml,image/webp"
              label="Enviar logo"
              hint="PNG ou SVG com fundo transparente"
              className="h-full min-h-[200px] w-full"
              onUploaded={(url) => setLogos([...logos, { id: newId(), name: '', url: '', imageUrl: url }])}
            />
          </li>
        </ul>
      </AdminCard>

      {/* SOBRE */}
      <AdminCard id="sobre" title="Sobre" description="Seção em tema claro no meio da página — o verso do cartão de visita.">
        <div className="flex flex-wrap items-start gap-6">
          {lang === 'pt' && (
            <div className="flex min-w-0 flex-[1_1_260px] flex-col gap-3">
              <span className="label-caps">Foto da seção</span>
              <Image src={s.about.imageUrl ?? DEFAULT_IMAGES.about} alt="Foto atual da seção Sobre" width={400} height={500} className="aspect-[4/5] h-auto w-full rounded-md object-cover object-top grayscale" />
              <ImagePicker folder="site" className="justify-center" onUploaded={(url) => patch('about', { imageUrl: url })} />
              <span className="text-xs text-ink-muted">Use uma foto diferente da do hero. Retrato vertical, mínimo 1200 px de altura.</span>
            </div>
          )}
          <div className="flex min-w-0 flex-[999_1_460px] flex-col gap-4">
            <FormField id={tid('s-abertura')} label="Abertura" help={thelp('about', 'opening')}><Input id={tid('s-abertura')} {...tfield('about', 'opening')} /></FormField>
            <FormField
              id={tid('s-texto')}
              label="Texto"
              help={lang === 'en' ? thelp('about', 'text') : `${s.about.text.length} caracteres • linhas em branco viram parágrafos`}
            >
              <Textarea id={tid('s-texto')} rows={7} {...tfield('about', 'text')} />
            </FormField>
            <div className="flex flex-col gap-2">
              <span className="label-caps">Destaques curtos {lang === 'en' && '(inglês)'}</span>
              {chips.map((chip, i) => (
                <div key={i} className="flex items-center gap-2">
                  <label htmlFor={`chip-${lang}-${i}`} className="sr-only">Destaque {i + 1}</label>
                  <Input id={`chip-${lang}-${i}`} lang={lang === 'en' ? 'en' : undefined} maxLength={ABOUT_CHIP_MAX_LENGTH} value={chip} onChange={(e) => setChips(chips.map((c, j) => (j === i ? e.target.value : c)))} />
                  <Button size="icon" variant="ghost" className="size-11" aria-label={`Remover destaque ${i + 1}`} onClick={() => setChips(chips.filter((_, j) => j !== i))}><X className="size-4" /></Button>
                </div>
              ))}
              {chips.length < ABOUT_CHIPS_MAX && (
                <Button size="sm" variant="outline" className="self-start" onClick={() => setChips([...chips, lang === 'en' ? 'New highlight' : 'Novo destaque'])}>+ Adicionar destaque</Button>
              )}
              <span className="text-xs text-ink-muted">
                {lang === 'en' && chips.length === 0 ? 'Sem destaques em inglês, o site usa os em português. ' : ''}
                Até {ABOUT_CHIPS_MAX} destaques, {ABOUT_CHIP_MAX_LENGTH} caracteres cada.
              </span>
            </div>
            {lang === 'pt' && (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
                <FormField id="s-handle" label="Assinatura (mono)" help="Sempre em minúsculas: @brunovictor.jsx"><Input id="s-handle" className="font-mono" {...field('about', 'handle')} /></FormField>
                <FormField id="s-desde" label="Programando desde"><Input id="s-desde" inputMode="numeric" placeholder="Ano" {...field('about', 'since')} /></FormField>
              </div>
            )}
            <div className="flex flex-col gap-2">
              <span className="label-caps">Prévia ({lang.toUpperCase()})</span>
              <div className="flex flex-col gap-3 rounded-md bg-paper p-6 text-paper-ink">
                <span className="text-lg font-semibold">Bruno Victor</span>
                <span aria-hidden className="h-px bg-paper-hairline" />
                <span className="text-[15px] leading-[22px] font-medium">{localized(s.about, 'opening', lang) || '[Abertura]'}</span>
                <span className="text-[13px] leading-5 whitespace-pre-line text-paper-muted">{localized(s.about, 'text', lang) || '[Texto]'}</span>
                <span className="flex flex-wrap gap-2">
                  {localized(s.about, 'chips', lang).filter(Boolean).map((c, i) => (
                    <span key={i} className="rounded-md border border-paper-line px-2.5 py-1.5 text-[11px]">{c}</span>
                  ))}
                </span>
                <span className="font-mono text-[11px] text-paper-muted">{s.about.handle}</span>
              </div>
            </div>
          </div>
        </div>
      </AdminCard>

      {/* CONTATO */}
      <AdminCard id="contato" title="Contato e recebimento de mensagens" description="Os dados aparecem na seção Contato do site. Cada mensagem do formulário é enviada para o e-mail abaixo e fica salva em Mensagens.">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          {lang === 'pt' && (
            <>
              <FormField id="ct-email" label="E-mail que recebe as mensagens" error={err('contact.recipientEmail') && 'E-mail inválido'}><Input id="ct-email" type="email" placeholder="voce@email.com" {...field('contact', 'recipientEmail')} /></FormField>
              <FormField id="ct-copia" label="Cópia para (opcional)"><Input id="ct-copia" placeholder="outros e-mails, separados por vírgula" {...field('contact', 'ccEmails')} /></FormField>
              <FormField id="ct-whats" label="WhatsApp" help="Com DDI e DDD: +55 81 98736-3068"><Input id="ct-whats" type="tel" placeholder="+55 00 00000-0000" {...field('contact', 'whatsapp')} /></FormField>
              <FormField id="ct-insta" label="Instagram"><Input id="ct-insta" placeholder="@usuario" {...field('contact', 'instagram')} /></FormField>
              <FormField id="ct-linkedin" label="LinkedIn (opcional)" error={err('contact.linkedin') && 'Use o link completo (https://…)'}><Input id="ct-linkedin" type="url" placeholder="https://linkedin.com/in/…" {...field('contact', 'linkedin')} /></FormField>
              <FormField id="ct-github" label="GitHub (opcional)" error={err('contact.github') && 'Use o link completo (https://…)'}><Input id="ct-github" type="url" placeholder="https://github.com/…" {...field('contact', 'github')} /></FormField>
            </>
          )}
          <FormField id={tid('ct-cidade')} label="Cidade (opcional)" help={thelp('contact', 'city')}><Input id={tid('ct-cidade')} {...tfield('contact', 'city')} placeholder={lang === 'pt' ? 'Cidade – UF' : s.contact.city || undefined} /></FormField>
          <FormField id={tid('ct-prazo')} label="Prazo de resposta exibido" help={thelp('contact', 'responseTime')}><Input id={tid('ct-prazo')} {...tfield('contact', 'responseTime')} placeholder={lang === 'pt' ? 'Ex.: 24h' : s.contact.responseTime || undefined} /></FormField>
        </div>
      </AdminCard>

      {/* SEO */}
      <AdminCard id="metadados" title="Metadados (SEO e compartilhamento)" description="Como o site aparece no Google e quando o link é enviado no WhatsApp ou LinkedIn.">
        <div className="flex flex-wrap items-start gap-6">
          <div className="flex min-w-0 flex-[999_1_420px] flex-col gap-4">
            <FormField id={tid('m-title')} label="Título da página" help={lang === 'en' ? thelp('seo', 'title') : `${s.seo.title.length} de ${SEO_TITLE_MAX} caracteres`}>
              <Input id={tid('m-title')} maxLength={SEO_TITLE_MAX} {...tfield('seo', 'title')} />
            </FormField>
            <FormField id={tid('m-desc')} label="Descrição" help={lang === 'en' ? thelp('seo', 'description') : `${s.seo.description.length} de ${SEO_DESCRIPTION_MAX} caracteres`}>
              <Textarea id={tid('m-desc')} rows={3} maxLength={SEO_DESCRIPTION_MAX} {...tfield('seo', 'description')} />
            </FormField>
            {lang === 'pt' && (
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                <div className="flex flex-col gap-2">
                  <span className="label-caps">Imagem de compartilhamento</span>
                  <Image src={s.seo.shareImageUrl ?? DEFAULT_IMAGES.shareImage} alt={s.seo.shareImageUrl ? 'Imagem de compartilhamento atual' : 'Imagem de compartilhamento padrão'} width={400} height={210} className="aspect-[1200/630] w-full rounded-md object-cover" />
                  {!s.seo.shareImageUrl && <span className="text-xs text-ink-muted">Usando a imagem padrão (logo sobre o gradiente da marca).</span>}
                  <ImagePicker variant="drop" folder="site" label={s.seo.shareImageUrl ? 'Trocar imagem' : 'Enviar imagem'} hint="1200 × 630 px" onUploaded={(url) => patch('seo', { shareImageUrl: url })} />
                  {s.seo.shareImageUrl && <Button size="sm" variant="ghost" className="self-start" onClick={() => patch('seo', { shareImageUrl: null })}>Remover (usar padrão)</Button>}
                </div>
                <div className="flex flex-col gap-2">
                  <span className="label-caps">Ícone da aba (favicon)</span>
                  <span className="flex items-center gap-3">
                    <Image src={s.seo.faviconUrl ?? DEFAULT_IMAGES.favicon} alt={s.seo.faviconUrl ? 'Favicon atual' : 'Favicon padrão'} width={48} height={48} className="size-12 rounded-sm" />
                    {!s.seo.faviconUrl && <span className="text-xs text-ink-muted">Usando o ícone padrão (avatar da marca).</span>}
                  </span>
                  <ImagePicker variant="drop" folder="site" accept="image/png" label={s.seo.faviconUrl ? 'Trocar ícone' : 'Enviar ícone'} hint="PNG quadrado, 512 × 512 px" onUploaded={(url) => patch('seo', { faviconUrl: url })} />
                  {s.seo.faviconUrl && <Button size="sm" variant="ghost" className="self-start" onClick={() => patch('seo', { faviconUrl: null })}>Remover (usar padrão)</Button>}
                </div>
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-[1_1_320px] flex-col gap-2">
            <span className="label-caps">Prévia na busca ({lang.toUpperCase()})</span>
            <div className="flex flex-col gap-1.5 rounded-md bg-paper p-5 font-[Arial,sans-serif] text-paper-ink">
              <span className="text-xs text-paper-muted">{SITE_URL.replace(/^https?:\/\//, '')}{lang === 'en' ? '/en' : ''}</span>
              <span className="text-lg leading-6 text-[#1a0dab]">{localized(s.seo, 'title', lang)}</span>
              <span className="text-[13px] leading-5 text-paper-muted">{localized(s.seo, 'description', lang)}</span>
            </div>
          </div>
        </div>
      </AdminCard>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-md border border-line-strong bg-surface-200 px-5 py-4">
        <span className="text-[13px] text-ink-muted">
          {dirty
            ? 'Você tem alterações não salvas.'
            : initial.updatedAt
              ? `Tudo salvo. Última publicação${initial.updatedByName ? ` por ${initial.updatedByName}` : ''}, ${new Date(initial.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}.`
              : 'Tudo salvo.'}
        </span>
        <span className="flex gap-3">
          <Button variant="outline" disabled={!dirty} onClick={() => { setS(saved); setErrors({}); }}>Descartar</Button>
          <Button disabled={busy || !dirty} onClick={() => void save()}>Salvar e publicar</Button>
        </span>
      </div>
    </>
  );
}
