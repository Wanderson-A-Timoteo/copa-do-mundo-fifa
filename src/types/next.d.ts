/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'next/server' {
  export class NextRequest extends Request {
    cookies: any;
    nextUrl: any;
  }
  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static next(init?: any): NextResponse;
    static redirect(url: string | URL, init?: number | ResponseInit): NextResponse;
    cookies: any;
  }
}
declare module 'next/navigation' {
  export function usePathname(): string;
  export function useRouter(): any;
  export function useParams(): any;
  export function redirect(url: string): void;
  export function notFound(): never;
}
declare module 'next/image' {
  export default function Image(props: any): any;
}
declare module 'next/link' {
  import React from 'react';
  export default function Link(props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string | object; prefetch?: boolean }): any;
}
declare module 'next/font/google' {
  export function Geist(options: any): any;
  export function Geist_Mono(options: any): any;
}
declare module 'next' {
  export type Metadata = any;
  export type NextConfig = any;
}
declare module 'next/types.js' {
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
}
declare module 'next/server.js' {
  export type NextRequest = any;
}
declare module 'next/dist/shared/lib/app-router-context.shared-runtime' {
  export const LayoutRouterContext: any;
}
