<p align="center">
  <img
    src="https://raw.githubusercontent.com/LUMEN-7/images/refs/heads/main/logo.png"
    width="180"
    alt="BCI Logo"
  />
</p>

<h1 align="center">BCI Mobile</h1>

<p align="center">
  <strong>Beyond Compare Intelligence</strong>
</p>

<p align="center">
  Inteligência competitiva automotiva, agora em uma experiência mobile desenvolvida com React Native e Expo.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-EM%20DESENVOLVIMENTO-0562D2?style=for-the-badge&labelColor=00142E" />
  <img src="https://img.shields.io/badge/EXPO-SDK%2057-000020?style=for-the-badge&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/REACT%20NATIVE-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/VERSION-1.0.0-0562D2?style=for-the-badge&labelColor=00142E" />
</p>

---

## Sobre o projeto

O **BCI — Beyond Compare Intelligence** é uma plataforma de inteligência competitiva voltada ao mercado automotivo.

A aplicação centraliza pesquisa, análise e comparação de veículos concorrentes, permitindo consultar modelos atuais e futuros, acompanhar informações técnicas, verificar fontes, analisar níveis de confiança e utilizar inteligência artificial como apoio à interpretação dos dados.

O **BCI Mobile** é a versão em React Native da plataforma originalmente desenvolvida para web no repositório [`LUMEN-7/BCI`](https://github.com/LUMEN-7/BCI).

A proposta não é apenas reproduzir as telas do sistema web, mas adaptar seus principais fluxos para uma experiência mobile mantendo a mesma identidade visual, regras de negócio e integração com os serviços existentes.

> **Compare. Entenda. Antecipe.**

---
# VÍDEO DE DEMONSTRAÇÃO

<a href="https://youtu.be/B9b5CAy-Twc">
  <img src="https://raw.githubusercontent.com/LUMEN-7/images/refs/heads/main/C%C3%B3pia%20de%20FORD%20-%20Apresenta%C3%A7%C3%A3o.jpg" alt="Watch Demo" width="450"/>
</a>

<a href="https://expo.dev/accounts/lana00713/projects/bci-mobile/builds/9fd57f03-051c-4db4-8606-48bf3f8c4834">
  <img src="https://raw.githubusercontent.com/LUMEN-7/images/refs/heads/main/button.png" alt="Download App" width="200"/>
</a>
---
## Demonstração do aplicativo

Abaixo estão as principais telas e fluxos do *BCI Mobile — Beyond Compare Intelligence*.

### Autenticação

<p align="center">
  <img src="https://raw.githubusercontent.com/LUMEN-7/images/main/login.jpeg" width="30%" alt="Tela de login" />
  <img src="https://raw.githubusercontent.com/LUMEN-7/images/main/cadastro.jpeg" width="30%" alt="Tela de cadastro" />
  <img src="https://raw.githubusercontent.com/LUMEN-7/images/main/perfil.jpeg" width="30%" alt="Tela de perfil" />
</p>

<p align="center">
  <sub>Login • Cadastro • Perfil</sub>
</p>

---

### Home e navegação

<p align="center">
  <img src="https://raw.githubusercontent.com/LUMEN-7/images/main/home.jpeg" width="30%" alt="Tela inicial" />
  <img src="https://raw.githubusercontent.com/LUMEN-7/images/main/navbar.jpeg" width="30%" alt="Menu de navegação" />
  <img src="https://raw.githubusercontent.com/LUMEN-7/images/main/alertas.jpeg" width="30%" alt="Tela de alertas" />
</p>

<p align="center">
  <sub>Home • Navegação • Alertas</sub>
</p>

---

### Pesquisa e catálogo

<p align="center">
  <img src="https://raw.githubusercontent.com/LUMEN-7/images/main/pesquisa.jpeg" width="30%" alt="Pesquisa de veículos" />
  <img src="https://raw.githubusercontent.com/LUMEN-7/images/main/importar.jpeg" width="30%" alt="Importação de veículos" />
  <img src="https://raw.githubusercontent.com/LUMEN-7/images/main/agendar.jpeg" width="30%" alt="Agendamento de pesquisa" />
</p>

<p align="center">
  <sub>Pesquisa • Importação • Agendamento</sub>
</p>

---

### Informações do veículo

<p align="center">
  <img src="https://raw.githubusercontent.com/LUMEN-7/images/main/detalhes.jpeg" width="30%" alt="Detalhes do veículo" />
  <img src="https://raw.githubusercontent.com/LUMEN-7/images/main/infos.jpeg" width="30%" alt="Informações técnicas do veículo" />
  <img src="https://raw.githubusercontent.com/LUMEN-7/images/main/insights.jpeg" width="30%" alt="Insights do BCI" />
</p>

<p align="center">
  <sub>Detalhes • Informações técnicas • Insights</sub>
</p>

---

## Principais funcionalidades

### Pesquisa inteligente

A pesquisa permite consultar o catálogo existente ou iniciar uma nova busca por veículos.

O fluxo utiliza o backend do BCI:

```text
POST /Pesquisa/busca
        ↓
jobId
        ↓
GET /Pesquisa/jobs/:jobId
        ↓
resultado da pesquisa
```

A aplicação acompanha o processamento por polling e adiciona o modelo encontrado ao catálogo quando a pesquisa é concluída.

Também estão disponíveis:

- pesquisa por modelo
- filtro por marca
- filtro por ano
- acompanhamento de pesquisas em andamento
- favoritos
- pesquisas agendadas
- importação manual
- importação por CSV ou JSON
- edição de veículos importados

---

### Ficha completa do veículo

A tela de detalhes utiliza como fonte principal:

```text
GET /Carro/recente/:linhagemId
```

Ela apresenta:

- marca, modelo e ano
- imagem
- categoria
- descrição
- motor
- potência
- torque
- transmissão
- tração
- consumo urbano e rodoviário
- dimensões
- pneus
- capacidades
- recursos de performance
- segurança
- tecnologia
- conforto
- fontes das informações
- nível de confiança
- conflitos entre fontes
- análise com IA

Os dados vindos da API são sempre priorizados.

Informações geradas por IA são identificadas separadamente e não substituem informações reais já existentes.

---

### Inteligência artificial

O BCI possui um serviço de IA independente da API principal.

Ele é utilizado como uma camada de análise sobre os dados coletados e **não como substituto das fontes do sistema**.

A IA pode gerar:

- descrição contextual do modelo
- pontos fortes
- pontos fracos
- melhor cenário de uso
- concorrentes semelhantes
- complementação de informações ausentes
- parecer comparativo entre veículos

Fluxo:

```text
Dados da API
     ↓
Ficha do veículo
     ↓
IA analisa o contexto
     ↓
Insights adicionais
```

Os endpoints utilizados são:

```text
POST /api/ai/analyze
POST /api/ai/enrich-features
POST /api/ai/compare
```

Servidor de IA:

```text
https://bci-a105.onrender.com
```

A chave utilizada pelo provedor de IA permanece exclusivamente no servidor e **nunca é exposta no aplicativo**.

---

### Confiabilidade das informações

Cada informação pode possuir dados adicionais de evidência, como:

- fonte
- URL
- confiança
- conflito
- alternativas encontradas

O aplicativo diferencia três origens de informação:

```text
API
Informação obtida pelo backend do BCI.

IMPORTAÇÃO
Informação fornecida através de uma ficha importada pelo usuário.

IA
Informação complementar estimada pela inteligência artificial.
```

Campos provenientes de IA são exibidos como:

```text
Estimado por IA
```

e nunca são apresentados como informações verificadas da API.

---

### Comparação de veículos

O usuário pode selecionar veículos e comparar suas características lado a lado.

A comparação considera informações como:

- motorização
- potência
- torque
- transmissão
- consumo
- dimensões
- tecnologia
- segurança

Também é possível gerar um parecer comparativo utilizando a IA.

---

### Importação de veículos

O BCI Mobile permite cadastrar informações que ainda não estão disponíveis no catálogo.

Existem duas opções:

#### Importação automática

Arquivos aceitos:

```text
.csv
.json
```

O aplicativo:

```text
Arquivo
  ↓
Leitura dos dados
  ↓
Normalização
  ↓
Ficha preenchida
  ↓
Revisão
  ↓
Envio ao backend
```

#### Cadastro manual

O usuário também pode preencher a ficha diretamente pelo aplicativo e adicionar uma imagem ao modelo.

A importação utiliza:

```text
POST /Carro/importar-arquivo
```

---

### Agendamento de pesquisas

Pesquisas podem ser programadas para execução futura.

São suportadas recorrências:

- única
- diária
- semanal
- mensal

Também é possível:

- executar imediatamente
- ativar ou desativar
- excluir
- acompanhar pesquisas agendadas

---

### Modelos e comparações salvas

O usuário pode salvar:

- veículos
- comparações

Esses conteúdos ficam disponíveis para acesso posterior dentro da aplicação.

---

### BCI Notas

Sistema de notas integrado ao fluxo de pesquisa.

Permite registrar observações e relacioná-las a veículos consultados.

Inclui:

- busca
- criação
- edição
- exclusão
- Markdown básico
- vínculo com veículos
- notas flutuantes durante a navegação

---

### Workspace

Área colaborativa destinada ao trabalho em equipe.

Inclui recursos como:

- criação de workspace
- entrada por convite
- publicações
- comentários
- curtidas
- conteúdos fixados
- responsáveis
- status
- membros
- atividades

---

### Alertas

O BCI possui uma central de notificações para acompanhar informações e atividades relevantes.

É possível:

- visualizar notificações
- marcar como lida
- marcar todas como lidas
- excluir notificações
- acompanhar notificações ativas

---

### Insights

A tela de Insights utiliza informações disponíveis no catálogo para apresentar uma visão consolidada dos modelos e do mercado acompanhado pelo usuário.

---

### Perfil e segurança

A aplicação possui:

- login
- cadastro
- login com Google
- edição de perfil
- foto
- recuperação de senha
- autenticação em dois fatores
- gerenciamento da sessão

---

## Arquitetura

O aplicativo mobile não possui um backend próprio.

Ele utiliza os mesmos serviços da plataforma BCI.

```text
┌──────────────────────────────┐
│          BCI Mobile          │
│     React Native + Expo      │
└──────────────┬───────────────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│   BCI API    │  │  BCI AI API  │
│              │  │              │
│ ASP.NET/API  │  │ Node/Express │
└──────┬───────┘  └──────┬───────┘
       │                  │
       ▼                  ▼
 Dados, usuários,       DeepSeek
 pesquisa, catálogo
 e comparação
```

### API principal

```text
https://apiford.onrender.com
```

Responsável por:

- autenticação do BCI
- catálogo
- pesquisas
- veículos
- favoritos
- comparações
- notas
- notificações
- workspace
- exportações

### Serviço de IA

```text
https://bci-a105.onrender.com
```

Responsável por:

- análise individual
- enriquecimento de campos ausentes
- análise comparativa

---

## Stack

### Mobile

- React Native `0.86`
- React `19`
- Expo SDK `57`
- React Navigation
- Expo Secure Store
- AsyncStorage
- Expo File System
- Expo Document Picker
- Expo Image Picker
- Expo Sharing
- Expo Dev Client

### Autenticação

- Firebase Authentication
- Google Sign-In
- `react-native-nitro-google-signin`

### Interface

- Expo Vector Icons
- Anton
- Titillium Web

### Backend

- API BCI
- Node.js
- Express
- DeepSeek API

---

## Identidade visual

A interface mantém a identidade criada para o BCI web.

### Cores principais

```text
Navy
#00142E

Azul
#0562D2

Background
#F7F7F5

Cinza claro
#F1F2F0

Borda
#D8DCE1
```

### Tipografia

```text
Títulos
Anton

Texto
Titillium Web
```

A experiência utiliza:

- títulos grandes e condensados
- bastante espaço negativo
- cards claros
- pills
- ações circulares
- contraste navy/branco
- hierarquia editorial

---

## Estrutura do projeto

```text
BCI-Native/
│
├── assets/
│
├── src/
│   ├── components/
│   │   ├── GlobalNavbar/
│   │   ├── FloatingNotes/
│   │   ├── VehicleCard/
│   │   ├── ConfidenceBadge/
│   │   └── ...
│   │
│   ├── context/
│   │
│   ├── hooks/
│   │
│   ├── navigation/
│   │   └── AppNavigator.js
│   │
│   ├── screens/
│   │   ├── HomeScreen/
│   │   ├── SearchScreen/
│   │   ├── VehicleDetailScreen/
│   │   ├── CompareScreen/
│   │   ├── CompareResultScreen/
│   │   ├── SavedScreen/
│   │   ├── NotesScreen/
│   │   ├── AlertsScreen/
│   │   ├── InsightsScreen/
│   │   ├── WorkspaceScreen/
│   │   └── ProfileScreen/
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── aiService.js
│   │   ├── carsService.js
│   │   ├── userService.js
│   │   ├── scheduleService.js
│   │   └── ...
│   │
│   ├── theme/
│   │   ├── colors.js
│   │   └── typography.js
│   │
│   └── utils/
│
├── tests/
├── app.json
├── eas.json
├── package.json
└── README.md
```

---

## Executando o projeto

### Pré-requisitos

Tenha instalado:

- Node.js
- npm
- Android Studio para Android
- Xcode para iOS
- EAS CLI para builds Expo

Clone o projeto:

```bash
git clone https://github.com/LUMEN-7/BCI-Native.git
cd BCI-Native
```

Instale as dependências:

```bash
npm install
```

Para alinhar módulos Expo com o SDK atual:

```bash
npx expo install --fix
```

---

## Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto.

```env
EXPO_PUBLIC_API_BASE_URL=https://apiford.onrender.com
EXPO_PUBLIC_AI_SERVER_URL=https://bci-a105.onrender.com

EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=
```

> Nunca versione chaves privadas, tokens ou credenciais de serviços externos.

As variáveis `EXPO_PUBLIC_*` ficam disponíveis no bundle do aplicativo e, portanto, **não devem conter segredos**.

---

## Desenvolvimento

Inicie o Metro:

```bash
npx expo start --dev-client
```

Caso seja necessário limpar o cache:

```bash
npx expo start --dev-client --clear
```

### Android

```bash
npm run android
```

ou:

```bash
npx expo run:android
```

### iOS

```bash
npm run ios
```

---

## Development Build

O projeto utiliza módulos nativos e, por isso, o fluxo recomendado é através de **Expo Development Build**.

Algumas dependências utilizadas:

```text
react-native-nitro-google-signin
expo-secure-store
expo-document-picker
expo-file-system
expo-image-picker
expo-sharing
```

Quando uma nova dependência nativa ou configuração de plugin for adicionada, pode ser necessário gerar um novo Development Build.

---

## Build com EAS

Faça login:

```bash
eas login
```

Configure o projeto, se necessário:

```bash
eas build:configure
```

### Development

```bash
eas build --profile development --platform android
```

### Preview / APK

```bash
eas build --profile preview --platform android
```

### Produção

```bash
eas build --profile production --platform android
```

Para iOS:

```bash
eas build --profile production --platform ios
```

---

## Testes

Execute:

```bash
npm test
```

Os testes cobrem fluxos como:

- importação
- parsing CSV/JSON
- polling de pesquisa
- agendamento
- adaptação de veículos
- detalhes
- comparação
- comportamento de dados da API e IA

Também é recomendado verificar o bundle antes de abrir um PR:

```bash
npx expo export --platform android
```

E validar whitespace/diffs:

```bash
git diff --check
```

---

## Segurança

Algumas regras importantes do projeto:

### Tokens

O token da API é armazenado no:

```text
Expo SecureStore
```

### Dados locais

Informações não sensíveis e preferências por usuário utilizam:

```text
AsyncStorage
```

### IA

A chave:

```text
DEEPSEEK_API_KEY
```

existe apenas no servidor de IA.

Ela **nunca deve ser adicionada ao aplicativo mobile**.

### Variáveis públicas

Qualquer variável iniciada com:

```text
EXPO_PUBLIC_
```

deve ser considerada pública.

---

## Fluxo de dados da ficha

O BCI segue esta prioridade:

```text
API
 ↓
dados reais e evidências
 ↓
informações locais de importação
 ↓
IA apenas para campos ausentes
```

A IA nunca deve substituir um valor real já retornado pela API.

Exemplo:

```text
Potência
190 cv

Fonte: fabricante
Confiança: 92%
```

permanece como dado da API.

Se um campo estiver ausente e for complementado pela IA:

```text
Modo de condução
Eco / Normal / Sport

Estimado por IA
```

---

## Navegação

A navegação principal utiliza um componente global próprio:

```text
GlobalNavbar
```

com acesso às principais áreas:

- Home
- Pesquisar
- Comparar
- Insights
- Alertas
- Workspace
- Salvos
- Notas
- Perfil

O aplicativo também mantém o componente:

```text
FloatingNotes
```

para acesso rápido às anotações durante a navegação.

---

## Projeto web

A versão original está disponível em:

[`LUMEN-7/BCI`](https://github.com/LUMEN-7/BCI)

O projeto web continua sendo a principal referência de:

- identidade visual
- regras de negócio
- arquitetura das telas
- contratos das APIs
- experiência do produto

O mobile adapta essa experiência aos padrões de interação de smartphones sem duplicar a lógica de backend.

---

## Equipe

Desenvolvido pela **LUMEN-7**.

<h2>
  Conheça o time
  <img src="https://raw.githubusercontent.com/LUMEN-7/images/refs/heads/main/logo-lumen.png" width="200" align="center" />
</h2>

| Foto                                                                                                     | Nome                                                                      | RM        |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | --------- |
| <img src="https://avatars.githubusercontent.com/AnaTorresLoureiro" width="80" style="border-radius:50%;">| [Ana Laura Torres Loureiro](https://github.com/AnaTorresLoureiro)         | RM 554375 |
| <img src="https://avatars.githubusercontent.com/MuriloCngp" width="80" style="border-radius:50%;">       | [Murilo Cordeiro Ferreira](https://github.com/MuriloCngp)                 | RM 556727 |
| <img src="https://avatars.githubusercontent.com/Geronimo-augusto" width="80" style="border-radius:50%;"> | [Geronimo Augusto Nascimento Santos](https://github.com/Geronimo-augusto) | RM 557170 |
| <img src="https://avatars.githubusercontent.com/iannyrfs" width="80" style="border-radius:50%;">         | [Ianny Raquel Ferreira De Souza](https://github.com/iannyrfs)             | RM 559096 |
| <img src="https://avatars.githubusercontent.com/Vitorr-AF" width="80" style="border-radius:50%;">        | [Vitor Augusto França de Oliveira](https://github.com/Vitorr-AF)          | RM 555469 |

BCI — Beyond Compare Intelligence

> Transformando dados automotivos em inteligência competitiva.
