# Curadoria de imagens — revisão 2

## Revisão 5: card de treinamento

A fotografia oficial com rostos visíveis no card “Treinamentos” foi substituída por `research/generated-v5/treinamento.png`, cena ilustrativa inédita de equipe vista de costas em sala de formação. O card mantém suas proporções e usa `public/assets/media/v3-treinamento-v5-{480,960,1600}.{avif,webp}` com carregamento tardio. O original gerado mede **1672 × 941 px**; o mestre `research/generated-v5/treinamento-3840x2160.png` é interpolado, sem detalhe 4K nativo. A fotografia oficial continua preservada nos arquivos de pesquisa, sem ser usada nesse card.

## Revisão 4: imagens por frente de atuação

Os cinco cards de `#week` usam agora cenas inéditas e diferentes: `territorio` mostra um bairro brasileiro em plano amplo; `pessoas`, uma conversa acolhedora no espaço compartilhado com participantes vistos à distância; `necessidades`, organização de formulários e anotações sem dados pessoais; `rede`, planejamento conjunto; e `equipes`, uma sala preparada para formação. Fontes em `research/generated-v4/`, variantes `public/assets/media/v4-*` em AVIF/WebP de 480, 960 e 1600 px. São imagens ilustrativas, não registros de equipes ou atendimentos reais.

O gerador entregou originais de **1672 × 941 px** nesta revisão. Os cinco mestres `-3840x2160.png` foram ampliados por interpolação; a exigência de detalhe 4K nativo permanece tecnicamente não atendida pelo gerador disponível.

## Revisão 3: seis cenas novas

Foram geradas seis ilustrações fotográficas inéditas para a versão atual: `atrio`, `planejamento`, `presenca`, `formacao`, `acesso` e `articulacao`. Os arquivos de origem estão em `research/generated-v3/`; cada identificador possui um mestre `-3840x2160.png` e variantes AVIF/WebP de 480, 960 e 1600 px em `public/assets/media/v3-*`. A página as distribui entre abertura, cards de atuação, treinamento, bloco de acesso e capa do vídeo. Todas são apresentadas como **imagens ilustrativas**, sem afirmar que mostrem pessoas, espaços ou atendimentos reais da Avante.

O gerador entregou cada origem em **1672 × 941 px**. Os seis mestres 3840 × 2160 foram ampliados com interpolação Lanczos e não contêm o detalhe de uma captura 4K nativa. A fotografia de equipe rejeitada na revisão anterior permanece fora da página e dos arquivos de trabalho.

## Evidência e escolha

As fotografias originais recuperadas do site institucional estão em `research/avante-assets/`. A folha de contato `research/official-contact-sheet.png` permite conferir as 15 imagens JPG recuperadas. Três são fotografias de contexto; as demais são marcas ou imagens com pessoas em primeiro plano.

| Uso | Fonte oficial | Enquadramento | Recomendação |
| --- | --- | --- | --- |
| Território e abertura | `dc4f1fb8a6022a3b505ba7383aaddc48.jpg` | Arquitetura de centro comercial; pessoas incidentais muito pequenas | Manter como fonte documental, sem afirmar que seja um núcleo específico |
| Espaços de atuação | `d81af99ef1e3dffcef0d6f8bc971a001.jpg` | Interior amplo; sem rostos em destaque | Manter em blocos secundários |
| Treinamento | `ec181a8de2d55dd557d28f2bd38f0548.jpg` | Registro institucional de atividade; pessoa vista de costas em primeiro plano e grupo menor ao fundo | Preferir à imagem sintética rejeitada, com legenda honesta e sem ampliar rostos do fundo |

As fotos `1ba14a33c9581ccf9c010b9ac46b8792.jpg` e `8a67242ad606f77d0f10e4c25c600a52.jpg` trazem pessoas identificáveis em destaque; não atendem à orientação do cliente para esta landing page.

## Imagem descartada

O cliente rejeitou explicitamente a imagem sintética de equipe sentada de costas. Ela não deve ser usada na landing page nem no build. O original local `research/generated-4k/treinamento-source.png`, se ainda existir, é somente artefato de trabalho e deve ser removido do projeto final. Evite promover a imagem gerada da sala de atendimento como documentação de um espaço real da Avante; ela foi criada como ilustração e não foi verificada como parte de seus serviços.

## Precisão técnica

Os dois arquivos sintéticos ainda presentes, `research/generated-4k/territorio-source.png` e `research/generated-4k/acolhimento-source.png`, foram verificados com Sharp: ambos medem **1672 × 941 pixels**. O gerador não entregou os 3840 × 2160 solicitados. O produto não deve ser descrito como fotografia 4K nativa; uma versão ampliada para 4K é interpolação, sem detalhe fotográfico novo. O arquivo sintético de treinamento já foi removido da pasta de trabalho. As variantes WebP 480/800 pixels das imagens oficiais são adequadas a cards; para hero em telas grandes, verificar a resolução efetiva do original antes de ampliar.
