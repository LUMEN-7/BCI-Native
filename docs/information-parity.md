# Information web → VehicleDetail mobile

Referência principal: `LUMEN-7/BCI/src/pages/Information` (controller, Topbar, Hero, Specs, Technical, AiAnalysis e estilos). A tela Detail antiga não foi usada como referência visual.

## Comportamento

- Ficha real por linhagem: `GET /Carro/recente/:linhagemId` é sempre tentado, o DTO/API aparece antes de começar IA e o DTO bruto permanece em `raw` para Compare.
- Topbar própria: voltar, Home, favorito com loading/toast, exportar e ações do importado.
- Hero com imagem/placeholder local, marca, modelo, ano, categoria, confiança e badges de importação/modelo futuro.
- Compare recebe `firstCar` e uma chave de seleção, inclusive se a tela já estiver montada. Mantém o fluxo existente de comparação.
- Specs principais e dez acordeões, incluindo dados base; estado de abertura preservado enquanto a tela está montada.
- Fontes provenientes apenas do DTO, resolução de IDs, links HTTP(S), alternativas em conflito e confiança explícita, inclusive zero. Campos carregados da API levam `origin: api`; complementos locais levam `origin: imported`; IA usa `origin: ai`, `confidence: 0` e `source: null`.
- Sem confiança presumida para valores simples. A média inclui zero e exclui campos ausentes. Não atribuímos fonte/confiança a estimativas da IA.
- Enriquecimento automático somente para campos realmente ausentes em veículos normais, protegendo valores reais; análise automática independente da ficha. Importados têm geração manual de análise. Erros/retry separados.
- ImportVehicleModal da Search reutilizado. Servidor é prioritário para campos persistidos; ficha local complementa engine, consumo geral, descrição e features não persistidas.
- Search atualiza favoritos/importados ao recuperar foco sem reiniciar o polling. Saved atualiza ao retornar. GlobalNavbar/FloatingNotes reutilizados pelo shell com navegação para o Main aninhado.

## Endpoints

- `GET /Carro/recente/:linhagemId`
- `POST /Pesquisa/busca`, `GET /Pesquisa/jobs/:jobId`, `GET /Carro/listar`
- `GET /user/modelos`, `POST /user/modelos`, `DELETE /user/modelos/:linhagemId`
- `POST /Carro/importar-arquivo` (edição pelo modal existente)
- `POST /Exportacao`: `{ itens: [{ linhagemId }], formato, separador? }`; separador só para CSV. Preserva bytes, MIME e ZIP quando retornado.
- Servidor de IA (`EXPO_PUBLIC_AI_SERVER_URL`): `POST /api/ai/analyze`, `POST /api/ai/enrich-features`.
- Endpoints existentes de catálogo, agendamento, `/Pesquisa/jobs/:jobId` e comparação mantidos.

## Dependência nativa

Adicionado `expo-sharing` compatível com SDK 57 e seu config plugin. `expo-file-system` já existia. Recompilar/reinstalar o development client para disponibilizar o novo módulo. Não houve alteração nas configurações de Google Sign-In.

Exportações são gravadas no cache e entregues ao compartilhamento do sistema, que permite salvar/abrir em apps compatíveis. Arquivos compartilhados ficam no cache gerenciado pelo SO para que o aplicativo destinatário ainda possa lê-los; falhas removem o temporário. Fechar o seletor do sistema não comprova que o usuário salvou o arquivo.

## Limitações conhecidas

- Exclusão segue a Information web: remove somente a ficha pessoal do storage por usuário. A confirmação informa que catálogo e favoritos permanecem no servidor. O contrato consultado expõe exclusões genéricas de Carro, mas não estabelece uma exclusão pessoal por dono da importação; não apagamos o catálogo compartilhado para simular essa função. O registro pode voltar a aparecer como veículo comum na Search.
- Edição reimporta usando o contrato real existente. Alterar identidade pode criar outra linhagem, conforme decisão do backend.
- Complementos locais não sincronizam entre dispositivos e não integram a exportação produzida pelo servidor; isso aparece no modal.
- Valores dimensionais mantêm a unidade explícita do DTO. Quando a API retorna apenas um número, não inferimos metros ou milímetros (a importação usa aliases `_mm`, enquanto o web acrescenta `m`).
- IA usa `EXPO_PUBLIC_AI_SERVER_URL`; `.env.example` aponta para `https://bci-a105.onrender.com`. Sem configuração, o service lança `Servidor de IA não configurado.` e não usa fallback local.
- A prévia visual usa componentes React Native Web isolados fora do repositório com dados de avaliação identificados. Não substitui validação nativa nem teste autenticado de ponta a ponta.

## Verificação

- `npm test`: 29 testes aprovados, incluindo polling, importação, agendamento, envelopes de DTO, confiança zero, conflitos/fontes, mesclagem, proteção contra IA, exportação binária, sessão expirada, favorito duplicado e respostas atrasadas.
- `npx expo export --platform android --output-dir ../information-android`: bundle Android gerado com sucesso.
- `git diff --check`: sem erros.
- Revisão de imports pelo bundle e busca de dados mockados nos arquivos de produção modificados: sem dados fictícios adicionados.
- Prévia a 320 e 390 px: sem overflow horizontal no DOM; Hero, fontes/acordeões e exportação inspecionados. Troca CSV/XML remove seletor CSV corretamente.

## Ainda testar em aparelho

- Instalação do novo dev client, Google Sign-In e restauração/expiração de sessão.
- Ficha real aberta via Search, Saved e Notes; Home/back, navbar e FloatingNotes.
- Favoritar/desfavoritar e retorno a Search/Saved; Compare com primeiro modelo preenchido e comparação real.
- Editar importado, upload de imagem, atualizar ficha, excluir localmente, trocar usuário.
- CSV com ambos separadores, XLSX, JSON, XML e eventual ZIP: salvar/abrir no app destinatário, cancelar, erro/offline; Android e iOS.
- IA real: automático, manual importado, ausência de campos, retry e navegação durante requisição.
- Fontes externas, dimensões/unidades reais, imagens lentas/indisponíveis, fonte ampliada, leitor de tela, teclado/modais.
