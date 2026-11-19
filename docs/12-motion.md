# Movimento e rolagem — revisão 3

O script `public/assets/experience.js` usa uma única instância de `gsap.matchMedia()` para ativar movimento apenas quando o sistema não solicita redução. Cada seção recebe uma entrada de título e texto com `translateY` de até 20 px; cards usam até 28 px e entrada escalonada; imagens recebem leve profundidade (escala 1,025 para 1). A opacidade inicial de 0,82 mantém o conteúdo legível se a animação for interrompida. As durações ficam entre 620 e 800 ms, com `power3.out`.

As animações são criadas por `ScrollTrigger` ao entrar na viewport, uma vez por grupo. A linha de conexão do hero permanece em área reservada. Não há pin, scrub de títulos, rotação ou movimento lateral do texto. Os cards no trilho horizontal preservam a rolagem acessível do componente.

`Lenis` usa `autoRaf: false`, rolagem suave apenas no wheel e não assume toque. Seu `raf` recebe o relógio do `gsap.ticker`, e o evento `scroll` chama `ScrollTrigger.update()`. O modo reduzido não cria Lenis nem gatilhos. A instância pode ser inspecionada em `window.__avanteLenis`; `html[data-lenis=active]` identifica a ativação. Sem as bibliotecas, o conteúdo permanece estático e visível.

`gsap.matchMedia().revert()` e o retorno do callback removem tweens, gatilhos, ticker e Lenis em mudança de preferência ou `pagehide`. O `pageshow` restaura a página a partir do BFCache. A montagem é idempotente; o controle de tema do React é respeitado quando `html[data-react-theme]` está presente.
