# Template: engenharia reversa e reprodução

Fonte visual: https://fitness-website-template-for-vibe-coding-free-html-v1.21st.app/
Fonte de código identificada no próprio HTML: https://github.com/8bsite/fitness-website-template
Licença: MIT para código; créditos de fotografias e fontes preservados em `reference/CREDITS.md`.

## Identidade da captura

O HTML efetivamente servido pela referência foi salvo integralmente em `research/template-original.html`. SHA-256: `d1b98e04da70d7870a84981bbf623ca8c827c9fa9fa9f5fb2f98249cfd7835a3`.
O repositório mais recente tem hash diferente, portanto a reprodução usa a versão da URL solicitada. A única transformação em `reference/index.html` é a localização dos 30 recursos públicos em `reference/assets`. O manifesto inclui URL, tipo, bytes e SHA-256.

## Estrutura e comportamento observados

- HTML único com CSS em camadas tokens/base/atoms/layout/sections/scenes e scripts inline. Sem React, GSAP, Lenis ou biblioteca de animação na versão fornecida. O repositório oferece outra variante GSAP; ela não é a referência escolhida.
- Geist 400–600; oito tokens de cor; slides brancos, escuros e claros, cantos com cruzes, esferas, órbitas e fotos dessaturadas.
- Navegação fixa em cápsula que se recolhe no scroll descendente e retorna ao subir; menu sobreposto até 900 px; Escape fecha.
- Abertura em duas telas: primeiro slide sticky, título em três linhas deslocadas, zoom/pan de foto e órbita contínua. A segunda tela sobrepõe um manifesto claro.
- Método com três etapas e chips circulares que entram nas linhas do título.
- Colagem de oito tiles que saem de uma pilha inclinada e se distribuem pelo scroll.
- Quatro retratos em alturas alternadas, com foco e órbitas.
- Lente circular com quatro notas orbitando; zoom e expansão ligados ao scroll.
- Sequência horizontal com sticky, distância medida por ResizeObserver e inclinação transitória conforme velocidade.
- Depoimento principal grande, notas menores e entrada lateral.
- Janela com esfera descendente, mudança de céu e fotografia inferior.
- Três colunas com regras, destaque central, órbita e revelação escalonada.
- FAQ com `details/summary` nativos e esfera acompanhando o percurso vertical.
- Contato com título que percorre uma linha; formulário da demonstração apenas exibe mensagem e não envia dados.
- Footer com wordmark largo e animação de entrada.

As classes e `data-8b-*` são contratos entre estilos, scripts e marcação. A adaptação preservará esses contratos. Os pontos principais de responsividade são 767, 900 e 1100 px. Sem suporte a scroll-driven animations ou com movimento reduzido, o template oferece disposição estática e rolagem horizontal manual.

## REA utilizado

Repositório solicitado clonado em `tools/rea`; skills `reverse-engineer-anything`, `rea-tool-design` e `rea-changelog-update` lidas. CLI disponível no registro: **6.7.0**; checkout do repositório: **6.9.0**. A interface instalada foi inspecionada antes de invocar o cenário.

Evidência real: `research/rea-template-evidence.json`, operação `capture_browser_scenario`, provedor `rea-playwright-browser-scenario`, ID `ev_2094dfea29c11495a7fba5a19294f1407895acef1e8e3af4936f55592fce7c05`. Cenário declarado em `research/rea-template-scenario.json`: viewport 390×844, espera de estabilização, abrir menu, fechar menu, abrir primeira pergunta. O navegador temporário foi encerrado pelo provedor.

`rea-tool-design` foi aplicada à seleção e validação do contrato de captura, distinguindo observação estática e execução real; não foi necessário modificar o REA. `rea-changelog-update` orienta inventário, proveniência e notas por resultado. Como este projeto não é uma release do REA, não foram fabricados PRs/tags/contribuidores nem alterados seus metadados de publicação. As alterações desta landing são registradas no `CHANGELOG.md` local com evidências e limites.

## Protocolo de fidelidade

`npm run test:reference` abre a URL original e a cópia local no mesmo Chromium, com viewport e device scale iguais. Ambos recebem exatamente os mesmos bytes públicos de fontes e imagens, eliminando variações de negociação e rede. Mantém-se o HTML original obtido ao vivo.

Resoluções: 1440×1000, 768×1024, 390×844. Capturas no topo, transição da abertura, início de cada seção e menu em tablet/mobile. Efeitos de relógio são pausados na mesma fase (5 segundos); animações de scroll continuam na posição medida. São gravados original, local e diff PNG para cada posição.

Primeira rodada identificou divergências temporais no pan da foto e esfera, não alterações de estilo. Relatório preservado em `research/reference-validation-unsynchronized.json`. O resultado sincronizado está em `research/reference-validation.json`. Nenhuma máscara de conteúdo ou substituição visual é usada. A inspeção de pixels não prova todas as trajetórias intermediárias ou todos os navegadores; execução REA e preservação do código complementam essa evidência.
