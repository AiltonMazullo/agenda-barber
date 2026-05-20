# Documentação de Rotas — Agendle API

> Base URL: `http://localhost:3000` (desenvolvimento)
>
> Rotas protegidas exigem o header: `Authorization: Bearer <accessToken>`

---

## Autenticação

**Descrição:** Gerencia o acesso à plataforma. Responsável por emitir, renovar e revogar tokens JWT utilizados nas rotas protegidas.

### Rotas

#### `POST /auth/login`
Autentica um usuário e retorna os tokens de acesso.

**Body:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `email` | string (e-mail) | Sim | E-mail do usuário |
| `password` | string (mín. 6 chars) | Sim | Senha do usuário |

**Resposta:** `200 OK`
```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

#### `POST /auth/refresh`
Renova o `accessToken` a partir de um `refreshToken` válido.

**Body:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `refreshToken` | string | Sim | Token de renovação |

**Resposta:** `200 OK`
```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

#### `POST /auth/logout`
Encerra a sessão do usuário.

**Body:** nenhum

**Resposta:** `204 No Content`

---

---

## Barbearias (`Barbershop`)

**Descrição:** Armazena os dados cadastrais de cada barbearia na plataforma. Cada barbearia pertence a um usuário dono (`ownerId`) e possui um `slug` único que a identifica nas URLs.

### Rotas

#### `GET /barbershops`
Lista todas as barbearias. Rota pública.

**Resposta:** `200 OK` — array de barbearias.

---

#### `GET /barbershops/:slug`
Retorna os detalhes de uma barbearia pelo slug. 🔒 Requer autenticação.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `slug` | string | Identificador único da barbearia |

**Resposta:** `200 OK` — objeto da barbearia.

---

#### `POST /barbershops`
Cria uma nova barbearia junto com o usuário dono. Rota pública (registro).

**Body:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `name` | string (mín. 2) | Sim | Nome da barbearia |
| `slug` | string (mín. 2, apenas `a-z`, `0-9` e `-`) | Sim | Slug único para URL |
| `email` | string (e-mail) | Sim | E-mail do dono |
| `password` | string (mín. 6) | Sim | Senha do dono |
| `phone` | string (formato BR) | Sim | Telefone da barbearia |
| `address` | string | Sim | Endereço principal |
| `personType` | `"FISICA"` \| `"JURIDICA"` | Sim | Tipo de pessoa |
| `cpf` | string | Se `personType = FISICA` | CPF do responsável |
| `cnpj` | string | Se `personType = JURIDICA` | CNPJ da empresa |

**Resposta:** `201 Created` — objeto da barbearia criada.

---

#### `PUT /barbershops/:id`
Atualiza os dados de uma barbearia. 🔒 Requer autenticação (somente o dono).

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `id` | string | ID da barbearia |

**Body (todos opcionais):**
| Campo | Tipo | Descrição |
|---|---|---|
| `name` | string (mín. 2) | Novo nome |
| `phone` | string | Novo telefone |
| `address` | string | Novo endereço |

**Resposta:** `200 OK` — objeto da barbearia atualizada.

---

#### `DELETE /barbershops/:id`
Remove uma barbearia. 🔒 Requer autenticação (somente o dono).

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `id` | string | ID da barbearia |

**Resposta:** `204 No Content`

---

---

## Filiais (`Branch`)

**Descrição:** Armazena as unidades/filiais de uma barbearia. Uma barbearia pode ter múltiplas filiais com endereços e contatos próprios.

> Todas as rotas de filiais são 🔒 protegidas e exigem autenticação.

**Prefixo:** `/barbershops/:barbershopId/branches`

### Rotas

#### `GET /barbershops/:barbershopId/branches`
Lista todas as filiais de uma barbearia.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |

**Resposta:** `200 OK` — array de filiais.

---

#### `POST /barbershops/:barbershopId/branches`
Cria uma nova filial.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |

**Body:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `name` | string (mín. 1) | Sim | Nome da filial |
| `email` | string (e-mail) | Sim | E-mail da filial |
| `phone` | string (mín. 1) | Sim | Telefone da filial |
| `cep` | string (8–9 chars) | Sim | CEP |
| `street` | string (mín. 1) | Sim | Logradouro |
| `neighborhood` | string (mín. 1) | Sim | Bairro |
| `city` | string (mín. 1) | Sim | Cidade |
| `uf` | string (2 chars) | Sim | UF (ex: `SP`) |
| `number` | string (mín. 1) | Sim | Número |
| `complement` | string | Não | Complemento |

