# Foodie App - API de Autenticação

Base URL: `http://localhost:3000`

## Variáveis de Ambiente do Postman

Configure as seguintes variáveis na coleção do Postman:

| Variável | Valor Inicial | Descrição |
|----------|---------------|-----------|
| `baseUrl` | `http://localhost:3000` | URL base da API |
| `accessToken` | (vazio) | Token de acesso JWT |
| `refreshToken` | (vazio) | Token de refresh |

---

## Endpoints de Autenticação

### 1. Login
**POST** `/api/auth/login`

Autentica o usuário com email e senha.

```json
{
    "email": "usuario@exemplo.com",
    "password": "senha123"
}
```

**Resposta Sucesso (200):**
```json
{
    "user": {
        "id": "uuid-do-usuario",
        "email": "usuario@exemplo.com",
        "emailConfirmed": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "profile": {
        "id": "uuid-do-perfil",
        "role": "CLIENTE",
        "full_name": "Nome Completo"
    },
    "session": {
        "accessToken": "eyJ...",
        "refreshToken": "eyJ...",
        "expiresIn": 3600,
        "expiresAt": 1704067200
    }
}
```

**Resposta Erro (401):**
```json
{
    "error": "Invalid login credentials"
}
```

---

### 2. Registro
**POST** `/api/auth/register`

Cria um novo usuário.

```json
{
    "email": "novo@exemplo.com",
    "password": "senha123",
    "fullName": "Nome Completo",
    "role": "CLIENTE"
}
```

**Parâmetros:**
- `email` (obrigatório): Email válido
- `password` (obrigatório): Mínimo 6 caracteres
- `fullName` (obrigatório): Mínimo 2 caracteres
- `role` (opcional): CLIENTE, ADMIN, GERENCIADOR, EQUIPE (padrão: CLIENTE)

**Resposta Sucesso (200):**
```json
{
    "success": true,
    "message": "Usuário criado com sucesso. Verifique seu email para confirmar o cadastro.",
    "user": {
        "id": "uuid-do-usuario",
        "email": "novo@exemplo.com"
    }
}
```

---

### 3. Logout
**POST** `/api/auth/login`

Encerra a sessão do usuário.

**Resposta Sucesso (200):**
```json
{
    "success": true,
    "message": "Logout realizado com sucesso"
}
```

---

### 4. Reset Password
**POST** `/api/auth/reset-password`

Envia email de recuperação de senha.

```json
{
    "email": "usuario@exemplo.com"
}
```

**Resposta Sucesso (200):**
```json
{
    "success": true,
    "message": "Email de recuperação enviado com sucesso"
}
```

---

### 5. Update Password
**POST** `/api/auth/update-password`

Atualiza a senha do usuário autenticado.

```json
{
    "password": "novaSenha123"
}
```

**Headers Necessários:**
```
Authorization: Bearer {accessToken}
```

**Resposta Sucesso (200):**
```json
{
    "success": true,
    "message": "Senha atualizada com sucesso"
}
```

---

### 6. Refresh Token
**POST** `/api/auth/refresh`

Renova o token de acesso usando o refresh token.

```json
{
    "refreshToken": "eyJ..."
}
```

**Resposta Sucesso (200):**
```json
{
    "session": {
        "accessToken": "eyJ...",
        "refreshToken": "eyJ...",
        "expiresIn": 3600,
        "expiresAt": 1704067200
    },
    "user": {
        "id": "uuid-do-usuario",
        "email": "usuario@exemplo.com"
    }
}
```

---

### 7. Get Current User (Me)
**GET** `/api/auth/me`

Retorna os dados do usuário autenticado.

**Headers Necessários:**
```
Authorization: Bearer {accessToken}
```

**Resposta Sucesso (200):**
```json
{
    "isAuthenticated": true,
    "user": {
        "id": "uuid-do-usuario",
        "email": "usuario@exemplo.com",
        "emailConfirmed": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "profile": {
        "id": "uuid-do-perfil",
        "role": "CLIENTE",
        "full_name": "Nome Completo",
        "phone": "11999999999",
        "avatar_url": "https://..."
    }
}
```

---

## Endpoints de Perfil

### 8. Get Profile
**GET** `/api/profile`

Retorna o perfil do usuário autenticado.

**Headers Necessários:**
```
Authorization: Bearer {accessToken}
```

**Resposta Sucesso (200):**
```json
{
    "id": "uuid-do-perfil",
    "email": "usuario@exemplo.com",
    "fullName": "Nome Completo",
    "phone": "11999999999",
    "avatarUrl": "https://...",
    "role": "CLIENTE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

---

### 9. Update Profile
**PUT** `/api/profile`

Atualiza o perfil do usuário autenticado.

**Headers Necessários:**
```
Authorization: Bearer {accessToken}
```

```json
{
    "fullName": "Novo Nome",
    "phone": "11999999999",
    "avatarUrl": "https://exemplo.com/avatar.jpg"
}
```

**Resposta Sucesso (200):**
```json
{
    "success": true,
    "message": "Perfil atualizado com sucesso",
    "profile": {
        "id": "uuid-do-perfil",
        "fullName": "Novo Nome",
        "phone": "11999999999",
        "avatarUrl": "https://exemplo.com/avatar.jpg"
    }
}
```

---

## Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 400 | Erro de validação / Requisição inválida |
| 401 | Não autenticado |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

---

## Fluxo de Autenticação

```
1. Registro (register)
   └── Recebe email de confirmação

2. Login (login)
   └── Recebe accessToken e refreshToken
   └── Salvar tokens nas variáveis de ambiente

3. Requisições autenticadas
   └── Incluir header: Authorization: Bearer {accessToken}

4. Token expirado
   └── Usar refresh (refresh)
   └── Atualizar tokens nas variáveis

5. Logout (logout)
   └── Limpar tokens das variáveis
```

---

## Roles de Usuário

| Role | Descrição |
|------|-----------|
| CLIENTE | Cliente padrão do app |
| ADMIN | Administrador do sistema |
| GERENCIADOR | Gerente do restaurante |
| EQUIPE | Membro da equipe (cozinheiro, garçom) |

---

## Como importar no Postman

1. Abra o Postman
2. Vá em **File > Import**
3. Arraste o arquivo `postman-documentation.json`
4. Configure as variáveis de ambiente
5. Execute as requisições na ordem:
   - Register (criar usuário)
   - Login (obter tokens)
   - Usar os tokens nas outras requisições

---

## Testes Automatizados

O arquivo `postman-tests.js` contém testes automatizados que:
- Salvam automaticamente os tokens após login
- Validam respostas
- Limpam tokens após logout

Para usar, adicione o conteúdo do arquivo na aba **Tests** de cada requisição.
