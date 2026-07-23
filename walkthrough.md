# Walkthrough: Movyra ERP - SaaS Multi-Tenant & Controle de Lutas

O **Movyra** foi promovido para uma estrutura SaaS Multi-Tenant completa com módulos adaptáveis aos segmentos de atuação do profissional.

---

## 🚀 Novidades de Arquitetura & Código

### 1. Multi-Tenancy (Isolamento por Banco de Dados)
- O modelo relacional do Prisma separa os dados por `Tenant` (Empresa ou Pessoa Física).
- Todos os controladores (`studentController`, `expenseController`, `paymentController`) filtram e persistem registros isolados através do `req.user.tenantId`.
- Autenticação e cadastro unificados com transações bancárias robustas para garantir consistência.

### 2. Cadastro Adaptável e Verificação
- O usuário escolhe seu perfil no cadastro:
  - **Pessoa Física**: Pede CPF e CREF opcional.
  - **Pessoa Jurídica (Academia)**: Pede CNPJ, Razão Social e Nome Fantasia.

### 3. Painel de Lutas e Graduações
- Caso o Tenant selecione o segmento **Artes Marciais**:
  - Habilita-se o menu **Progresso Lutas** no painel lateral do frontend.
  - O sistema monitora a data da última promoção e indica se o atleta está **Apto à Graduação** (tempo de permanência mínimo na faixa).
  - Controle gráfico dos graus/listras (0 a 4 listras na faixa) e modais para promoção de faixa e nota.

---

## 🛠️ Como Testar Agora Mesmo (Simulador Frontend Integrado)

O frontend possui inteligência local para simular o comportamento multi-tenant mesmo offline:

1. **Testando como Academia (PJ) com Artes Marciais**:
   - Acesse o painel.
   - Clique na aba **Cadastrar-se**.
   - Escolha **Pessoa Jurídica (Academia)**, insira um CNPJ e selecione os segmentos **Artes Marciais** e **Personal Trainer**.
   - Complete o cadastro e entre.
   - O painel lateral exibirá o menu **"Progresso Lutas"**.
   - Acesse a aba **Alunos** e cadastre um aluno com vínculo **"Lutas"**.
   - Vá no menu **"Progresso Lutas"** e veja a ficha de graduação do atleta inicializada na faixa Branca com 0 graus!
   - Clique em **"Graduar Atleta"** para testar a promoção de faixas (azul, roxa, marrom, preta) e graus (1 a 4).

2. **Testando como Personal Trainer Puro (PF)**:
   - Cadastre uma conta como **Pessoa Física**, insira o CPF e selecione **apenas o segmento Personal Trainer**.
   - Note que o menu **"Progresso Lutas"** sumirá do painel lateral e a opção de vincular novos alunos à luta será oculta nos formulários de cadastro!
