import Script from 'next/script';

export const metadata = {
  metadataBase: new URL('https://www.avantenucleosocial.com.br'),
  title: 'Avante Núcleo Social | Abordagens sociais e cuidado em rede',
  description: 'Abordagens sociais em centros comerciais, mapeamento de território, encaminhamentos à rede socioassistencial e treinamentos. Conheça a Avante Núcleo Social.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Avante Núcleo Social — O cuidado nos move adiante.',
    images: [{ url: 'https://www.avantenucleosocial.com.br/images/logo.png' }],
  },
  icons: { icon: '/assets/brand/favicon.ico', apple: '/assets/brand/apple-touch-icon.png' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" data-react-theme="true" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0A4049" />
        <link rel="stylesheet" href="/assets/site.min.css" />
        <link rel="preload" href="/assets/fonts/poppins-regular.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('avante-theme');document.documentElement.dataset.theme=t==='light'||t==='dark'?t:matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}catch(e){document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'}document.documentElement.style.colorScheme=document.documentElement.dataset.theme;` }} />
        <Script src="/assets/vendor/gsap.min.js" strategy="beforeInteractive" />
        <Script src="/assets/vendor/ScrollTrigger.min.js" strategy="beforeInteractive" />
        <Script src="/assets/vendor/lenis.min.js" strategy="beforeInteractive" />
      </head>
      <body>
        {children}
        <Script src="/assets/avante.min.js" strategy="afterInteractive" />
        <Script src="/assets/experience.min.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
