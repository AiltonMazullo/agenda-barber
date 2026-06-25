# Recuperação de Senha — Agendle API

## Visão geral

Existem **dois fluxos independentes**: um para **barbearias** (donos/barbeiros) e outro para **clientes**. O formulário de solicitação deve direcionar cada tipo de usuário para a rota correta. O formulário de redefinição pode ser único e compartilhado, mas precisa saber qual rota de reset chamar.

Base URL: `https://<domínio>/auth`  
Todas as requisições: `Content-Type: application/json`  
Autenticação: **nenhuma** dessas rotas exige token.

---

## Fluxo — Barbearia

### Passo 1 · Solicitar recuperação

**`POST /auth/forgot-password`**

**Body:**
| Campo | Tipo   | Regra        |
|-------|--------|--------------|
| email | string | e-mail válido |

**Respostas:**

| Status | Quando                        | Body                                                                                      |
|--------|-------------------------------|-------------------------------------------------------------------------------------------|
| 200    | Sempre (e-mail existe ou não) | `{ "message": "Se o e-mail estiver cadastrado, você receberá as instruções em breve." }` |
| 422    | E-mail com formato inválido   | `{ "errors": [...] }` — array de erros Zod                                               |

> O 200 é intencional mesmo para e-mails não cadastrados. Não tente inferir se o usuário existe pela resposta — exiba sempre a mensagem genérica.

---

### Link recebido no e-mail

```
https://<FRONTEND_URL>/reset-password?token=<uuid>
```

| Detalhe          | Valor                                 |
|------------------|---------------------------------------|
| Formato do token | UUID v4                               |
| Validade         | 1 hora a partir do envio              |
| Uso único        | Sim — inválido imediatamente após uso |

**O que o front deve fazer:**  
Ler o parâmetro `token` da query string e armazená-lo para enviar no Passo 2.

```js
const token = new URLSearchParams(window.location.search).get('token')
```

---

### Passo 2 · Redefinir a senha

**`POST /auth/reset-password`**

**Body:**
| Campo    | Tipo   | Regra                             |
|----------|--------|-----------------------------------|
| token    | string | UUID v4 extraído da URL do e-mail |
| password | string | mínimo 8 caracteres               |

**Respostas:**

| Status | Quando                                     | Body                                           |
|--------|--------------------------------------------|------------------------------------------------|
| 200    | Senha alterada com sucesso                 | `{ "message": "Senha alterada com sucesso." }` |
| 400    | Token inválido, já usado ou expirado       | `{ "message": "Token inválido ou expirado" }`  |
| 422    | Token não é UUID válido ou senha < 8 chars | `{ "errors": [...] }`                          |

---

## Fluxo — Cliente

Mesma lógica do fluxo de barbearia, apenas com rotas diferentes.

### Passo 1 · Solicitar recuperação

**`POST /auth/client/forgot-password`**

**Body:**
| Campo | Tipo   | Regra        |
|-------|--------|--------------|
| email | string | e-mail válido |

**Respostas:** idênticas ao fluxo de barbearia.

> Se o mesmo e-mail estiver vinculado a mais de uma barbearia, o servidor envia um e-mail separado para cada conta.

---

### Link recebido no e-mail

Formato idêntico ao da barbearia:

```
https://<FRONTEND_URL>/reset-password?token=<uuid>
```

---

### Passo 2 · Redefinir a senha

**`POST /auth/client/reset-password`**

**Body:**
| Campo    | Tipo   | Regra                             |
|----------|--------|-----------------------------------|
| token    | string | UUID v4 extraído da URL do e-mail |
| password | string | mínimo 8 caracteres               |

**Respostas:** idênticas ao fluxo de barbearia.

---

## Tratamento de erros recomendado

| Situação                   | O que mostrar ao usuário                                                                      |
|----------------------------|-----------------------------------------------------------------------------------------------|
| 200 no forgot-password     | Mensagem genérica de sucesso, independente do e-mail existir ou não                          |
| 400 no reset-password      | "Este link é inválido ou expirou. Solicite um novo link." + botão para voltar ao forgot-password |
| 422 em qualquer rota       | Destacar o campo inválido com a mensagem do array `errors`                                    |
| Usuário abre link após 1h  | 400 — exibir aviso de expiração e opção de reenvio                                           |
