import type { ServiceIcon as ServiceIconName } from '@bv/shared';
import type { SVGProps } from 'react';

/**
 * Ícones de linha do design system: traço fino e constante (1,5 px em 24 px),
 * cantos retos. A marca não tem conjunto próprio — estes cobrem o site.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const Svg = ({ size = 24, children, ...props }: IconProps & { children: React.ReactNode }) => (
  <svg
    aria-hidden="true"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="square"
    strokeLinejoin="miter"
    {...props}
  >
    {children}
  </svg>
);

const SERVICE_PATHS: Record<ServiceIconName, React.ReactNode> = {
  WEB: (
    <>
      <rect x="3" y="4" width="18" height="16" />
      <path d="M3 8.5h18M6 6.25h.01M8.5 6.25h.01" />
    </>
  ),
  API: <path d="M8 4H6v5l-2 3 2 3v5h2M16 4h2v5l2 3-2 3v5h-2" />,
  DATABASE: (
    <>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="2.5" />
      <path d="M4.5 5.5v13c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-13M4.5 12c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5" />
    </>
  ),
  INTEGRATION: (
    <>
      <rect x="3" y="9" width="6" height="6" />
      <rect x="15" y="3" width="6" height="6" />
      <rect x="15" y="15" width="6" height="6" />
      <path d="M9 12h3V6h3M12 12v6h3" />
    </>
  ),
  AUTOMATION: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
  MOBILE: (
    <>
      <rect x="6" y="2.5" width="12" height="19" />
      <path d="M10.5 18.5h3" />
    </>
  ),
};

export const ServiceIcon = ({ icon, ...props }: IconProps & { icon: ServiceIconName }) => (
  <Svg {...props}>{SERVICE_PATHS[icon]}</Svg>
);

/** Espaço de imagem vazio (projeto sem capa). */
export const ImageIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" />
    <path d="m3 16 5-5 4 4 3-3 6 6" />
    <circle cx="15.5" cy="8.5" r="1.25" />
  </Svg>
);

export const WhatsappIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z" strokeLinejoin="round" />
  </Svg>
);

export const MailIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" />
    <path d="m3 7 9 6 9-6" />
  </Svg>
);

export const InstagramIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <path d="M17.5 6.5h.01" />
  </Svg>
);

export const LinkedinIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" />
    <path d="M8 10v7M8 7v.01M12 17v-4a2.5 2.5 0 0 1 5 0v4M12 10v7" />
  </Svg>
);

export const GithubIcon = (p: IconProps) => (
  <Svg {...p}>
    <path
      d="M9 19c-4 1.3-4-2-6-2.5M15 21v-3.4c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 2.9 5.4 3.2 5.4 3.2a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.6c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Svg>
);

export const StarIcon = ({ filled = true, ...p }: IconProps & { filled?: boolean }) => (
  <Svg {...p} fill={filled ? 'currentColor' : 'none'} strokeWidth={filled ? 0 : 1.5}>
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" />
  </Svg>
);

export const DragHandleIcon = (p: IconProps) => (
  <svg aria-hidden="true" width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24" fill="currentColor" {...p}>
    {[6, 12, 18].flatMap((y) => [9, 15].map((x) => <rect key={`${x}-${y}`} x={x - 1.25} y={y - 1.25} width="2.5" height="2.5" />))}
  </svg>
);
