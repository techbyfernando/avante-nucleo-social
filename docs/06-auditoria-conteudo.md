# Auditoria independente de conteúdo e contratos

Revisão em 17/11/2026 de `index.html`, `public/assets/avante.css`, `public/assets/avante.js`, levantamento institucional e documentação de marcas. Não foram alterados os arquivos de implementação.

## Resultado automatizado

`node scripts/audit-content.mjs` executado na página integrada. Os critérios estáticos passaram: idioma pt-BR, metadados, um H1, identificação da Avante, serviços reais, número e e-mail oficiais, ID `e_FMUXOr1yQ`, ausência de textos fitness e placeholders, IDs únicos, âncoras existentes, links com destino e rel correto, imagens locais presentes com alt e dimensões, favicon e dez nomes oficiais de clientes. Resultado salvo em `research/content-audit.json`.

O carrossel tem um grupo acessível de dez logos, com cada nome oficial único. A repetição para continuidade está em um grupo `aria-hidden="true"`, com alt vazio. CSS preserva proporções com `object-fit: contain`, contém suporte a movimento reduzido e pausa. A fidelidade das marcas está documentada separadamente em `docs/04-marcas.md`; esta revisão não substitui sua comparação visual.

## Revisão humana

- As frentes apresentadas correspondem à fonte: abordagens sociais em centros comerciais, mapeamento, identificação de demandas, encaminhamento de informações e treinamento de equipes.
- Não foram encontrados programas nomeados inventados, promessa de vaga, doações, voluntariado, natureza de ONG/OSC, certificações, atendimento 24h ou resultados de reinserção.
- Os dois trechos de depoimentos são literais, curtos e atribuídos às pessoas/cargos publicados. Os nomes não receberam retratos fictícios.
- Os dez parceiros são qualificados expressamente como empreendimentos apresentados como clientes, sem afirmar patrocínio ou financiamento.
- Telefone, WhatsApp, e-mail e endereço conferem com a fonte capturada.
- O formulário explica que prepara uma mensagem, pede revisão no WhatsApp e não declara entrega. O JS valida nome/e-mail e codifica os valores no link. Nenhuma mensagem foi enviada durante esta revisão.
- O player é criado somente após clique, mantém ID oficial, título de iframe, allowFullscreen e link alternativo. A leitura do código não comprova reprodução no YouTube.
- O menu implementa Escape, retorno de foco, ciclo de Tab, fundo inert e fechamento em mudança de breakpoint. A revisão estática não substitui o teste em navegador.

## Correções verificadas — resolvidas

1. **Resolvido: precisão da nota dos indicadores.** O `index.html` agora informa: “O site não informa se os atendimentos correspondem a pessoas únicas.” Mantém a observação de que o período de apuração não foi informado. A nova redação preserva a incerteza da fonte.
2. **Resolvido: fallback de formulário sem JavaScript.** O botão de envio tem `disabled` no HTML e é habilitado pelo JavaScript, que controla a construção da mensagem de WhatsApp. Sem JS, o `<noscript>` orienta os links oficiais de telefone, e-mail e WhatsApp disponíveis ao lado. Assim, o botão não expõe o envio GET nativo incompleto.

Foi repetido `node scripts/audit-content.mjs` depois das correções: **passed: true**, sem falhas e sem avisos. A inspeção das alterações foi feita diretamente no HTML e no JS, sem modificar implementação.

## Evidências finais de navegador revisadas

O relatório `research/final/audit.json`, produzido pela auditoria Playwright da implementação, foi lido e conferido nesta revisão independente:

- Larguras **375, 390, 768 e 1440 px**: `scrollWidth` igual à largura do viewport, listas vazias de imagens quebradas, overflow de títulos, erros e violações detectadas pelo axe. Poppins e as três cores institucionais foram observadas em todas as larguras.
- **Dez verificações de interação aprovadas:** menu abre, Escape fecha, âncora fecha e navega, FAQ abre/fecha, campos ausentes são rejeitados, formulário prepara WhatsApp sem enviar, movimento reduzido interrompe o carrossel, botão pausa e largura da cópia sustenta continuidade.
- O iframe manteve `https://www.youtube.com/embed/e_FMUXOr1yQ?autoplay=1&rel=0`. A observação do player registra `readyState: 4`, `currentTime: 6.944106`, `paused: false`, `error: null` e classe `playing-mode`. Isso comprova reprodução efetiva nesse teste, além da simples presença do embed.
- Resultado agregado do relatório: **passed: true**.

Esta revisão conferiu os artefatos de navegador produzidos pela implementação; não executou novamente a mesma bateria. Os resultados cobrem os estados e larguras registrados. Ausência de violações automatizadas não equivale a certificação WCAG, e reprodução observada não garante disponibilidade futura do serviço externo. Performance depende de suas medições específicas e não é inferida deste relatório de conteúdo.
