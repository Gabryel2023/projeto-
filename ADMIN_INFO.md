# 📊 Sistema de Administrador - Instruções

## Como Acessar o Painel Administrativo

### Conta Admin de Teste:
- **Email**: admin@gf.com
- **Senha**: admin123456

### Como Fazer Login:
1. Clique no botão **"Login"** no canto superior direito
2. Insira o email: `admin@gabryelcursos.com`
3. Insira a senha: `admin123456`
4. Clique em **"Entrar"**

### Após o Login:
- Um novo link **"Administrador"** aparecerá no menu de navegação
- Clique nele para acessar o painel administrativo

## 🎯 Funcionalidades do Painel Admin

### 1. **Dashboard Principal**
- Exibe estatísticas resumidas:
  - Total de usuários
  - Usuários ativos
  - Total de cursos
  - Receita total

### 2. **Aba de Usuários**
- Visualizar todos os usuários registrados
- Informações: ID, Nome, Email, Data de Cadastro, Último Login, Status
- **Ações disponíveis:**
  - ✏️ **Editar**: Alterar nome e status do usuário
  - 🗑️ **Deletar**: Remover usuário do sistema

### 3. **Aba de Cursos**
- Gerenciar todos os cursos da plataforma
- Informações: ID, Título, Instrutor, Categoria, Preço, Número de Alunos
- **Ações disponíveis:**
  - ✏️ **Editar**: Modificar informações do curso
  - 🗑️ **Deletar**: Remover curso da plataforma
  - ➕ **Novo Curso**: Adicionar um novo curso

### 4. **Aba de Vendas**
- Relatório completo de vendas e receita
- Exibe:
  - Receita do mês
  - Total de vendas
  - Ticket médio
  - Tabela com detalhes de cada transação
- **Ação especial:**
  - 📥 **Exportar Relatório**: Baixar dados em formato CSV

### 5. **Aba de Sessões**
- Monitorar sessões ativas de usuários
- Informações: ID da Sessão, Usuário, Data de Criação, Data de Expiração, Status
- **Ação disponível:**
  - 🚫 **Revogar**: Desconectar usuário forcadamente

## 🛠️ Como Usar Cada Funcionalidade

### Adicionar um Novo Usuário:
1. Vá para a aba **"Usuários"**
2. Clique em **"+ Novo Usuário"**
3. Preencha os dados:
   - Nome
   - Email
   - Status (Ativo/Inativo)
4. Clique em **"Salvar"**

### Adicionar um Novo Curso:
1. Vá para a aba **"Cursos"**
2. Clique em **"+ Novo Curso"**
3. Preencha os dados:
   - Título
   - Instrutor
   - Categoria
   - Preço
4. Clique em **"Salvar"**

### Editar um Usuário:
1. Na aba **"Usuários"**, localize o usuário
2. Clique no botão **"Editar"**
3. Modifique as informações desejadas
4. Clique em **"Salvar"**

### Deletar um Usuário:
1. Na aba **"Usuários"**, localize o usuário
2. Clique no botão **"Deletar"**
3. Confirme a exclusão

### Exportar Relatório de Vendas:
1. Vá para a aba **"Vendas"**
2. Clique em **"Exportar Relatório"**
3. Um arquivo CSV será baixado com todos os dados de vendas

### Revogar Sessão:
1. Vá para a aba **"Sessões"**
2. Localize a sessão que deseja revogar
3. Clique em **"Revogar"**
4. A sessão será encerrada imediatamente

## 📝 Notas Importantes

- O painel só é acessível após fazer login com uma conta de admin
- Os dados são armazenados no localStorage do navegador
- Para testar múltiplos usuários, use incógnito ou outro navegador
- As alterações são salvas automaticamente no localStorage
- O painel é responsivo e funciona em dispositivos móveis

## 🔒 Segurança

- Senhas são hasheadas antes de serem armazenadas
- Sessões expiram após 24 horas
- Apenas usuários com email contendo "admin" têm acesso ao painel
- Todas as ações requerem confirmação quando necessário

---

**Desenvolvido com ❤️ para G&F**
