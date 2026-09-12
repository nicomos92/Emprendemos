import type { SVGProps } from "react";

type IconComponent = (props: SVGProps<SVGSVGElement>) => React.JSX.Element;

const HomeIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BoxIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path d="m3.5 7 8.5-4 8.5 4-8.5 4-8.5-4Z" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.5 7v10l8.5 4 8.5-4V7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 11v10" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CartIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 8H6" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9.5" cy="20.5" r="1.2" />
    <circle cx="17.5" cy="20.5" r="1.2" />
  </svg>
);

const UsersIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.8 19.5a6.2 6.2 0 0 1 12.4 0" strokeLinecap="round" />
    <circle cx="17" cy="9" r="2.6" />
    <path d="M15.5 13.2a5 5 0 0 1 5.7 4.8" strokeLinecap="round" />
  </svg>
);

const CashIcon: IconComponent = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 9v.01M18 15v.01" strokeLinecap="round" />
  </svg>
);

export interface NavLink {
  href: string;
  label: string;
  icon: IconComponent;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Inicio", icon: HomeIcon },
  { href: "/products", label: "Productos", icon: BoxIcon },
  { href: "/ventas", label: "Ventas", icon: CartIcon },
  { href: "/customers", label: "Clientes", icon: UsersIcon },
  { href: "/cash", label: "Caja", icon: CashIcon },
];