**Resposta:** `201 Created` — objeto da filial criada.

---

#### `PUT /barbershops/:barbershopId/branches/:id`
Atualiza os dados de uma filial.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |
| `id` | string | ID da filial |

**Body (todos opcionais):**
| Campo | Tipo | Descrição |
|---|---|---|
| `email` | string (e-mail) | Novo e-mail |
| `phone` | string (mín. 1) | Novo telefone |
| `cep` | string (8–9 chars) | CEP |
| `street` | string (mín. 1) | Logradouro |
| `neighborhood` | string (mín. 1) | Bairro |
| `city` | string (mín. 1) | Cidade |
| `uf` | string (2 chars) | UF |
| `number` | string (mín. 1) | Número |
| `complement` | string | Complemento |

**Resposta:** `200 OK` — objeto da filial atualizada.

---

#### `DELETE /barbershops/:barbershopId/branches/:id`
Remove uma filial.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |
| `id` | string | ID da filial |

**Resposta:** `204 No Content`

---

---

## Funcionários (`Employee`)

**Descrição:** Armazena os dados dos colaboradores de uma barbearia, incluindo informações pessoais, de contato, endereço e vínculo com uma filial.

> Todas as rotas de funcionários são 🔒 protegidas.

**Prefixo:** `/barbershops/:barbershopId/employees`

### Rotas

#### `GET /barbershops/:barbershopId/employees`
Lista todos os funcionários de uma barbearia.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |

**Resposta:** `200 OK` — array de funcionários.

---

#### `POST /barbershops/:barbershopId/employees`
Cadastra um novo funcionário.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |

**Body:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `name` | string (mín. 2) | Sim | Nome completo |
| `appName` | string (mín. 2) | Sim | Nome exibido no app |
| `email` | string (e-mail) | Sim | E-mail de acesso |
| `password` | string (mín. 6) | Sim | Senha de acesso |
| `phone` | string (mín. 10) | Sim | Telefone |
| `group` | string (mín. 1) | Sim | Grupo/função do funcionário |
| `branchId` | string (CUID) | Sim | ID da filial vinculada |
| `pixKey` | string (mín. 1) | Sim | Chave Pix |
| `cpf` | string | Não | CPF |
| `cnpj` | string | Não | CNPJ |
| `birthDate` | string (ISO 8601) | Não | Data de nascimento |
| `hasBranchAccess` | boolean | Não | Acesso à filial (padrão: `false`) |
| `cep` | string (mín. 8) | Sim | CEP |
| `street` | string (mín. 2) | Sim | Logradouro |
| `neighborhood` | string (mín. 2) | Sim | Bairro |
| `city` | string (mín. 2) | Sim | Cidade |
| `uf` | string (2 chars) | Sim | UF |
| `number` | string (mín. 1) | Sim | Número |
| `complement` | string | Não | Complemento |

**Resposta:** `201 Created` — objeto do funcionário criado.

---

#### `PUT /barbershops/:barbershopId/employees/:id`
Atualiza os dados de um funcionário.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |
| `id` | string | ID do funcionário |

**Body (todos opcionais):**
| Campo | Tipo | Descrição |
|---|---|---|
| `name` | string (mín. 2) | Nome completo |
| `appName` | string (mín. 2) | Nome no app |
| `email` | string (e-mail) | E-mail |
| `password` | string (mín. 6) | Senha |
| `phone` | string (mín. 10) | Telefone |
| `group` | string (mín. 1) | Grupo/função |
| `branchId` | string (CUID) | Filial |
| `pixKey` | string (mín. 1) | Chave Pix |
| `cpf` | string | CPF |
| `cnpj` | string | CNPJ |
| `birthDate` | string (ISO 8601) | Data de nascimento |
| `hasBranchAccess` | boolean | Acesso à filial |
| `cep` | string (mín. 8) | CEP |
| `street` | string (mín. 2) | Logradouro |
| `neighborhood` | string (mín. 2) | Bairro |
| `city` | string (mín. 2) | Cidade |
| `uf` | string (2 chars) | UF |
| `number` | string (mín. 1) | Número |
| `complement` | string | Complemento |

**Resposta:** `200 OK` — objeto do funcionário atualizado.

