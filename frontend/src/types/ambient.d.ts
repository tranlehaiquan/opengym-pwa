/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

declare module '*.mp4' {
  const content: string;
  export default content;
}

declare module 'lean-qr' {
  export function generate(text: string, options?: unknown): unknown;
}

declare module 'jsqr' {
  export default function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: unknown
  ): { data: string } | null;
}

