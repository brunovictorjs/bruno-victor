import { Service, type ServiceData } from './service.js';

const actor = { id: 'u1', name: 'Bruno', role: 'ADMIN' as const };
const base: ServiceData = {
  name: 'APIs e integrações',
  nameEn: 'APIs and integrations',
  description: null,
  descriptionEn: null,
  includes: ['Pagamentos e gateways'],
  includesEn: ['Payments and gateways'],
  priceMode: 'FROM',
  priceCents: 150000,
  icon: 'API',
  visible: true,
};

describe('Service', () => {
  it('"Sob consulta" descarta o valor', () => {
    const s = Service.create({ ...base, priceMode: 'ON_REQUEST' }, 0, actor);
    expect(s.snapshot().priceCents).toBeNull();
  });

  it('"A partir de" exige valor', () => {
    expect(() => Service.create({ ...base, priceCents: null }, 0, actor)).toThrow(/valor/);
  });
});
