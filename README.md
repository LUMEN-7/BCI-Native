# BCI Mobile — Beyond Compare Intelligence

Versão React Native + Expo do **BCI (Beyond Compare Intelligence)**, portada a partir do projeto web [`LUMEN-7/BCI`](https://github.com/LUMEN-7/BCI).

Snapshot de referência usado na migração: `main` / tree `baeb256448b7898c7e4d5f8d12366a3cc73a5d05`.

## Stack

- Expo SDK 57 / React Native 0.86 / React 19.2
- React Navigation (Native Stack + Drawer)
- Firebase Auth + `expo-auth-session` para Google
- Expo SecureStore para JWT da API
- AsyncStorage para dados locais não sensíveis e escopo por usuário
- API principal existente: `https://apiford.onrender.com`
- Serviço de IA existente: `/server` do projeto web (DeepSeek), configurável por ambiente

A `DEEPSEEK_API_KEY` permanece **somente no servidor** e nunca deve ser exposta em variáveis `EXPO_PUBLIC_*`.

> O backend **não foi duplicado** neste repositório. O mobile consome os mesmos endpoints já utilizados pelo web.

## Funcionalidades portadas

- Login e cadastro
- Login Google/Firebase
- 2FA e recuperação de senha
- Pesquisa de veículos e marcas, incluindo polling de jobs de pesquisa
- Modelo atual/futuro com confiança por informação e estado **Confirmado / Especulativo**
- Comparação direta de dois veículos
- Parecer de IA, pontos fortes/fracos, análise geral e confiança dos dados usados pela análise
- Favoritos e comparações salvas
- BCI Notas com vínculo a veículos
- Alertas/notificações
- Insights de mercado
- Perfil, foto e 2FA
- Workspace colaborativo

## Rodando localmente

### 1. Requisitos

- Node.js 22.13+ (requisito do Expo SDK 57)
- npm
- Android Studio, Xcode ou um aparelho com Expo/Development Build

### 2. Instalação

```bash
npm install
npx expo install --fix
```

O `expo install --fix` é recomendado para alinhar automaticamente as versões dos módulos nativos ao SDK instalado.

### 3. Variáveis de ambiente

Copie `.env.example` para `.env`:

```bash
cp .env.example .env
```

Preencha:

```env
EXPO_PUBLIC_API_BASE_URL=https://apiford.onrender.com
EXPO_PUBLIC_AI_SERVER_URL=https://bci-a105.onrender.com

EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=primordial-veld-437611-u8.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=primordial-veld-437611-u8
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=primordial-veld-437611-u8.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=487635748207
EXPO_PUBLIC_FIREBASE_APP_ID=...

EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=...
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=...
```

Os valores Firebase devem corresponder ao mesmo projeto já usado pelo BCI web. Para Google OAuth, cadastre no Google/Firebase os client IDs de Android/iOS e o scheme/bundle do app.

### 4. Iniciar o Metro

```bash
npx expo start
```

Para Android:

```bash
npx expo start --android
```

Para iOS:

```bash
npx expo start --ios
```

### 5. Serviço de IA

O app usa o servidor hospedado `https://bci-a105.onrender.com`, configurado por `EXPO_PUBLIC_AI_SERVER_URL`. Se a variável não estiver definida, a tela informa `Servidor de IA não configurado.`; não há fallback local. Para testar outro servidor, configure uma URL acessível no ambiente sem adicionar chaves ao app.

## Google Sign-In

O fluxo web `signInWithPopup` não existe em React Native. O mobile usa `expo-auth-session` para obter o Google ID Token, autentica o usuário no Firebase e envia o mesmo token ao endpoint existente `/User/login/google`.

Para um fluxo Google mais nativo no futuro, é possível trocar apenas a camada cliente por `@react-native-google-signin/google-signin`, mantendo o mesmo backend.

## Sessão e storage

No web, o BCI usa `localStorage`. No mobile:

- `accessToken` → Expo SecureStore
- `currentUser` → AsyncStorage
- dados locais por usuário → AsyncStorage com chave escopada pelo ID/e-mail

Uma resposta HTTP 401 limpa a sessão e retorna o usuário ao fluxo de autenticação.

## Confiabilidade: confirmado vs. especulativo

O backend já retorna `Confianca` e `Conflito` nos envelopes dos dados. A camada mobile **não altera esses valores**.

A UI usa uma regra de apresentação:

- **Confirmado:** confiança `>= 70%` e sem conflito
- **Especulativo:** confiança `< 70%` ou campo marcado com conflito

Modelos com ano futuro recebem também o badge `MODELO FUTURO`, mas isso **não transforma automaticamente todos os campos em especulativos**. Uma informação futura pode continuar confirmada se o backend devolver confiança suficiente e ausência de conflito.

## Mapeamento web → mobile

| Web | Mobile | Adaptação |
|---|---|---|
| `/` Login | `LoginScreen` | fotografia full-bleed + formulário empilhado |
| `/register` | `RegisterScreen` | formulário mobile com identidade do login |
| `/welcome` | `WelcomeScreen` | onboarding de nome de exibição |
| `/home` | `HomeScreen` | métricas e ações rápidas |
| `/search` | `SearchScreen` | filtros + catálogo + polling de pesquisa |
| `/information/:id` | `VehicleDetailScreen` | ficha empilhada + badges de confiança |
| `/compare` | `CompareScreen` | seleção de dois modelos |
| `/compare/detail` | `CompareResultScreen` | tabela horizontal + análise IA |
| `/saved` | `SavedScreen` | abas modelos/comparações |
| `/notes` | `NotesScreen` | lista de BCI Notas |
| Floating Notes | `NoteEditorScreen` | editor dedicado, melhor para touch |
| `/alerts` | `AlertsScreen` | feed de notificações |
| `/insights` | `InsightsScreen` | visualizações simplificadas para mobile |
| `/profile` | `ProfileScreen` | conta e segurança |
| `/edit-profile` | `EditProfileScreen` | edição + foto + 2FA |
| `/reset-password` | `ResetPasswordScreen` | fluxo em etapas |
| `/workspace` | `WorkspaceAccessScreen` | criar/entrar em time |
| `/workspace/:id` | `WorkspaceScreen` | feed colaborativo |
| Sidebar | Drawer | navegação lateral nativa |

## Identidade visual

Mantida no mobile:

- Anton para títulos
- Titillium Web para corpo
- `#00142E` navy principal
- `#0562D2` azul de ação
- `#666666`, `#333333`, `#000000`
- fotografia editorial
- títulos grandes e condensados
- espaço negativo
- botões pílula com profundidade 3D
- contraste claro/escuro

## Estrutura

```text
src/
├── components/
├── context/
├── data/
├── navigation/
├── hooks/
├── screens/
├── services/
├── theme/
└── utils/
```

Os estilos ficam separados dos componentes em `styles.js`; a lógica de API permanece isolada em `services/`.

## Observações sobre Insights

A tela `Insights` do web usa dados demonstrativos e traz no próprio código a indicação de que são fictícios. O mobile preserva esse comportamento e deixa isso explícito na interface. Quando a fonte analítica real estiver disponível, basta substituir `src/data/insights.js` por um service sem alterar a composição da tela.

## Build com EAS

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --profile preview --platform android
```

O projeto inclui `eas.json` com perfis `development`, `preview` e `production`.
