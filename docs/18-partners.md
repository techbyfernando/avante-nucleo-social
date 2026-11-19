# Carrossel de parceiros — revisão 5

O botão de pausa foi removido do gerador e do HTML final. A trilha usa duas cópias idênticas do grupo de 10 marcas, com larguras iguais, e `translateX(-50%)` em animação CSS linear infinita. O CSS mantém o movimento no hover e no foco; não há reinicialização por interação. Em movimento reduzido, a animação cessa e a lista original fica disponível por rolagem horizontal manual. A cópia duplicada é oculta para tecnologia assistiva.

Playwright mediu, perto da junção do ciclo, largura de 1740 px por grupo a 390 px e 2020 px a 1440 px. A posição final difere do deslocamento de um grupo em apenas 0,04 px nos dois casos. Evidência em `scripts/check-partners-seam.mjs`.

As imagens originais dos parceiros são arquivos de baixa resolução (166 × 106 px), preservados como PNG transparente derivado sem alteração de desenho. O material oficial não fornece mestres vetoriais suficientes para converter fielmente todas as marcas em SVG verdadeiro. Não há SVGs falsos contendo raster embutido; a limitação e os arquivos de origem estão em `docs/04-marcas.md` e `public/assets/partners/manifest.json`.
