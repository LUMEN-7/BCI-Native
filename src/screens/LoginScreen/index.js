import { useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
} from "react-native";

import {
  GoogleOneTapSignIn,
  isCancelledResponse,
  isSuccessResponse,
} from "react-native-nitro-google-signin";

import FormField from "../../components/FormField";
import AppButton from "../../components/AppButton";

import {
  login,
  loginWithGoogle,
} from "../../services/authService";

import { useAuth } from "../../context/AuthContext";
import { isValidEmail } from "../../utils/validators";

import styles from "./styles";

/*
 * O webClientId é detectado automaticamente a partir
 * do google-services.json / GoogleService-Info.plist.
 */
GoogleOneTapSignIn.configure({
  webClientId: "autoDetect",
});

export default function LoginScreen({ navigation }) {
  const { establish } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function finish(result) {
    if (result?.requiresTwoFactor) {
      navigation.navigate("TwoFactor", {
        challengeToken: result.challengeToken,
      });

      return;
    }

    await establish(result);
  }

  async function submit() {
    if (!isValidEmail(email) || !password) {
      setError("Informe um e-mail válido e sua senha.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await login(
        email.trim(),
        password
      );

      await finish(result);
    } catch (e) {
      setError(
        e?.message ||
          "Usuário ou senha incorretos."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    setError("");

    try {
      /*
       * authenticate() já executa o fluxo completo:
       *
       * - verifica Google Play Services no Android
       * - tenta recuperar uma conta já autenticada
       * - abre o seletor de contas quando necessário
       * - solicita login explícito se necessário
       *
       * Portanto não precisamos mais lidar manualmente
       * com redirect URI ou expo-auth-session.
       */
      const response =
        await GoogleOneTapSignIn.authenticate();

      if (isCancelledResponse(response)) {
        return;
      }

      if (!isSuccessResponse(response)) {
        throw new Error(
          "Não foi possível concluir o login com Google."
        );
      }

      const idToken = response.data?.idToken;

      if (!idToken) {
        throw new Error(
          "O Google não retornou um ID Token."
        );
      }

      /*
       * Mantemos exatamente o fluxo que seu backend
       * já utilizava.
       *
       * POST /User/login/google
       * {
       *   idToken
       * }
       */
      const result =
        await loginWithGoogle(idToken);

      await finish(result);
    } catch (e) {
      console.error(
        "Erro Google Sign-In:",
        e
      );

      setError(
        e?.message ||
          "Não foi possível entrar com Google."
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <View style={styles.shell}>
        <ImageBackground
          source={{
            uri: "https://wallpapercave.com/wp/wp12639722.jpg",
          }}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.overlay} />

          <View style={styles.heroCopy}>
            <Text style={styles.kicker}>
              BUSINESS COMPETITIVE
            </Text>

            <Text style={styles.heroTitle}>
              INTELIGÊNCIA
              {`\n`}
              PARA IR ALÉM.
            </Text>
          </View>
        </ImageBackground>

        <View style={styles.form}>
          <Text style={styles.formKicker}>
            BEYOND COMPARE INTELLIGENCE
          </Text>

          <Text style={styles.title}>
            ENTRE NO BCI
          </Text>

          <Text style={styles.subtitle}>
            Pesquisa competitiva,
            comparação e inteligência
            automotiva em um só lugar.
          </Text>

          <FormField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <FormField
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {error ? (
            <Text style={styles.error}>
              {error}
            </Text>
          ) : null}

          <AppButton
            title="Entrar"
            onPress={submit}
            loading={loading}
            disabled={
              loading || googleLoading
            }
          />

          <AppButton
            title="Continuar com Google"
            variant="secondary"
            onPress={handleGoogleLogin}
            loading={googleLoading}
            disabled={
              loading || googleLoading
            }
          />

          <Text
            style={styles.link}
            onPress={() =>
              navigation.navigate(
                "ResetPassword"
              )
            }
          >
            Esqueci minha senha
          </Text>

          <Text style={styles.footer}>
            Ainda não tem conta?{" "}
            <Text
              style={styles.linkStrong}
              onPress={() =>
                navigation.navigate(
                  "Register"
                )
              }
            >
              Criar conta
            </Text>
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}