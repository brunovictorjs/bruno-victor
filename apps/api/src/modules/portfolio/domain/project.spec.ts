import { Slug } from '../../../shared/domain/slug.js';
import { Category } from './category.js';
import { Project, type ProjectContent } from './project.js';

const actor = { id: 'u1', name: 'Bruno Victor', role: 'ADMIN' as const };
const content: ProjectContent = {
  title: 'Loja & Checkout',
  titleEn: null,
  summary: null,
  summaryEn: null,
  client: null,
  date: '2026-03-14',
  role: null,
  roleEn: null,
  duration: null,
  durationEn: null,
  stack: ['Next.js', 'NestJS'],
  liveUrl: null,
  repoUrl: null,
  intro: null,
  introEn: null,
  challenge: null,
  challengeEn: null,
  approach: null,
  approachEn: null,
  result: null,
  resultEn: null,
  categoryId: 'c1',
  serviceId: null,
  featured: false,
};
const photo = (n: number) => ({ storageKey: `k${n}.webp`, url: `u${n}`, thumbUrl: `t${n}`, width: 10, height: 10 });

const draft = () => Project.createDraft(content, Slug.fromText(content.title), 0, actor);

describe('Project', () => {
  it('nasce como rascunho e registra o evento de criação', () => {
    const p = draft();
    expect(p.status).toBe('DRAFT');
    expect(p.slug).toBe('loja-e-checkout');
    expect(p.pullEvents().map((e) => e.name)).toEqual(['portfolio.project.created']);
  });

  it('não publica sem imagens', () => {
    expect(() => draft().publish(actor, new Date())).toThrow(/ao menos uma imagem/);
  });

  it('a primeira imagem vira capa e a capa passa para a próxima quando removida', () => {
    const p = draft();
    const a = p.addPhoto(photo(1), actor);
    const b = p.addPhoto(photo(2), actor);
    expect(p.snapshot().coverPhotoId).toBe(a.id);
    p.removePhoto(a.id, actor);
    expect(p.snapshot().coverPhotoId).toBe(b.id);
  });

  it('volta para rascunho quando a última imagem de um projeto publicado é removida', () => {
    const p = draft();
    const a = p.addPhoto(photo(1), actor);
    p.publish(actor, new Date());
    p.removePhoto(a.id, actor);
    expect(p.status).toBe('DRAFT');
  });

  it('reordena a galeria só com a lista completa de imagens', () => {
    const p = draft();
    const a = p.addPhoto(photo(1), actor);
    const b = p.addPhoto(photo(2), actor);
    p.reorderPhotos([b.id, a.id], actor);
    expect(p.photos.map((x) => x.id)).toEqual([b.id, a.id]);
    expect(() => p.reorderPhotos([a.id], actor)).toThrow(/todas as imagens/);
  });

  it('só aceita capa que pertence à galeria', () => {
    expect(() => draft().setCover('inexistente', actor)).toThrow(/Imagem/);
  });

  it('guarda a legenda nos dois idiomas', () => {
    const p = draft();
    const a = p.addPhoto(photo(1), actor);
    p.captionPhoto(a.id, { caption: 'Tela de checkout', captionEn: 'Checkout screen' }, actor);
    expect(p.photos[0]!.snapshot()).toMatchObject({ caption: 'Tela de checkout', captionEn: 'Checkout screen' });
  });
});

describe('Category', () => {
  it('não pode ser excluída enquanto tiver projetos', () => {
    const c = Category.create(
      { name: 'Sistemas web', nameEn: 'Web systems', description: null, descriptionEn: null, visibleInFilter: true },
      Slug.fromText('Sistemas web'),
      0,
      actor,
    );
    expect(() => c.markDeletedBy(actor, 2)).toThrow(/Mova os projetos/);
    expect(() => c.markDeletedBy(actor, 0)).not.toThrow();
  });
});
