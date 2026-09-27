# Paridade mobile com o BCI web

Referência: breakpoint mobile das páginas Compare/Detail, Saved, Notes, Alerts, Profile/EditProfile, Workspace/WorkspaceAccess, Insights e autenticação do repositório LUMEN-7/BCI. Home, Search e Information já haviam sido adaptadas.

## Comportamento e apresentação

- Tipografia Anton/Titillium Web, navy #00142E, azul #0562D2, títulos grandes, margens de 16–20 px, pills e superfícies claras. Layouts flexíveis em 320 e 390 px.
- Shell compartilhado reserva espaço para GlobalNavbar e FloatingNotes, também nos fluxos secundários. Login Google mantém o mesmo SDK e fluxo de autenticação.
- Compare: seleção por posição, modo múltiplo (referência + 2–5 modelos), oito filtros de similaridade e busca; catálogo paginado e apresentação progressiva dos cards. Valores ausentes não são tratados como semelhantes.
- Resultado: tabela com todos os modelos, somente diferenças, gráfico de potência com valores reais, fichas técnicas/fontes por modelo, enriquecimento de campos ausentes sem sobrescrever API, parecer pareado da IA com retry, salvar e exportar a comparação inteira.
- Saved reabre o payload completo de comparações, inclusive múltiplas.
- Notes: listagem, busca, prévia, edição, veículos/comparações vinculados, Markdown básico, imagens externas e checklists persistidos. A atualização de parágrafos preserva os outros blocos existentes.
- Alerts: resumo, filtros, leitura, marcação em lote, exclusão e navegação para o veículo. DTOs aceitam variações lida/lido e casing; erros de mutação não produzem falso sucesso.
- Workspace: criar/entrar por código, descrição, busca e lista de equipes, feed, minhas atividades, tipos, comentários, curtidas, fixação, exclusão, responsáveis/status, conteúdos vinculados, membros/convite e atividade recente.
- Perfil: identidade centralizada, configurações em linhas com ícones, foto, dados pessoais e 2FA. Configuração usa chave manual/abertura do autenticador; QR em formato de imagem é exibido quando retornado.
- Login/cadastro/recuperação/boas-vindas/2FA: layout rolável, confirmação de senha, visibilidade da senha e feedback de carregamento/erro. Recuperação valida o código no endpoint final, sem fingir uma validação intermediária no servidor.

## Fontes reais

- GET /Carro/listar?pagina=...&tamanhoPagina=100
- POST /Comparacao/direta
- GET/POST/DELETE /user/modelos e /user/comparacoes
- POST /Exportacao (itens com linhagemId, formato e separador CSV)
- /Anotacao/minhas, /Anotacao, /Anotacao/:id e /Anotacao/:id/blocos
- /Notificacao/minhas, /Notificacao/:id/lida, /Notificacao/lidas/todas, /Notificacao/:id
- /Equipe, /Equipe/minhas, /Equipe/entrar, /Equipe/:id e /Equipe/:id/membros
- /Workspace/:equipeId/posts, /Workspace/:equipeId/atividades
- /Workspace/posts/:id/comentarios, /curtida, /fixar, /status e DELETE /Workspace/posts/:id
- Serviços existentes de /User, incluindo foto e 2FA
- IA: /api/ai/compare e /api/ai/enrich-features

Nenhuma dependência adicionada. Não exige reconstruir o dev client já compatível com as dependências anteriores.

## Diferenças deliberadas / limitações

- Insights web contém dados fictícios. O mobile usa contagens/distribuição/conflitos do catálogo real. Não inventa adoção histórica, preços ou participação de mercado; séries sem endpoint aparecem como indisponíveis.
- O radar web atribui pontuações heurísticas a listas de recursos. O mobile mostra potência real em barras; ausência de dados não vira pontuação zero.
- Parecer comparativo da IA permanece limitado a dois modelos, conforme o serviço web.
- Enriquecimento é sinalizado como estimativa, confiança zero e sem fonte. Exportação usa os dados do servidor, sem incluir complementos apenas locais.
- Notas usam editor textual e prévia de Markdown básico, não um editor rich text completo. Blocos existentes de imagens/comparações são preservados; não foi criado upload de imagem de notas sem serviço equivalente disponível.
- Permissões do Workspace dependem do servidor. A interface mostra gerenciamento para autor/administrador, e mudanças de status também para responsável.
- As imagens externas continuam dependentes de disponibilidade da origem.

## Verificação

- npm test: 48 testes, incluindo payloads, DTOs, ausência de dados, preservação de blocos, exportação múltipla, paginação e respostas atrasadas.
- Bundle Expo Android gerado com sucesso.
- git diff --check.
- Prévia React Native Web em 320 e 390 px com fixtures isoladas fora do repositório, claramente identificadas como dados de avaliação.
- Fluxos de seleção direta e navegação de resultado exercitados na prévia.
- Nenhum fixture foi adicionado ao app; casos sintéticos ficam em testes.

Ainda validar em aparelho e com conta autenticada: teclado/safe areas, Google Sign-In e 2FA, permissões de fotos, exportação/compartilhamento, permissões reais do Workspace, troca rápida de telas, edição de notas e retorno dos fluxos Search/importação/agendamento. A prévia e os testes de contrato não substituem integração com a API autenticada.

