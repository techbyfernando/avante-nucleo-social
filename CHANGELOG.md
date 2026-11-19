# Registro de alterações — Avante Núcleo Social

## [1.4.1] — 2026-11-18 — alinhamento dos parceiros e preparação de publicação

- Centralizados título, chamada e descrição da seção de parceiros.
- Validado em Playwright nas larguras 320, 375, 390, 430, 768 e 1440 px: alinhamento, ausência de overflow e carregamento da marca como SVG verdadeiro (`image/svg+xml`) com ícones vetoriais sem emoji.
- Build padrão direcionado à exportação Next.js para a Vercel; arquivos de pesquisa e saídas geradas excluídos do repositório de publicação.
- A verificação também passou no WebKit com emulação de iPhone; teste em aparelho físico não disponível no ambiente.

## [1.4.0] — 2026-11-18 — storytelling e carrossel contínuo

- Substituída a fotografia de treinamento indicada por nova cena ilustrativa sem rostos em destaque, com AVIF/WebP responsivos. O mestre 3840 × 2160 é ampliação de original 1672 × 941, sem detalhe 4K nativo.
- Removido o botão de pausa dos parceiros; preservado loop linear contínuo com duas cópias iguais e alternativa manual para movimento reduzido. Marcas sem mestre vetorial fiel permanecem raster transparente.
- Investigado o comportamento público de scroll da HM Consultoria com bundle e REA; adicionada seção institucional com caracteres revelados por GSAP/ScrollTrigger diretamente durante a rolagem, integrada ao Lenis e com fallback acessível.
- Registradas evidências de origem, limites e validação em `docs/17-hm-scroll.md`, `docs/18-partners.md`, `docs/19-story-motion.md` e `research/final-v5/`.

## [1.3.0] — 2026-11-18 — frentes ilustradas e motion contextual

- Substituídos os ícones dos cinco cards da sequência de atuação por fotografias ilustrativas inéditas e específicas para território, abordagem, necessidades, rede e equipes. Cada card usa AVIF/WebP responsivo e carregamento tardio.
- Coordenada a revelação individual de texto e imagem conforme o card entra na área visível do carrossel; adicionados estados de interação discretos com GSAP, mantendo Lenis/ScrollTrigger e preferência por movimento reduzido.
- Auditadas todas as mídias; fontes oficiais, imagens sintéticas e limitações são identificadas em `docs/16-image-audit.md` e `docs/11-imagens.md`.
- Os novos mestres 3840 × 2160 são ampliações de originais 1672 × 941 do gerador, sem detalhe 4K nativo.

## [1.2.0] — 2026-11-18 — cenas novas e scroll progressivo

- Seis novas cenas ilustrativas integradas em abertura, atuação, treinamento, acessibilidade e vídeo, com variantes AVIF/WebP responsivas. Mestres 3840 × 2160 são ampliações dos arquivos gerados a 1672 × 941; não equivalem a detalhe 4K nativo.
- Restauradas entradas progressivas por seção com GSAP e ScrollTrigger; Lenis sincroniza a rolagem quando o movimento é permitido, com limpeza de listeners e fallback estático.
- Adicionada estrutura Next.js/React de migração incremental, mantendo conteúdo institucional e versão estática. O controle de tema usa estado React na rota Next.
- Ampliado QA para imagens, rolagem, movimento reduzido, interações e responsividade; evidências em `docs/13-qa-v3.md`.

## [1.1.0] — 2026-11-18 — composição, conteúdo e tema

- Substituída a animação da bola por três traços de conexão em área reservada, com GSAP e respeito a movimento reduzido. Removidos movimentos antigos que cruzavam textos e cards.
- Reorganizados hero, títulos, cards e transições entre seções; adicionado tema escuro institucional com preferência de sistema, controle no cabeçalho e persistência local.
- Publicados na landing os dois depoimentos completos extraídos do site oficial, com botão interno. Preservados vídeo, marcas e canais oficiais.
- Geradas cenas ilustrativas de território e acolhimento, declaradas como sintéticas e servidas em WebP responsivo. Os arquivos de 3840 × 2160 são ampliações de originais 1672 × 941, sem alegação de 4K nativo.
- Descartada a imagem sintética de treinamento rejeitada pelo cliente; mantido o registro fotográfico oficial nessa seção.
- Adicionada auditoria Playwright nas oito larguras solicitadas e dois temas, com Lighthouse mobile. Resultados e limitações em `docs/10-qa-v2.md`.

