# Auditoria de imagens — revisão 4

Escopo: `index.html`, gerador `scripts/adapt-avante.mjs`, curadoria institucional e ativos atuais. Este levantamento distingue fotografias ilustrativas geradas por IA, fotografia oficial e gráficos de interface. Não valida que uma cena sintética represente um atendimento real.

| Área | Estado atual | Avaliação e ação recomendada |
| --- | --- | --- |
| Abertura | `v3-atrio`, átrio de centro comercial, sem rostos destacados | Coerente com contexto de atuação. Preservar como ilustração; não afirmar ser espaço parceiro real. |
| Atuação / Território | `v3-planejamento`, mapa sobre mesa | Coerente como preparação, mas o mapa sintético não documenta território verdadeiro. Preservar se rotulado como ilustração. |
| Atuação / Abordagem social | `v3-presenca`, figuras pequenas caminhando em corredor | Mostra presença, mas não comunica abordagem acolhedora; candidata a troca por cena de interação discreta sem rostos. |
| Atuação / Demandas, Rede, Cuidado | Apenas gráficos vetoriais de ouvido, rede e coração dentro de tiles | Não são campos vazios no DOM. A sequência de três gráficos pode dar a impressão de ausência de fotografia; adicionar cenas específicas se couber no recorte sem alterar o ritmo da colagem. |
| Atuação / Treinamentos | `treinamento-800.webp`, fotografia publicada pela Avante | Registro verificado. Manter; rostos aparecem pequenos ao fundo, evitar ampliação que os destaque. |
| Indicadores | Quatro ilustrações numéricas `metric-art` | Gráficos intencionais, não slots de fotografia. Não substituir por rostos ou cenas que insinuem impacto mensurado além dos números publicados. |
| Vídeo | Capa `v3-articulacao`, reunião ilustrativa, troca pelo YouTube ao clicar | A capa não é um frame do vídeo oficial. Mesmo com `alt` ilustrativo, pode criar expectativa incorreta sobre o conteúdo; preferir frame real do vídeo ou uma capa abstrata claramente marcada. Preservar ID `e_FMUXOr1yQ`. |
| Formação | `v3-formacao`, grupo visto de costas | Contexto compatível com treinamento, mas é imagem sintética; manter o rótulo de ilustração, sem atribuir participantes à Avante. |
| Fluxo das cinco frentes | Todas as `.wk-photo.flow-art` contêm somente ícone SVG e número | Principal lacuna apontada pelo cliente. Substituir por imagens distintas nas frentes 01–04; a 05 também deve receber cena própria ou ser apresentada claramente como gráfico, para não parecer um slot esquecido. |
| Parceiros | Dez marcas oficiais em carrossel; segundo grupo é cópia para loop contínuo | Duplicação técnica intencional, `aria-hidden` no grupo espelhado. Preservar marcas e proporções. |
| Recuperação / Acolher | `v3-acesso`, espaço vazio acessível | Comunica acesso e ambiente, mas não a conexão humana do texto. Uma cena de orientação com privacidade preservada pode ser mais pertinente; evitar sugerir que existe uma sala oficial específica da Avante. |
| Depoimentos, contato, FAQ | Blocos textuais e formulário sem slots de imagem | Ausência de foto é escolha editorial coerente; não preencher com retratos genéricos. |

## Prioridade de correção

1. Trocar os quatro primeiros `flow-art` por imagens próprias que comuniquem território urbano, abordagem acolhedora, organização de demandas e articulação de encaminhamentos, sem rostos em destaque. O quinto cartão, “As equipes”, deve receber uma cena de treinamento distinta da fotografia já usada ou manter um gráfico deliberado com tratamento visual equivalente.
2. Auditar visualmente o recorte real de cada imagem em 320, 390, 768 e 1440 px; imagens adequadas no arquivo podem ficar abstratas demais em cartões baixos.
3. Marcar todas as imagens sintéticas como ilustrativas e documentar sua origem. Os arquivos gerados na revisão 3 têm origem **1672 × 941 px**; os mestres 3840 × 2160 são ampliações, não capturas 4K nativas.
4. Revisar a capa do vídeo e os tiles “Abordagem social”, “Demandas”, “Rede” e “Cuidado” conforme a percepção real do cliente, sem inventar serviços, projetos, parceiros ou registros de atendimento.

## Fontes

- `docs/01-avante-institucional.md` e captura `research/avante-original.html` para serviços e limites de afirmação.
- `docs/11-imagens.md` para procedência e limitações de resolução.
- `index.html` e `scripts/adapt-avante.mjs` para presença e distribuição atual dos arquivos.
