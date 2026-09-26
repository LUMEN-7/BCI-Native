# Changelog / decisões da migração

## 1.0.0 — Port React Native / Expo

### Arquitetura

- React Router foi substituído por React Navigation.
- A sidebar foi convertida em Drawer nativo.
- HTML/CSS não foi reutilizado; as telas foram reconstruídas com componentes React Native e `StyleSheet`.
- A camada `services/` mantém os endpoints do backend existente.
- O servidor `/server` não foi copiado para evitar duplicação de lógica.

### Autenticação

- `localStorage` → SecureStore/AsyncStorage.
- `signInWithPopup` → `expo-auth-session` + Firebase credential.
- Foi criada uma tela explícita de 2FA, corrigindo o fluxo web que navega para `/verificar-2fa` sem registrar essa rota no Router atual.

### Confiabilidade

- `Confianca` e `Conflito` continuam sendo a fonte de verdade.
- A classificação Confirmado/Especulativo é somente uma interpretação visual do mobile.
- Threshold visual inicial: 70% e ausência de conflito para Confirmado.

### Comparação

- O endpoint `/Comparacao/direta` continua sendo a análise estrutural principal.
- `/api/ai/compare` complementa o resultado com texto interpretativo.
- O layout desktop lado a lado foi adaptado para uma tabela horizontal rolável no mobile.

### Notas

- O floating editor do desktop virou tela dedicada, evitando uma janela flutuante inadequada para touch.
- Vínculos com veículos usam os mesmos blocos `CardCarro` do backend.

### Insights

- Os dados continuam demonstrativos, como no web atual.
- Os gráficos desktop foram convertidos em indicadores/bar charts simples sem adicionar uma dependência pesada de visualização.

### Workspace

- Mantidos criação/entrada em equipes e feed básico para preservar o fluxo existente fora do escopo principal solicitado.

### Fora da primeira UI mobile

- Exportação de CSV/XLSX/ZIP e importação avançada de veículos não fazem parte do escopo funcional explícito desta entrega. Os contratos do backend permanecem intactos e podem ser adicionados depois via FileSystem/Sharing/DocumentPicker sem mudança no servidor.