## [1.0.0] — 2026-11-17 — adaptação institucional e validação local

### Highlights
- Landing Avante concluída após aprovação de 41 comparações da reprodução; referência sem personalização preservada.
- Identidade oficial aplicada com Poppins, verde-petróleo, laranja, logo vetorial e favicon original.
- Vídeo institucional original reproduzido em teste; carrossel contínuo com os dez clientes oficialmente identificados.

### Changes
- Substituídos todos os textos e imagens fitness por apresentação, frentes de atuação, treinamentos, metodologia explicativa, indicadores contextualizados, depoimentos reais e formas de contato.
- Mantidos os componentes e cenas de movimento da referência, incluindo colagem, órbitas, lente, sequência horizontal, FAQ e transições de título.
- Adicionados vídeo sob demanda e seção de parceiros com pausa por botão/hover/foco e preferência de movimento reduzido.
- Reduzidos retratos em primeiro plano usando ambientes e treinamento oficiais, ilustrações funcionais, WebP responsivo e lazy loading. Não foram necessárias imagens sintéticas.
- Preparado SVG verdadeiro da marca a partir do PNG oficial com comparação documentada; parceiros preservados em raster transparente devido à baixa resolução dos originais.
- Formulário prepara WhatsApp para revisão/envio do visitante, com validação e link alternativo; não simula envio a backend.
- Navegação com Escape, ciclo de foco, conteúdo de fundo inert, retorno de foco e navegação por âncoras; botão de contato desabilitado sem JS com canais diretos disponíveis.
- Acrescentados metadados, dados estruturados institucionais, build estática minificada, compressão do servidor de preview, documentação de manutenção e créditos.
- Testes estáticos, Axe/Playwright em quatro larguras, smoke da produção com movimento normal e fallback sem JS, além de Lighthouse mobile.

### Fixes
- Ajustados encaixe dos títulos, contraste dos elementos de sequência e contraste da abertura.
- Corrigida nota de indicadores para expor ausência de informação sobre pessoas únicas, sem inferir um dado não publicado.
- Corrigido nome acessível do botão do vídeo para incluir o rótulo visível.
- Corrigido fallback sem JS do formulário para impedir envio GET com destinatário incompleto.

### Limites verificados
- Parceiros sem SVG mestre permanecem raster; logo Avante vetorizada apresenta diferenças de antialiasing mensuradas.
- Lighthouse local: performance 88, acessibilidade 100, boas práticas 81, SEO 100, CLS 0 e TBT 0 ms; script de antivírus externo ao projeto e HTTP local registrados no relatório, sem extrapolação para produção HTTPS.
- Entrega local, sem publicação, alteração de domínio ou backend de captação. Validação em Chromium com viewports simulados, não em todos os navegadores/dispositivos físicos.

Proveniência: `docs/03-comunicacao.md`, `docs/04-marcas.md`, `docs/06-auditoria-conteudo.md`, `docs/07-validacao-final.md`, `research/content-audit.json`, `research/final/audit.json`, `research/final/production-smoke.json`, `research/final/lighthouse-mobile.json`.

Checkouts utilizados: REA `2cc7f01731e5049f4b5d0d9b338050caf5c13d94`; logo-design-skill `e9eaddc07895575253d6663320354a708f53e955`; template-source `398d92e23e7541060179c402cd39078ac283d052`. O HTML servido pela referência, e não o HEAD mais recente, é a base visual validada. CLI REA executada: 6.7.0.

## [0.1.0] — 2026-11-17 — pesquisa e referência

### Highlights
- Documentada a atuação institucional, identidade e limites das fontes oficiais antes da implementação.
- Preservada uma reprodução independente do template solicitado em `reference/`.

### Changes
- Capturados HTML/CSS e 30 assets oficiais da Avante, incluindo o vídeo identificado como `e_FMUXOr1yQ`.
- Clonados os repositórios REA, logo-design-skill e a fonte pública do template; preservadas licença e atribuições.
- Criados manifesto de recursos, cenário REA e comparação Playwright em três resoluções.

### Fixes
- Uso do armazenamento de certificados do sistema para downloads HTTPS verificados.
- Servidor dentro do processo de comparação para evitar isolamento de rede entre processos do ambiente.
- Sincronização da fase de animações contínuas para evitar falsos positivos na comparação visual.

Proveniência: `docs/01-avante-institucional.md`, `docs/02-engenharia-reversa.md`, `research/rea-template-evidence.json`, `research/reference-validation.json`.
