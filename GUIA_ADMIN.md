# 📊 Guia Completo - Painel Administrativo

## 🚀 Início Rápido

### 1️⃣ Abra o Site
```
http://localhost:8000
```

### 2️⃣ Faça Login com a Conta Admin
- **Email**: `admin@gf.com`
- **Senha**: `admin123456`

> **Nota**: A conta admin é criada automaticamente na primeira execução!

### 3️⃣ Acesse o Painel
- Após login bem-sucedido, um novo link "Administrador" aparecerá no menu
- Clique nele para entrar no painel administrativo

---

## 📋 Funcionalidades Principais

### Dashboard Principal
Ao abrir o painel, você vê 4 estatísticas em tempo real:

| Métrica | Descrição |
|---------|-----------|
| **Total de Usuários** | Quantidade de contas criadas |
| **Usuários Ativos** | Contas ativas no sistema |
| **Total de Cursos** | Quantidade de cursos disponíveis |
| **Receita Total** | Soma de todas as vendas |

---

## 🎯 Aba 1: Gerenciar Usuários

### Visualizar Usuários
A tabela exibe:
- **ID**: Identificador único do usuário
- **Nome**: Nome completo
- **E-mail**: Email de cadastro
- **Data Cadastro**: Quando se registrou
- **Último Login**: Último acesso ao sistema
- **Status**: Ativo ou Inativo (badge colorida)

### Ações Disponíveis

#### ✏️ Editar Usuário
1. Clique no botão **"Editar"** na linha do usuário
2. Um modal abrirá com os dados
3. Modifique o que desejar:
   - Nome
   - Status (Ativo/Inativo)
4. Clique em **"Salvar"**

#### 🗑️ Deletar Usuário
1. Clique no botão **"Deletar"** 
2. Confirme a exclusão
3. Usuário será removido do sistema

#### ➕ Novo Usuário
1. Clique em **"+ Novo Usuário"**
2. Preencha:
   - **Nome**: Nome completo
   - **Email**: Email único
   - **Status**: Ativo ou Inativo
3. Clique em **"Salvar"**
4. Usuário criado com senha padrão: `admin123`

---

## 📚 Aba 2: Gerenciar Cursos

### Visualizar Cursos
A tabela exibe:
- **ID**: Identificador do curso
- **Título**: Nome do curso
- **Instrutor**: Professor responsável
- **Categoria**: Programação, Design, Marketing, Negócios
- **Preço**: Valor do curso
- **Alunos**: Quantidade de inscritos

### Ações Disponíveis

#### ✏️ Editar Curso
1. Clique no botão **"Editar"**
2. Modifique os dados:
   - Título
   - Instrutor
   - Categoria
   - Preço
3. Clique em **"Salvar"**

#### 🗑️ Deletar Curso
1. Clique em **"Deletar"**
2. Confirme a exclusão
3. Curso será removido da plataforma

#### ➕ Novo Curso
1. Clique em **"+ Novo Curso"**
2. Preencha os campos:
   - **Título**: Nome do curso
   - **Instrutor**: Nome do professor
   - **Categoria**: Selecione uma opção
   - **Preço**: Valor em R$
3. Clique em **"Salvar"**
4. Curso será adicionado com dados padrão

---

## 💰 Aba 3: Relatório de Vendas

### Estatísticas de Vendas

| Métrica | Informação |
|---------|-----------|
| **Receita do Mês** | Total ganho no período |
| **Total de Vendas** | Quantidade de transações |
| **Ticket Médio** | Valor médio por compra |

### Tabela de Vendas
Mostra cada transação com:
- **Usuário**: Quem comprou
- **Curso**: O que foi vendido
- **Valor**: Preço da transação
- **Data**: Quando foi comprado
- **Status**: Estado da venda (Concluída)

### 📥 Exportar Relatório
1. Clique em **"Exportar Relatório"**
2. Um arquivo CSV será baixado automaticamente
3. Abra em Excel ou Google Sheets para análise

---

## 👥 Aba 4: Gerenciar Sessões

### Monitorar Sessões Ativas
A tabela exibe:
- **ID Sessão**: Código único da sessão
- **Usuário**: Quem está conectado
- **Data Criação**: Quando fez login
- **Expira em**: Quando a sessão encerra
- **Status**: Ativa ou Expirada

