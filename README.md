# Avante Núcleo Social

Landing page institucional baseada no template Arcline/8B, com uma reprodução independente preservada antes da personalização.

## Abrir

```powershell
npm install
npm run dev:next
```

- Avante: http://127.0.0.1:3000/
- Reprodução fiel do template: disponível em `reference/`.

## Build e publicação

```powershell
npm run build
npm run preview:next
```

O build padrão gera a versão Next.js/React em `out/` e prepara os arquivos CSS/JS minificados. Na Vercel, use o framework Next.js; o projeto está configurado para exportação estática. Para desenvolvimento com `npm run dev:next`, execute `node scripts/prepare-next-assets.mjs` após alterar CSS/JS.

Uma alternativa estática independente pode ser gerada com `npm run build:static` em `dist/`. A pesquisa e os arquivos originais grandes ficam fora do repositório de publicação.

## Editar

- `scripts/adapt-avante.mjs`: conteúdo e transformação reprodutível a partir da referência; exige validação da etapa 3.
- `public/assets/avante.css`: personalização institucional e componentes acrescentados.
- `public/assets/avante.js`: menu acessível, formulário WhatsApp, vídeo e carrossel.
- `public/assets/template.css`: base visual extraída da referência; `refinement.css`: composição e temas.
- `public/assets/experience.js` e `vendor/gsap.min.js`: tema persistente e animações discretas; o antigo `motion.js` não é carregado.
- `public/assets/brand/` e `partners/`: marcas e manifestos de proveniência.

Após editar o conteúdo no script: `node scripts/adapt-avante.mjs`, depois `npm run build`. Alterações manuais no index.html serão substituídas pela geração.

## Verificar

```powershell
npm run test:reference
npm run test:content
npm test
node scripts/production-smoke.mjs
npm run test:performance
node scripts/audit-v2.mjs
```

Requer Google Chrome instalado. Os scripts de auditoria usam os servidores temporários 4180–4183. A comparação de referência e o vídeo precisam de internet. No ambiente corporativo Windows desta execução, downloads Node usaram `--use-system-ca` para confiar no armazenamento de certificados do sistema.

## Documentação

- `docs/01-avante-institucional.md`: fatos e identidade.
- `docs/02-engenharia-reversa.md`: REA, template e protocolo de comparação.
- `docs/03-comunicacao.md`: copy, marketing e decisões de adaptação.
- `docs/04-marcas.md`: vetorização e limitações dos parceiros.
- `docs/06-auditoria-conteudo.md`: revisão independente.
- `docs/07-validacao-final.md`: validação da primeira versão; `docs/10-qa-v2.md`: auditoria da revisão atual.
- `docs/11-imagens.md`: proveniência, descarte da imagem rejeitada e limites de resolução.
- `docs/12-motion.md`, `docs/13-next-integration.md` e `docs/13-qa-v3.md`: integração de movimento, arquitetura Next e evidências da auditoria atual.
- `docs/14-motion-v4.md`, `docs/15-qa-v4.md` e `docs/16-image-audit.md`: revelações individuais dos cards, QA final e auditoria visual das mídias.
- `docs/17-hm-scroll.md`, `docs/18-partners.md` e `docs/19-story-motion.md`: evidência da referência de scroll, carrossel e storytelling da revisão atual.
- `docs/20-validacao-v5.md`: QA e performance da revisão de storytelling.
- `CHANGELOG.md`: registro de alterações e evidências.

O vídeo institucional foi mantido integralmente. Não foram inventados projetos, parceiros, depoimentos, resultados, programas de doação ou voluntariado. As marcas dos parceiros permanecem raster quando os originais não permitem vetorização fiel.