---

#### `DELETE /barbershops/:barbershopId/employees/:id`
Remove um funcionário.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |
| `id` | string | ID do funcionário |

**Resposta:** `204 No Content`

---

---

## Serviços (`Service`)

**Descrição:** Armazena os serviços oferecidos por uma barbearia (ex: corte, barba, pigmentação). Cada serviço tem duração em minutos e preço em centavos.

**Prefixo:** `/barbershops/:barbershopId/services`

### Rotas

#### `GET /barbershops/:barbershopId/services`
Lista todos os serviços de uma barbearia. Rota pública.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |

**Resposta:** `200 OK` — array de serviços.

---

#### `POST /barbershops/:barbershopId/services`
Cria um novo serviço. 🔒 Requer autenticação.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |

**Body:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `name` | string (mín. 2) | Sim | Nome do serviço |
| `durationMin` | number (inteiro positivo) | Sim | Duração em minutos |
| `priceInCents` | number (inteiro positivo) | Sim | Preço em centavos (ex: `3000` = R$ 30,00) |
| `description` | string | Não | Descrição do serviço |
| `hex` | string | Não | Cor de identificação (hex) |

**Resposta:** `201 Created` — objeto do serviço criado.

---

#### `PUT /barbershops/:barbershopId/services/:id`
Atualiza um serviço. 🔒 Requer autenticação.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |
| `id` | string | ID do serviço |

**Body (todos opcionais):**
| Campo | Tipo | Descrição |
|---|---|---|
| `name` | string (mín. 2) | Nome |
| `durationMin` | number (inteiro positivo) | Duração em minutos |
| `priceInCents` | number (inteiro positivo) | Preço em centavos |
| `description` | string | Descrição |

**Resposta:** `200 OK` — objeto do serviço atualizado.

---

#### `DELETE /barbershops/:barbershopId/services/:id`
Remove um serviço. 🔒 Requer autenticação.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |
| `id` | string | ID do serviço |

**Resposta:** `204 No Content`

---

---

## Agendamentos (`Appointment`)

**Descrição:** Armazena os agendamentos de clientes em uma barbearia. Cada agendamento vincula um cliente, um serviço e uma data/hora. O status evolui de `PENDING` até `COMPLETED` ou `CANCELLED`.

> Todas as rotas de agendamentos são 🔒 protegidas.

**Prefixo:** `/barbershops/:barbershopId/appointments`

**Status possíveis:** `PENDING` | `CONFIRMED` | `CANCELLED` | `COMPLETED`

### Rotas

#### `GET /barbershops/:barbershopId/appointments`
Lista todos os agendamentos de uma barbearia.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |

**Resposta:** `200 OK` — array de agendamentos.

---

#### `POST /barbershops/:barbershopId/appointments`
Cria um novo agendamento.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |

**Body:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `serviceId` | string (CUID) | Sim | ID do serviço |
| `scheduledAt` | string (ISO 8601) | Sim | Data e hora do agendamento |

**Resposta:** `201 Created` — objeto do agendamento criado.

---

#### `PATCH /barbershops/:barbershopId/appointments/:id/status`
Atualiza o status de um agendamento.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |
| `id` | string | ID do agendamento |

**Body:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `status` | `"CONFIRMED"` \| `"CANCELLED"` \| `"COMPLETED"` | Sim | Novo status |

**Resposta:** `200 OK` — objeto do agendamento atualizado.

---

#### `DELETE /barbershops/:barbershopId/appointments/:id`
Remove um agendamento.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |
| `id` | string | ID do agendamento |

**Resposta:** `204 No Content`

---

---

## Produtos (`Product`)

**Descrição:** Armazena os produtos comercializados pela barbearia (roupas, cosméticos, acessórios, etc.). Inclui controle de estoque por filial.

> Todas as rotas de produtos são 🔒 protegidas.

**Prefixo:** `/barbershops/:barbershopId/products`

**Categorias disponíveis:** `CLOTHING` | `BARBERSHOP_COSMETICS` | `BAR` | `BARBERSHOP_ACCESSORIES`

**Status disponíveis:** `ACTIVE` | `INACTIVE`

### Rotas

#### `GET /barbershops/:barbershopId/products`
Lista todos os produtos de uma barbearia.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |

**Resposta:** `200 OK` — array de produtos.

---

#### `POST /barbershops/:barbershopId/products`
Cria um novo produto.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |

