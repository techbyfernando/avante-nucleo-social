# Marcas oficiais e limites de vetorização

Preparação de assets em 17/11/2026. Aplicada a skill `tools/logo-design-skill/skills/logo-design/SKILL.md`, modo **Assets**, com inspeção, comparação de renderização e auditoria de SVG. Não houve criação de conceito, redesign ou substituição tipográfica. Os scripts Python do repositório não foram executados: o ambiente não disponibilizou um interpretador Python funcional; as verificações pertinentes foram realizadas em Node/Sharp.

## Avante

- Fonte: https://www.avantenucleosocial.com.br/images/logo.png
- Original preservado byte a byte: `public/assets/brand/avante-original.png`.
- SVG verdadeiro: `public/assets/brand/avante.svg`; um path, sem imagem embutida, sem texto vivo, sem filtros; cor original `#E8F1F2`; proporção original 380 × 80.
- O caminho equivalente `images/logo.svg` não forneceu vetor: respondeu HTTP 302 para a página inicial. Esse teste não prova ausência de um arquivo mestre em outros canais.
- A marca PNG é monocromática com transparência. A silhueta foi vetorizada via Potrace a partir do canal alfa ampliado em 8×. Vinte combinações de limiar e curvatura foram comparadas; foi selecionada a de menor diferença média de alfa. Não se recompôs a assinatura com uma fonte aproximada.
- Comparação antes da otimização: interseção/união da máscara a 50% de alfa de **98,45%**; 125 pixels binários divergentes em 30.400; erro absoluto médio de alfa **3,04/255**. A diferença se concentra no antialiasing e nos contornos de letras pequenas. O SVG é uma reconstrução vetorial do PNG disponível, não o arquivo mestre original nem uma equivalência matemática perfeita.
- Otimização SVGO: aproximadamente **30,4 kB**, ante 63,0 kB do traçado. Arquivo mestre raster disponível para substituição se o cliente preferir correspondência pixel a pixel.
- Aplicar a marca clara sobre fundo verde-petróleo, preservando o preenchimento; não aplicar filtros CSS de recoloração. Conservar espaço livre ao redor e proporção automática. A assinatura pequena requer tamanho suficiente para leitura.
- Inspeção visual: `research/brand-validation/logo-comparison.png` (original acima; SVG abaixo). Métricas: `logo-comparison.json`, `trace-iterations.json`, `svg-audit.json` e manifesto de marca.

## Favicon

Reutilizados **sem alteração** o favicon ICO, PNG de 32 px e apple-touch-icon oficiais, em `public/assets/brand/`. Nenhum símbolo foi redesenhado. O símbolo e a lança oficiais em PNG também estão disponíveis nessa pasta para uso gráfico institucional.

## Parceiros / clientes

Somente as dez marcas listadas na seção “Nossos Clientes” da fonte oficial foram incluídas. A seção da landing pode se chamar “Nossos Parceiros”, acompanhada da explicação de que são empreendimentos apresentados como clientes no site institucional; não caracterizar como doadores ou patrocinadores.

Todos os arquivos fornecidos pelo site são JPEG pequenos, de **166 × 106 px**, com compressão e detalhes finos. Não há informação vetorial recuperável com fidelidade garantida. Conforme a exceção autorizada no pedido, os **originais foram preservados** em vez de simular SVGs contendo raster ou redesenhar letras.

| Marca | Original preservado | Derivado transparente | Limitação específica |
|---|---|---|---|
| Internacional Shopping | `internacional-original.jpg` | `internacional.png` | Serifas e assinatura muito pequenas; ruído JPEG |
| Bourbon Shopping | `bourbon-original.jpg` | `bourbon.png` | Curvas finas do símbolo floral e assinatura pequena |
| Jardim Sul Shopping | `jardim-sul-original.jpg` | `jardim-sul.png` | Letras finas e contornos suavizados pelo JPEG |
| Santana Parque | `santana-parque-original.jpg` | `santana-parque.png` | Assinatura cinza muito clara; não aumentar contraste nem recolorir |
| Campo Limpo Shopping | `campo-limpo-original.jpg` | `campo-limpo.png` | Desenho multicolorido e pequenos caracteres |
| Shopping Metrô Santa Cruz | `metro-santa-cruz-original.jpg` | `metro-santa-cruz.png` | Selo, contornos e texto interno minúsculo |
| Mooca Plaza Shopping | `mooca-plaza-original.jpg` | `mooca-plaza.png` | Folhagem detalhada e lettering fino |
| Itapecerica Shopping | `itapecerica-original.jpg` | `itapecerica.png` | Símbolo e texto branco interno sobre verde |
| Shopping Center Norte | `center-norte-original.jpg` | `center-norte.png` | Blocos coloridos e assinatura pequena |
| West Plaza Shopping | `west-plaza-original.jpg` | `west-plaza.png` | Nome e assinatura com baixa resolução |

Pastas relativas da tabela: `public/assets/partners/`. Em cada PNG derivado, foi removido somente o fundo quase branco (RGB ≥253) conectado às bordas por flood fill. Os valores RGB dos demais pixels não foram alterados; áreas brancas fechadas dentro da marca foram preservadas. Há resíduos de antialiasing branco do JPEG, portanto usar **superfície branca** e dimensões próximas das nativas. Não ampliar essas marcas para uso em impressão ou telas de grande escala.

Manifesto com URLs, dimensões, hashes SHA-256 dos originais, número de pixels externos transparentes e limites por marca: `public/assets/partners/manifest.json`. Manifesto agregado: `public/assets/brand/manifest.json`.

## Reprodução

Dependências de vetorização e otimização foram instaladas em `tools/brand-work` (prefixo isolado; `package.json` raiz não alterado). Scripts: `scripts/prepare-brand.mjs`, `scripts/refine-brand-trace.mjs`, `scripts/optimize-brand.mjs`. Executar nesta ordem. A landing deve usar os assets finais de `public/assets/`, sem depender das ferramentas de preparação em runtime.
