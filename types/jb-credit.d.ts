declare namespace JSX {
  interface IntrinsicElements {
    'jb-credit': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      'data-variant'?: 'chip' | 'minimal' | 'text';
      'data-size'?: 'small' | 'default' | 'large';
      'data-align'?: 'left' | 'center' | 'right';
      'data-theme'?: 'auto' | 'light' | 'dark';
      'data-position'?: 'inline' | 'fixed';
    };
  }
}
