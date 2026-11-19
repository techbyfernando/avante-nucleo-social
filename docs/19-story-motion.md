# Storytelling vinculado ao scroll

A seção `#story-journey` foi acrescentada entre treinamentos e a sequência de atuação. O texto conecta território, necessidade e ação com conceitos presentes no conteúdo oficial, sem criar projetos ou resultados. Os caracteres têm marcação própria e rótulo acessível único no título; a folha de estilo os deixa visíveis por padrão.

Com JavaScript e movimento permitido, GSAP define opacidade inicial de 0,72 e ScrollTrigger revela os caracteres conforme a rolagem, usando `scrub: 0.25`, `start: top 40%`, `end: bottom bottom`, `stagger: 0.04`, `duration: 0.4`. A linha de progresso e os três marcos acompanham a mesma timeline. A opacidade inicial foi elevada após o Lighthouse detectar contraste insuficiente em estados intermediários. A seção permanece em viewport por meio de `position: sticky`; Lenis e ScrollTrigger compartilham o ticker existente. O contexto GSAP é revertido no cleanup. Em movimento reduzido ou sem JavaScript, o texto aparece completo e a seção deixa de usar sticky.

Playwright no export Next em 320/390/768/1440/1920 px mediu opacidade média inicial 0,72, intermediária 0,96–0,98 e final >0,999, sem erros JS. Movimento reduzido manteve média 1. Evidências e capturas estão em `research/final-v5/`.
