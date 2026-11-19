# Movimento da seção de frentes — revisão 4

O registro anterior animava todos os `.wk-day` ao mesmo tempo quando o trilho entrava na tela. Os cards 02–05, ainda fora da área horizontal visível, terminavam a animação antes de o visitante alcançá-los. A revisão usa um `ScrollTrigger` vertical para habilitar a sequência quando a seção entra na viewport e um `IntersectionObserver` com raiz `.wk-view` para revelar cada card conforme fica visível no carrossel. Um listener passivo de rolagem horizontal reforça a detecção. A animação é executada uma vez por card.

Cada timeline GSAP coordena superfície, título, parágrafos e mídia em cerca de 720 ms, com deslocamentos de 10–22 px, opacidade inicial mínima de 0,84 e escala inicial 1,035. A mídia nunca cruza o texto. As imagens permanecem visíveis sem JavaScript, pois os estilos iniciais só são aplicados no momento da entrada. Botões recebem leve elevação no hover e compressão ao pressionar; a mídia do card aumenta 2,5% no hover/foco. Os efeitos não movem textos ou layout.

`prefers-reduced-motion` pula Lenis e as animações por meio de `gsap.matchMedia()`. Os listeners de feedback usam `AbortController`; o observador é desconectado no cleanup do contexto, que também remove ticker e conexão Lenis/ScrollTrigger. A lógica é compatível com a versão estática e a rota Next, pois atua sobre os mesmos seletores DOM sem acoplar estado ao React.

Validação: `node --check public/assets/experience.js` passou. Em Playwright local a 390 px, o primeiro card chegou a opacidade 1 após entrada vertical, o último chegou a opacidade 1 após rolagem horizontal, 19 gatilhos ScrollTrigger estavam registrados e Lenis estava ativo. A auditoria final deve repetir com as imagens integradas, dois temas e movimento reduzido na versão exportada Next.
