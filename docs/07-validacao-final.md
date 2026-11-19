# Validação final — Avante Núcleo Social

## Etapas e evidências

1. **Instituição:** captura integral da landing oficial, CSS, imagens, marcas, contatos, vídeo, clientes e limites das informações em `docs/01-avante-institucional.md`.
2. **Reprodução:** `reference/index.html` mantém conteúdo, layout e scripts do template da URL solicitada; assets localizados com hashes. Engenharia reversa em `docs/02-engenharia-reversa.md`.
3. **Fidelidade:** 41 comparações em 1440×1000, 768×1024 e 390×844. 39 sem pixels divergentes; dois menus com 18 pixels divergentes cada. Máximo **0,005468%**. Screenshots em `research/comparisons/`; relatório `research/reference-validation.json`. Capturas sincronizam animações de relógio e mantêm scroll equivalente. Cenário REA confirmou menu e FAQ.
4. **Personalização:** identidade Poppins/#0A4049/#FE8B05/#E8F1F2 preservada, conteúdo substituído, vídeo e parceiros adicionados; referência permanece intacta. Copy e decisões em `docs/03-comunicacao.md`.
5. **Auditoria:** conteúdo revisado por subagente independente; marca preparada e comparada por subagente; testes de navegador, assets, acessibilidade e produção executados.

## Resultados funcionais

`research/final/audit.json`: aprovado em **375, 390, 768 e 1440 px**. Zero erros JavaScript, zero imagens quebradas, zero overflow horizontal da página, zero títulos ultrapassando suas caixas e zero violações nos critérios Axe WCAG 2/2.1 A/AA testados. Auditoria automatizada não equivale a certificação integral de acessibilidade.

Dez verificações de interação aprovadas: abrir menu, fechar com Escape, navegar pelo menu, abrir/fechar FAQ, rejeitar campos vazios, preparar link WhatsApp sem enviar, respeitar movimento reduzido, pausar carrossel e confirmar largura de repetição contínua. Não houve envio de mensagens durante os testes.

`research/final/production-smoke.json`: build minificada aprovada em 375, 768 e 1440 px com movimento normal e em 390 px sem JavaScript. Navegação por seções, FAQ e ausência de erros/overflow conferidos. Formulário desabilitado sem JS com canais diretos preservados. Treze seções institucionais renderizadas.

## Vídeo real

Iframe original `https://www.youtube.com/embed/e_FMUXOr1yQ?autoplay=1&rel=0`. O teste observou título “Avante Núcleo Social - YouTube”, `readyState: 4`, `currentTime: 6.944106`, `paused: false`, `error: null`. Portanto houve reprodução real, além de presença do iframe. Screenshot em `research/final/video-playback.png`. A disponibilidade futura depende do YouTube e do titular do vídeo.

## Marcas

Logo principal SVG verdadeiro, sem raster embutido ou texto substituído; original mantido. Reconstrução a partir de PNG, não arquivo mestre. Diferenças de antialiasing e métricas em `docs/04-marcas.md`. Favicon oficial preservado. Dez marcas de clientes mantidas em PNG transparente por impossibilidade de vetorizar fielmente os JPEGs pequenos. Sem recoloração, distorção de proporção ou parceiros adicionados.

Carrossel com duas metades de larguras idênticas, translação até -50%, pausa por botão/hover/foco, suspensão fora da tela e fallback estático com rolagem manual em movimento reduzido. Só um grupo de dez logos é exposto à acessibilidade.

## Performance mobile

Lighthouse na **build de produção local**, com throttling mobile padrão: performance **88**, acessibilidade **100**, SEO **100**, boas práticas **81**; FCP 2,3 s, LCP 3,5 s, TBT **0 ms**, CLS **0**, transferência total observada **378 KiB**. Relatórios íntegros: `research/final/lighthouse-mobile.html` e `.json`.

Limitação concreta do ambiente: o navegador recebeu um script de inspeção do antivírus Kaspersky externo ao projeto, com cerca de 127 KB. As oportunidades de JavaScript não minificado, código legado e grande parte do JS não utilizado apontam para esse script, que **não está no código entregue**. A medição é em HTTP local; HTTPS de produção não foi avaliado. Não removemos essas condições do resultado nem apresentamos uma estimativa como medição real. Repetir Lighthouse no domínio final HTTPS após publicação é necessário para medir a hospedagem real.

Otimizações entregues: WebP com variantes responsivas e sem upscaling, lazy loading, vídeo sob demanda, fontes locais de aproximadamente 16 KB cada, CSS/JS minificados na build, compressão no servidor de preview, ausência de dependências JavaScript de produção e animações fora do ciclo de render de framework. `npm audit --omit=dev` não identificou vulnerabilidades de produção.

## Limites de entrega

- Validado em Chromium 157 no Windows, com emulação de tamanhos e touch; não em dispositivos físicos ou Safari/Firefox reais.
- Não publicado em domínio externo. Nenhum DNS, hospedagem ou site atual foi alterado.
- Números, vínculos e relatos são os publicados na fonte oficial consultada, sem confirmação administrativa adicional.
- Não há backend de captação: contato via canais oficiais/WhatsApp, explicitado na interface.
- Fidelidade pixel a pixel se refere à reprodução sem personalização. A versão Avante conserva composição e motor de movimento, com diferenças institucionais intencionais documentadas.
