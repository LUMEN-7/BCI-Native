# Pesquisa mobile

A implementação usa como referência `LUMEN-7/BCI`: `Search/index.jsx`,
`useSearchController`, Controls, CarGrid, ScheduleModal, ImportVehicleModal e os
serviços de carros/agendamento. Os componentes são React Native, sem WebView.

## Fluxos

- **Agendar Pesquisa**: Novo e Agendados; veículo do catálogo ou não lançado;
  data local `AAAA-MM-DD`, hora `HH:MM`, recorrência e notas. Valida datas reais e
  futuras. Lista, alterna status, exclui mediante confirmação e executa agora.
- **Importar**: arquivo CSV/JSON ou ficha manual. CSV aceita vírgula, ponto e
  vírgula, tabulação, aspas escapadas e quebras de linha entre aspas. Arquivos com
  vários veículos apresentam um seletor; cada ficha é revisada e salva separadamente.
- **Imagem**: seletor de fotos com prévia, remoção e alternativa por URL.
- **Editar**: reabre a ficha importada e reenvia sua revisão por
  `POST /Carro/importar-arquivo`, seguindo o comportamento do web. A versão e a
  linhagem resultantes são as retornadas pelo servidor; não é utilizado o endpoint
  de edição administrativa. Alterar a identidade pode resultar em outra linhagem.
- Favoritos usam os IDs reais retornados pela API. O badge IMPORTADO e os campos
  adicionais da ficha são persistidos por usuário no dispositivo após o sucesso
  da API. O catálogo atual não fornece um indicador de origem no ReadCarroDTO;
  importações feitas em outro dispositivo não são inferidas como importadas.
- Motor, consumo geral, descrição e listas de itens adicionais não têm mapeamento
  no importador usado pelo web. São mantidos na ficha local e essa limitação aparece
  na revisão. Campos canônicos suportados são enviados ao servidor, e colunas
  não reconhecidas retornadas pela API são exibidas ao usuário.
- Busca e execução imediata compartilham polling de `/Pesquisa/jobs/:jobId`, sem
  requisições sobrepostas. Falhas de conexão são repetidas; jobs pendentes são
  persistidos por usuário e retomados ao reabrir a pesquisa.

## Dependências e validação

`expo-document-picker` e `expo-image-picker` já existiam. Foi adicionado
`expo-file-system` compatível com SDK 57 para ler arquivos e criar o JSON temporário
do multipart nativo. O arquivo temporário é removido após sucesso ou falha.

Reconstrua o development client após atualizar as dependências nativas
(`npm install` e `npx expo run:android`, ou o fluxo EAS existente para iOS).
O login Google, a navegação e as notas flutuantes não foram alterados.

Comandos de validação:

```sh
npm test
npx expo export --platform android --platform ios
```

Os testes cobrem parsing e validação da ficha, datas, contratos dos endpoints,
multipart nativo e limpeza, além de polling com falha de rede e cancelamento.
Não criam registros no backend real.

Verificação em development client com conta autenticada:

1. Entrar com Google; navegar à pesquisa; conferir navbar e notas flutuantes.
2. Filtrar, limpar filtros, favoritar/desfavoritar e abrir detalhes.
3. Criar agendamento com veículo existente e outro não lançado; conferir as quatro
   recorrências; recusar data inválida/passada; alternar status e excluir.
4. Executar agora; conferir o polling e o resultado. Sair e voltar durante uma busca.
5. Importar CSV e JSON, incluindo arquivo com múltiplos registros; cancelar o
   seletor; corrigir a ficha e confirmar a revisão antes de salvar.
6. Preencher manualmente; escolher/remover foto; confirmar badge IMPORTADO e Editar;
   editar, salvar e reabrir a pesquisa para conferir persistência por usuário.
7. Testar teclado, telas pequenas, fonte ampliada e falhas de conexão nos modais.

A geração dos bundles não substitui essa verificação em aparelho; não havia
emulador nem sessão autenticada de teste disponíveis no ambiente de implementação.
