import { JetBrains_Mono, Jost } from 'next/font/google';

/** Tipografia do design system: Jost (sans, 300–600) e JetBrains Mono (mono, 300–400). */
const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['300', '400'],
});

export const fontVariables = `${jost.variable} ${jetbrainsMono.variable}`;