**Body:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `name` | string (mín. 1) | Sim | Nome do produto |
| `priceInCents` | number (inteiro positivo) | Sim | Preço em centavos |
| `category` | enum | Sim | Categoria do produto |
| `sku` | string | Não | Código SKU |
| `ncm` | string | Não | Código NCM (fiscal) |
| `gtin` | string | Não | Código de barras GTIN |
| `cest` | string | Não | Código CEST (fiscal) |
| `repurchasePeriodDays` | number (inteiro positivo) | Não | Período de recompra em dias |
| `status` | `"ACTIVE"` \| `"INACTIVE"` | Não | Status (padrão: `ACTIVE`) |

**Resposta:** `201 Created` — objeto do produto criado.

---

#### `PUT /barbershops/:barbershopId/products/:id`
Atualiza um produto.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |
| `id` | string | ID do produto |

**Body (todos opcionais):**
| Campo | Tipo | Descrição |
|---|---|---|
| `name` | string (mín. 1) | Nome |
| `priceInCents` | number (inteiro positivo) | Preço em centavos |
| `category` | enum | Categoria |
| `sku` | string | SKU |
| `ncm` | string | NCM |
| `gtin` | string | GTIN |
| `cest` | string | CEST |
| `repurchasePeriodDays` | number (inteiro positivo) | Período de recompra |
| `status` | `"ACTIVE"` \| `"INACTIVE"` | Status |

**Resposta:** `200 OK` — objeto do produto atualizado.

---

#### `DELETE /barbershops/:barbershopId/products/:id`
Remove um produto.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |
| `id` | string | ID do produto |

**Resposta:** `204 No Content`

---

#### `GET /barbershops/:barbershopId/products/:productId/stock`
Consulta o estoque de um produto em todas as filiais.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |
| `productId` | string | ID do produto |

**Resposta:** `200 OK` — dados de estoque por filial.

---

#### `PUT /barbershops/:barbershopId/products/:productId/stock/:branchId`
Atualiza o estoque de um produto em uma filial específica.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |
| `productId` | string | ID do produto |
| `branchId` | string | ID da filial |

**Body:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `minStock` | number (inteiro ≥ 0) | Sim | Estoque mínimo |
| `currentStock` | number (inteiro ≥ 0) | Sim | Estoque atual |

**Resposta:** `200 OK` — objeto de estoque atualizado.

---

---

## Dados de Pagamento (`PaymentData`)

**Descrição:** Armazena as credenciais de integração com o gateway de pagamento GalaxPay para uma barbearia. Cada barbearia possui no máximo um conjunto de credenciais.

> Todas as rotas são 🔒 protegidas.

**Prefixo:** `/barbershops/:barbershopId/payment-data`

### Rotas

#### `GET /barbershops/:barbershopId/payment-data`
Retorna os dados de pagamento de uma barbearia.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |

**Resposta:** `200 OK` — objeto com as credenciais.

---

#### `POST /barbershops/:barbershopId/payment-data`
Cadastra as credenciais de pagamento.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |

**Body:**
| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `galaxPayId` | string (mín. 1) | Sim | ID GalaxPay |
| `galaxPayHash` | string (mín. 1) | Sim | Hash GalaxPay |
| `galaxPaySecurityToken` | string (mín. 1) | Sim | Token de segurança |
| `galaxPayPublicToken` | string (mín. 1) | Sim | Token público |

**Resposta:** `201 Created` — objeto criado.

---

#### `PUT /barbershops/:barbershopId/payment-data`
Atualiza as credenciais de pagamento. Ao menos um campo deve ser informado.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |

**Body (ao menos um campo obrigatório):**
| Campo | Tipo | Descrição |
|---|---|---|
| `galaxPayId` | string (mín. 1) | ID GalaxPay |
| `galaxPayHash` | string (mín. 1) | Hash GalaxPay |
| `galaxPaySecurityToken` | string (mín. 1) | Token de segurança |
| `galaxPayPublicToken` | string (mín. 1) | Token público |

**Resposta:** `200 OK` — objeto atualizado.

---

#### `DELETE /barbershops/:barbershopId/payment-data`
Remove as credenciais de pagamento.

**Path params:**
| Param | Tipo | Descrição |
|---|---|---|
| `barbershopId` | string | ID da barbearia |

**Resposta:** `204 No Content`