### Ações Disponíveis

#### 🚫 Revogar Sessão
1. Clique em **"Revogar"**
2. Confirme a ação
3. Usuário será desconectado forçadamente
4. Sessão entrará em "Expirada"

> **Dica**: Use quando um usuário esquecer de fazer logout ou acessar de dispositivo desconhecido

---

## 🔐 Sistema de Autenticação

### Como Funciona
- Senhas são **hasheadas** antes de serem armazenadas
- Dados são salvos no **localStorage** do navegador
- Sessões expiram após **24 horas**
- Apenas usuários com email contendo "admin" têm acesso ao painel

### Criar Mais Contas Admin
1. Na aba de Usuários, clique em **"+ Novo Usuário"**
2. Use um email que contenha "admin":
   - Exemplos: `admin2@gabryelcursos.com`, `gerente.admin@...`
3. Após criar, faça logout e login com essa conta
4. O painel admin aparecerá automaticamente!

---

## 💾 Dados e Armazenamento

### Onde os Dados São Salvos
- **localStorage do Navegador**: Todos os dados são armazenados localmente
- **Sem servidor necessário**: Funciona completamente offline
- **Backup**: Exporte regularmente os dados!

### Como Fazer Backup
1. Vá para a aba **"Vendas"**
2. Clique em **"Exportar Relatório"**
3. Guarde o arquivo CSV com segurança

### Limpar Dados (Cuidado!)
Para resetar tudo, abra o console do navegador (F12) e execute:
```javascript
localStorage.clear();
location.reload();
```

---

## 🎓 Exemplos de Uso

### Exemplo 1: Adicionar um Novo Curso
1. Login como admin
2. Acesse "Administrador" → "Cursos"
3. Clique em **"+ Novo Curso"**
4. Preencha:
   - Título: "Python Avançado"
   - Instrutor: "Prof. João Silva"
   - Categoria: "Programação"
   - Preço: "299.90"
5. Salve e veja o curso aparecer na página principal!

### Exemplo 2: Remover um Usuário Inativo
1. Vá para "Usuários"
2. Procure o usuário inativo
3. Clique em **"Deletar"**
4. Confirme
5. Usuário é removido da base de dados

### Exemplo 3: Gerar Relatório de Vendas
1. Acesse "Vendas"
2. Veja as estatísticas atualizadas
3. Clique em **"Exportar Relatório"**
4. Abra o CSV no Excel
5. Crie gráficos e análises

---

## ⚠️ Troubleshooting

### Problema: Não consigo fazer login
**Solução**: 
- Verifique se o email está correto: `admin@gabryelcursos.com`
- Verifique se a senha é: `admin123456`
- Limpe o cache do navegador (Ctrl+Shift+Delete)

### Problema: O link "Administrador" não aparece
**Solução**:
- O painel só aparece para contas com "admin" no email
- Verifique se fez login corretamente
- Faça logout e login novamente

### Problema: Os dados desapareceram
**Solução**:
- Os dados estão no localStorage
- Se limpou o cache, os dados se foram
- Não há backup automático - sempre exporte regularmente!

### Problema: Uma ação não funcionou
**Solução**:
- Abra o console (F12)
- Procure por mensagens de erro
- Faça um refresh da página (F5)
- Tente novamente

---

## 📱 Responsividade

O painel admin funciona em:
- ✅ Desktop (Chrome, Firefox, Safari)
- ✅ Tablet (iPad, Android)
- ⚠️ Mobile (com algumas limitações na visualização de tabelas)

> **Dica**: Para melhor experiência em mobile, use visualização em paisagem

---

## 🔄 Atualizar Dados em Tempo Real

Os dados são atualizados automaticamente quando:
- Novo usuário é criado/editado
- Curso é adicionado/modificado
- Sessão é revogada
- Compra é realizada

Não precisa recarregar a página!

---

## 📞 Suporte

Para problemas ou dúvidas:
1. Verifique este guia
2. Abra o console (F12) para ver erros
3. Exporte seus dados regularmente
4. Contate o desenvolvedor

---

**Sistema Desenvolvido com ❤️ para G&F**
**Última atualização: 28 de Novembro de 2025**
