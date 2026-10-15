import { DEFAULT_LOCALE, type Locale } from '@bv/shared';
import { type NextRequest, NextResponse } from 'next/server';
import { LOCALE_COOKIE, SESSION_COOKIE } from '@/lib/config';

/** Páginas do painel acessíveis sem sessão. */
const OPEN = ['/painel/login', '/painel/convite', '/painel/esqueci-senha', '/painel/redefinir-senha'];

/**
 * Painel — checagem otimista: sem cookie de sessão, redireciona para o login.
 * A validação de verdade acontece na API a cada requisição.
 */
function painel(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (OPEN.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (req.cookies.has(SESSION_COOKIE)) {
    if (pathname === '/painel' || pathname === '/painel/') {
      return NextResponse.redirect(new URL('/painel/mensagens', req.url));
    }
    return NextResponse.next();
  }
  const login = new URL('/painel/login', req.url);
  if (pathname !== '/painel') login.searchParams.set('next', pathname + search);
  return NextResponse.redirect(login);
}

const hasPrefix = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

/** Primeira visita: idioma preferido do navegador (português → pt; qualquer outro → en). */
function preferredLocale(req: NextRequest): Locale | null {
  const header = req.headers.get('accept-language');
  if (!header) return null; // robôs de busca: ficam no padrão
  return /^\s*pt\b/i.test(header) ? 'pt' : 'en';
}

/** Lembra o idioma servido, para a próxima visita à raiz. */
function remember(res: NextResponse, req: NextRequest, locale: Locale) {
  if (req.cookies.get(LOCALE_COOKIE)?.value !== locale) {
    res.cookies.set(LOCALE_COOKIE, locale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  }
  return res;
}

/**
 * Site público bilíngue: português na raiz (/projeto), inglês sob /en
 * (/en/projeto). Internamente tudo vive em app/[locale]: a raiz é reescrita
 * para /pt/… sem mudar a URL, e /pt/… redireciona para a URL sem prefixo.
 */
function site(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (hasPrefix(pathname, `/${DEFAULT_LOCALE}`)) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || '/';
    return NextResponse.redirect(url, 308);
  }

  if (hasPrefix(pathname, '/en')) return remember(NextResponse.next(), req, 'en');

  // Só na primeira visita (sem cookie) seguimos o idioma do navegador; depois,
  // vale o que a pessoa escolheu no seletor PT | EN.
  if (!req.cookies.has(LOCALE_COOKIE) && preferredLocale(req) === 'en') {
    return remember(NextResponse.redirect(new URL(`/en${pathname === '/' ? '' : pathname}${search}`, req.url)), req, 'en');
  }

  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  return remember(NextResponse.rewrite(url), req, DEFAULT_LOCALE);
}

export function proxy(req: NextRequest) {
  return hasPrefix(req.nextUrl.pathname, '/painel') ? painel(req) : site(req);
}

export const config = {
  // Tudo, menos a API do BFF, arquivos internos do Next e arquivos com extensão
  // (imagens de /public, ícones, robots.txt, sitemap.xml…).
  matcher: ['/((?!api/|_next/|.*\\.[^/]+$).*)'],
};
