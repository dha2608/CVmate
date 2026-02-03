declare module '@radix-ui/react-dialog' {
  export const Dialog: any;
  export const DialogContent: any;
  export const DialogOverlay: any;
}

import 'react';

declare module 'react' {
  interface ImgHTMLAttributes<T> {
    fetchpriority?: string;
  }
}
