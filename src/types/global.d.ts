import 'react';

declare module 'react' {
  interface ImgHTMLAttributes<T> {
    fetchpriority?: string;
  }
}
