/**
 * Seed de desenvolvimento: cria o dono do site e o conteúdo de exemplo, em
 * português e inglês. Idempotente — só cria o que ainda não existe.
 * Rode com `npm run db:seed`.
 */
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/infrastructure/database/generated/prisma/client.js';

const provider = process.env.DATABASE_PROVIDER === 'postgresql' ? 'postgresql' : 'sqlite';
const url = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';
const prisma = new PrismaClient({
  adapter:
    provider === 'postgresql'
      ? new PrismaPg({ connectionString: url })
      : new PrismaBetterSqlite3({ url: url.replace(/^file:/, '') }),
});

const OWNER = {
  name: process.env.SEED_OWNER_NAME ?? 'Bruno Victor',
  email: (process.env.SEED_OWNER_EMAIL ?? 'contato@brunovictor.dev').toLowerCase(),
  password: process.env.SEED_OWNER_PASSWORD ?? 'trocar-esta-senha',
};

/** E-mail exibido no site e que recebe as mensagens do formulário. */
const CONTACT_EMAIL = (process.env.SEED_CONTACT_EMAIL ?? OWNER.email).toLowerCase();

const CATEGORIES = [
  { slug: 'sistemas-web', name: 'Sistemas web', nameEn: 'Web systems' },
  { slug: 'sites', name: 'Sites', nameEn: 'Websites' },
  { slug: 'apis-e-integracoes', name: 'APIs e integrações', nameEn: 'APIs and integrations' },
];

const SERVICES = [
  {
    name: 'Sites institucionais',
    nameEn: 'Business websites',
    icon: 'WEB',
    description: 'Sites rápidos, bem posicionados no Google e fáceis de atualizar.',
    descriptionEn: 'Fast websites, well ranked on Google and easy to update.',
    includes: ['Layout responsivo', 'SEO técnico', 'Painel para editar o conteúdo'],
    includesEn: ['Responsive layout', 'Technical SEO', 'Admin panel to edit content'],
  },
  {
    name: 'Sistemas web sob medida',
    nameEn: 'Custom web systems',
    icon: 'DATABASE',
    description: 'Do cadastro ao relatório: o sistema que o seu processo pede, sem planilha no meio.',
    descriptionEn: 'From sign-up to report: the system your process needs, no spreadsheet in between.',
    includes: ['Painel administrativo', 'Login e permissões', 'Relatórios'],
    includesEn: ['Admin panel', 'Login and permissions', 'Reports'],
  },
  {
    name: 'APIs e integrações',
    nameEn: 'APIs and integrations',
    icon: 'API',
    description: 'Faço os seus sistemas conversarem entre si.',
    descriptionEn: 'I make your systems talk to each other.',
    includes: ['Pagamentos e gateways', 'WhatsApp, e-mail e notificações', 'ERPs e planilhas'],
    includesEn: ['Payments and gateways', 'WhatsApp, e-mail and notifications', 'ERPs and spreadsheets'],
  },
  {
    name: 'Manutenção e evolução',
    nameEn: 'Maintenance and evolution',
    icon: 'AUTOMATION',
    description: 'Correções, melhorias e novas funções num sistema que já existe.',
    descriptionEn: 'Fixes, improvements and new features in a system that already exists.',
    includes: ['Diagnóstico do código', 'Atualização de dependências', 'Entregas parciais'],
    includesEn: ['Code assessment', 'Dependency updates', 'Partial deliveries'],
  },
];

