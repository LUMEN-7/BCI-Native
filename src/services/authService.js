import apiFetch from './api';

function normalizeLoginResult(result) {
  if (result?.requerDoisFatores) {
    return { requiresTwoFactor: true, challengeToken: result.tokenDesafio };
  }

  return {
    requiresTwoFactor: false,
    accessToken: result?.accessToken,
    user: result?.usuario,
  };
}

export async function login(email, password) {
  return normalizeLoginResult(await apiFetch('/User/login', {
    method: 'POST',
    skip401Redirect: true,
    body: JSON.stringify({ userIdentifier: email, password }),
  }));
}

export async function register(name, email, password, profilePhotoUrl = null) {
  return normalizeLoginResult(await apiFetch('/user/cadastro', {
    method: 'POST',
    body: JSON.stringify({
      Nome: name,
      Email: email,
      Password: password,
      FotoPerfilUrl: profilePhotoUrl,
    }),
  }));
}

export async function loginWithGoogle(idToken) {
  return normalizeLoginResult(await apiFetch('/User/login/google', {
    method: 'POST',
    skip401Redirect: true,
    body: JSON.stringify({ idToken }),
  }));
}

export async function verifyTwoFactor(challengeToken, code) {
  return normalizeLoginResult(await apiFetch('/User/login/2fa', {
    method: 'POST',
    body: JSON.stringify({ tokenDesafio: challengeToken, codigo: code }),
  }));
}

export function requestPasswordReset(email) {
  return apiFetch('/User/esqueci-senha', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(email, code, newPassword) {
  return apiFetch('/User/redefinir-senha', {
    method: 'POST',
    body: JSON.stringify({ email, codigo: code, senhaNova: newPassword }),
  });
}
