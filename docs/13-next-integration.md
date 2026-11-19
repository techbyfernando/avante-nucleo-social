# Integração incremental React/Next.js

A landing institucional validada permanece gerada em `index.html` por `scripts/adapt-avante.mjs`. A rota Next (`app/page.jsx`) lê esse HTML no build e renderiza suas seções como elementos React no servidor. Esse arranjo preserva copy, marcas, metadados de conteúdo, classes, âncoras, vídeo e componentes existentes sem reescrever treze seções à mão.

`components/ThemeToggle.jsx` é um componente cliente que assume o estado do tema na exportação Next. O tema segue a preferência do sistema na primeira visita, permite escolha persistida em `localStorage` e sincroniza outras abas. O HTML gerado pela via anterior conserva seu controle original como fallback. `experience.js` detecta `html[data-react-theme]` para não registrar um segundo listener nesse controle.

`app/layout.jsx` carrega os CSS e os scripts locais de GSAP, ScrollTrigger e Lenis antes da experiência e a lógica de menu, vídeo e motion após a hidratação. A saída `out/` é estática (`output: 'export'`). O Next não executa seu otimizador de imagens em runtime nesse modo; por isso as fontes devem ser pré-processadas com Sharp em WebP/AVIF responsivos, com `srcset`, `sizes` e lazy loading conforme o elemento. O projeto mantém o build legado `dist/` para comparação e reversibilidade.

Comandos: `npm run dev:next`, `npm run build:next`. O teste de navegador da exportação confirmou 13 seções, troca e persistência do tema React, GSAP e Lenis ativos, e nenhum erro de página em 390 px. Refaça o build Next após regenerar `index.html` ou trocar imagens.

Dependências e abordagem conferidas na [documentação oficial de instalação](https://nextjs.org/docs/app/getting-started/installation) e [exportação estática](https://nextjs.org/docs/app/guides/single-page-applications).
