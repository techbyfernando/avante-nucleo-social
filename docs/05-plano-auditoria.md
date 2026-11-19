# Auditoria independente — critérios e evidências

Preparado em 17/11/2026. Este documento é um plano e uma revisão das evidências da reprodução; não declara a landing personalizada aprovada antes dos testes finais.

## Portão da Etapa 3: revisado

O relatório `research/reference-validation.json` contém **41 casos** em 1440×1000, 768×1024 e 390×844 e marca `passed: true`. Verificação independente dos valores: **39 casos com zero pixels divergentes**; dois casos de menu com **18 pixels** divergentes cada. Máximo: **0,005468465184104995%**, no menu de 390×844. Todas as posições de conteúdo e transição da abertura têm zero divergência nesse protocolo.

O REA registra navegação inicial, estabilização, abertura do menu, fechamento do menu e abertura do primeiro FAQ com status `completed`. Evidência: `ev_2094dfea29c11495a7fba5a19294f1407895acef1e8e3af4936f55592fce7c05` em `research/rea-template-evidence.json`. O navegador do provedor foi encerrado.

O teste usa os mesmos bytes de imagens e fontes e sincroniza as animações de relógio em 5 segundos. As animações ligadas ao scroll permanecem na posição medida. Isso permite concluir fidelidade dos estados registrados e preservação dos scripts, mas não equivale a testar cada instante de animação, cada entrada possível ou todos os navegadores. O relatório não mede performance da versão Avante.

## Critérios obrigatórios da página final

| Área | Critério verificável | Evidência esperada |
|---|---|---|
| Identidade | Logo mantém proporções, desenhos e cores; Poppins; tokens #0A4049, #FE8B05, #E8F1F2 | Inspeção visual, CSS e relatório de marcas |
| Vetor | SVG aceito contém paths reais, sem raster embutido; rasterização comparada à fonte | SVG audit e comparação registrada; limitação por marca quando necessário |
| Conteúdo | Explica abordagens em centros comerciais, território, demandas, rede e treinamentos | Leitura integral contra `01-avante-institucional.md` |
| Limites institucionais | Sem ONG/OSC, programas de voluntariado, doação, certificações ou resultados inventados | Revisão humana do texto |
| Indicadores | 2020, 5.000 atendimentos e 10 núcleos apenas com contexto fiel; período ausente explicitado | Texto visível, sem contagem de pessoas únicas inventada |
| Parceiros | Exatamente dez marcas oficiais únicas, reconhecidas como clientes publicados; sem patrocinadores fictícios | Manifesto e nomes acessíveis |
| Carrossel | Movimento contínuo sem salto, sem distorção, duplicatas fora da árvore acessível; pausa e movimento reduzido | Teste visual e leitura DOM/CSS |
| Fotografia | Sem retratos em primeiro plano; imagens documentais não falsificam acontecimentos | Revisão visual de todas as seções |
| Vídeo | Mantém `e_FMUXOr1yQ`; botão abre player; iframe tem título; alternativa YouTube | Teste real de reprodução ou relato preciso do bloqueio externo |
| Links | Âncoras existentes, WhatsApp 5511947446597, telefone +551126850301, e-mail oficial | Validação automática e amostra de interações |
| Formulário | Não anuncia envio sem entrega; fluxo explícito se apenas prepara WhatsApp/email | Teste de dados inválidos, válidos e destino |
| Menu | Abre/fecha por botão, Escape, link; foco coerente; teclado não acessa fundo durante overlay | Playwright em mobile, teclado |
| Responsividade | Sem overflow horizontal da página, sobreposição de texto, corte de CTA ou conteúdo essencial | Capturas em 390, 768 e 1440 px, mais 320 px de largura |
| Movimento | Conteúdo completo com `prefers-reduced-motion`; carrossel fica estático/navegável | Contexto Playwright com reducedMotion: reduce |
| Acessibilidade | H1 único, hierarquia coerente, alt, foco visível, nomes de controles, contraste e tamanho de alvo | axe + revisão de teclado/visual; não alegar certificação WCAG |
| Performance | Imagens proporcionais e responsivas, dimensões explícitas, lazy fora do hero, player sob demanda | Rede, bytes, Lighthouse mobile ou medição equivalente |
| Resiliência | Nenhum asset 404, erro JS ou link de demonstração; página legível sem JS | Console/rede e inspeção sem JS |
| Proveniência | Referência permanece intacta; modificações e limites documentados | CHANGELOG, relatórios e manifestos |

## Ferramenta estática preparada

`node scripts/audit-content.mjs` inspeciona a página final com Cheerio e grava `research/content-audit.json`. Não foi executada antes da existência de `index.html`. O script verifica conteúdo obrigatório, dados de contato, ID do vídeo, âncoras, idioma, metadados, imagens locais e rótulos de parceiros. Aponta termos que exigem revisão editorial sem tratar toda ocorrência como erro: mencionar que um programa não existe, por exemplo, não é uma alegação de existência.

Essa análise estática não comprova que um vídeo foi reproduzido, que o WhatsApp enviou mensagem, que o SVG é fiel, que a animação é suave ou que a página atende WCAG. Esses resultados precisam de observação de navegador e inspeção humana. Testes de contato não devem enviar mensagens reais ao cliente.