const PROJECTS = [
  {
    cat: 'sistemas-web',
    service: 'Sistemas web sob medida',
    slug: 'painel-de-gestao-cliente',
    title: 'Painel de gestão [Cliente]',
    titleEn: 'Management dashboard [Client]',
    summary: 'Sistema interno com cadastro, permissões e relatórios.',
    summaryEn: 'Internal system with records, permissions and reports.',
    stack: ['Next.js', 'NestJS', 'PostgreSQL'],
    featured: true,
  },
  {
    cat: 'apis-e-integracoes',
    service: 'APIs e integrações',
    slug: 'checkout-e-pagamentos-cliente',
    title: 'Checkout e pagamentos [Cliente]',
    titleEn: 'Checkout and payments [Client]',
    summary: 'Integração com gateway de pagamento e avisos por WhatsApp.',
    summaryEn: 'Payment gateway integration with WhatsApp notifications.',
    stack: ['Node.js', 'TypeScript', 'Webhooks'],
    featured: true,
  },
  {
    cat: 'sites',
    service: 'Sites institucionais',
    slug: 'site-institucional-cliente',
    title: 'Site institucional [Cliente]',
    titleEn: 'Business website [Client]',
    summary: 'Site rápido, bilíngue e com painel para editar o conteúdo.',
    summaryEn: 'Fast, bilingual website with an admin panel to edit content.',
    stack: ['Next.js', 'Tailwind CSS'],
    featured: false,
  },
];

async function main() {
  if ((await prisma.user.count()) === 0) {
    await prisma.user.create({
      data: {
        id: randomUUID(),
        name: OWNER.name,
        email: OWNER.email,
        passwordHash: await bcrypt.hash(OWNER.password, 12),
        role: 'ADMIN',
        status: 'ACTIVE',
        isOwner: true,
      },
    });
    console.log(`✔ Dono do site criado: ${OWNER.email} / ${OWNER.password}`);
  }

  // Só o e-mail de contato; o resto da seção vem do conteúdo padrão (editável no painel).
  if (!(await prisma.siteSetting.findUnique({ where: { key: 'contact' } }))) {
    await prisma.siteSetting.create({
      data: { key: 'contact', value: JSON.stringify({ recipientEmail: CONTACT_EMAIL }), updatedByName: OWNER.name },
    });
    console.log(`✔ E-mail de contato: ${CONTACT_EMAIL}`);
  }

  const categoryIds = new Map<string, string>();
  for (const [position, c] of CATEGORIES.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      create: { id: randomUUID(), ...c, position },
      update: {},
    });
    categoryIds.set(c.slug, row.id);
  }

  const serviceIds = new Map<string, string>();
  if ((await prisma.service.count()) === 0) {
    for (const [position, s] of SERVICES.entries()) {
      const id = randomUUID();
      await prisma.service.create({
        data: {
          id,
          ...s,
          includes: JSON.stringify(s.includes),
          includesEn: JSON.stringify(s.includesEn),
          // O design system proíbe preço que não esteja definido: começa "sob consulta".
          priceMode: 'ON_REQUEST',
          priceCents: null,
          position,
        },
      });
      serviceIds.set(s.name, id);
    }
    console.log('✔ Serviços de exemplo');
  }

  if ((await prisma.project.count()) === 0) {
    for (const [position, p] of PROJECTS.entries()) {
      // Os projetos de exemplo entram como RASCUNHO: publique-os pelo painel depois de enviar as imagens.
      await prisma.project.create({
        data: {
          id: randomUUID(),
          slug: p.slug,
          title: p.title,
          titleEn: p.titleEn,
          summary: p.summary,
          summaryEn: p.summaryEn,
          stack: JSON.stringify(p.stack),
          featured: p.featured,
          status: 'DRAFT',
          position,
          categoryId: categoryIds.get(p.cat)!,
          serviceId: serviceIds.get(p.service) ?? null,
          updatedByName: OWNER.name,
        },
      });
    }
    console.log('✔ Projetos de exemplo (rascunho)');
  }

  if ((await prisma.testimonial.count()) === 0) {
    const labels = [
      ['Sistema web', 'Web system'],
      ['Integração', 'Integration'],
      ['Site', 'Website'],
    ];
    for (const [position, [job, jobEn]] of labels.entries()) {
      await prisma.testimonial.create({
        data: {
          id: randomUUID(),
          clientName: '[Nome do cliente]',
          jobLabel: `${job} • [ANO]`,
          jobLabelEn: `${jobEn} • [YEAR]`,
          quote: '[Depoimento do cliente, cadastrado no painel. Até 280 caracteres.]',
          quoteEn: '[Client testimonial, added in the admin panel. Up to 280 characters.]',
          rating: 5,
          position,
        },
      });
    }
    console.log('✔ Depoimentos de exemplo');
  }
}

main()
  .then(() => console.log('Seed concluído.'))
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
