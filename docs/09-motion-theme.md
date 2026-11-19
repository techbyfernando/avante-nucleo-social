# Tema e movimento — camada GSAP

Implementação de `public/assets/experience.js`, etapa de refinamento. A crew Developers/Motion usa o organograma de `Downloads/Fig/WORKSPACE_CODEX_7_CREWS.md` e a skill `C:/Users/FernandodePaulaRodri/.codex/skills/gsap/SKILL.md`. O contrato HyperFrames dessa skill se aplica a composições de vídeo; esta entrega é uma página web e utiliza GSAP/ScrollTrigger diretamente.

## Integração e responsabilidades

- A página carrega GSAP e ScrollTrigger locais antes de `experience.js`.
- O motor de scroll anterior, suas scenes e gate devem ser removidos pelo integrador. Não há uso de Lenis, Framer Motion, pin, scrub ou interceptação de wheel nesta camada.
- `avante.js` continua responsável por menu, formulário, vídeo e carrossel de parceiros.
- O CSS de refinamento pertence à crew Design/Brand. A camada de experiência não escreve folhas de estilo nem altera cores da marca.
- Handoff Developers/Motion → Design: `html[data-theme="light"|"dark"]`, `.theme-toggle`, `.connection-mark` com três `.connection-line`. Linhas e conteúdo devem estar visíveis no CSS padrão, sem depender de JavaScript para aparecer.

## Tema

Chave persistente: **`avante-theme`**. Apenas `light` e `dark` são valores reconhecidos. Sem escolha salva, a página acompanha `prefers-color-scheme`; uma escolha explícita tem prioridade. Eventos `storage` sincronizam outras abas e a remoção da preferência retorna ao sistema. Se o navegador bloquear storage, a troca funciona na sessão atual.

A inicialização antecipada no `<head>` é responsabilidade da página e deve usar a mesma chave antes da primeira pintura. `experience.js` reconcilia esse estado sem alternar por uma paleta intermediária. A troca é imediata, sem animação global de cores. `color-scheme` acompanha o tema para os controles nativos.

Cada `.theme-toggle` recebe `aria-pressed="true"` no tema escuro e um nome de ação: “Ativar tema claro” ou “Ativar tema escuro”. O texto `.sr-only` e o atributo `title` acompanham o nome. Os ícones `.icon-sun` e `.icon-moon` são apresentados pelo CSS conforme `data-theme`, sem troca destrutiva de SVG pelo JavaScript.

## Movimento

- O sinal de conexão do hero abre as três linhas com `scaleX` de 0,14 a 1, em 0,72 s, stagger de 0,11 s e easing `power2.out`. É decorativo e ocupa área reservada pelo layout.
- Blocos e fotos recebem entrada discreta de **18 px no eixo Y**, opacidade de **0,88 a 1**, duração de 0,65 s e stagger de 0,075 s. A opacidade não chega a zero; falha de JS não deixa texto escondido.
- Títulos não são divididos nem deslocados. Nenhum texto percorre o eixo X, nenhuma altura/largura é animada e não há órbitas, esferas ou loop infinito nesta camada.
- As entradas são disparadas uma vez via `ScrollTrigger`, a partir de `top 92%`. Elementos já revelados ficam em `WeakSet` para evitar reapresentação após retorno de histórico ou mudança de preferência.
- `gsap.matchMedia()` cria efeitos somente sem preferência por movimento reduzido. Ao ativar movimento reduzido, o contexto reverte tweens e triggers, preservando o layout estático integral. O carrossel possui sua política independente no CSS/`avante.js`.

## Ciclo de vida e falhas

`pagehide` aborta listeners de tema e reverte o contexto GSAP. `pageshow` com BFCache reativa a experiência, relê a preferência e recria apenas observações ainda necessárias. Os callbacks de fonte/carregamento têm controle de geração para não atualizar um ciclo já descartado. Não há polling nem requestAnimationFrame próprio contínuo.

Se GSAP/ScrollTrigger estiverem ausentes, o tema continua funcional e a página permanece estática. A preferência reduzida é um caminho sem tweens. Nenhuma camada define `opacity:0`, `visibility:hidden` ou estado que dependa de um callback para tornar o conteúdo acessível.

## Fontes e validação

Contratos consultados em documentação oficial: [gsap.matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/), [gsap.context](https://gsap.com/docs/v3/GSAP/gsap.context()/) e [ScrollTrigger.create](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.create()/). A captura final de navegador deve verificar sistema claro/escuro, escolha explícita, reload, storage entre abas, redução de movimento, ausência de GSAP e retorno de histórico.

Limite: este documento registra o comportamento implementado. Só a auditoria após a integração de HTML/CSS/vendors pode confirmar layout, contraste e execução completa. A camada não certifica acessibilidade nem desempenho de dispositivos específicos.
