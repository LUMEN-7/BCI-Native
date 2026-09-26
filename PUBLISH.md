# Publicar no GitHub

O pacote `BCI-Mobile-repository.zip` preserva a pasta `.git` e já vem com um commit inicial na branch `main`. Se você estiver usando apenas o ZIP de código-fonte (`BCI-Mobile.zip`), rode `git init -b main && git add . && git commit -m "feat: port BCI to React Native Expo"` antes dos comandos abaixo.

Crie no GitHub um repositório vazio chamado, por exemplo, `LUMEN-7/BCI-Mobile` **sem README, .gitignore ou licença**. Depois, dentro desta pasta:

```bash
git remote add origin https://github.com/LUMEN-7/BCI-Mobile.git
git push -u origin main
```

Se preferir SSH:

```bash
git remote add origin git@github.com:LUMEN-7/BCI-Mobile.git
git push -u origin main
```

Não copie o diretório `/server` do repositório web para cá: o aplicativo mobile foi desenhado para consumir o backend existente, conforme documentado no README.
