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



declare module '@capacitor/core' {

  export const registerPlugin: any;
  export const Capacitor: any;
}

declare module '@capacitor/app' {
  export const App: any;
}

declare module '@capacitor/filesystem' {
  export const Filesystem: any;
  export const Directory: any;
  export const Encoding: any;
}

declare module '@capacitor/local-notifications' {
  export const LocalNotifications: any;
}

declare module '@capacitor-mlkit/barcode-scanning' {
  export const BarcodeScanner: any;
}

declare module '@aparajita/capacitor-secure-storage' {
  export const SecureStoragePlugin: any;
}


