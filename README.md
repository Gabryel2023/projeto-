# 🚀 Guia Rápido - Painel Administrativo

## 📌 Acesso Imediato

### Credenciais (criadas automaticamente)
```
📧 Email: admin@gf.com
🔐 Senha: admin123456
```

### Passos para Acessar:
1. Abra o site no navegador
2. Clique em **"Login"** (canto superior direito)
3. Insira email e senha acima
4. Clique em **"Entrar"**
5. Um novo item "Administrador" aparecerá no menu
6. Clique nele para acessar o painel

---

## 🎯 O Que Você Pode Fazer

### 📊 Dashboard
- Ver estatísticas gerais do site em tempo real
- Total de usuários, cursos, receita, etc.

### 👥 Gerenciar Usuários
- **Ver:** Lista completa de todos os usuários registrados
- **Editar:** Alterar nome e status (ativo/inativo)
- **Deletar:** Remover usuário do sistema
- **Criar:** Adicionar novo usuário manualmente

### 📚 Gerenciar Cursos
- **Ver:** Todos os cursos disponíveis na plataforma
- **Editar:** Alterar título, instrutor, categoria, preço
- **Deletar:** Remover curso do catálogo
- **Criar:** Adicionar novo curso com todos os detalhes

### 💰 Relatório de Vendas
- **Receita do Mês:** Total ganho no mês atual
- **Total de Vendas:** Quantidade de transações
- **Ticket Médio:** Valor médio por venda
- **Tabela de Vendas:** Detalhe de cada transação
- **Exportar:** Baixar dados em arquivo CSV

### 🔑 Monitorar Sessões
- **Ver:** Todas as sessões ativas de usuários
- **Revogar:** Desconectar um usuário forçadamente
- **Expiração:** Quando a sessão vai expirar

---

## 💡 Exemplos de Uso

### Adicionar um Novo Curso
```
1. Clique em "Cursos" (aba)
2. Clique em "+ Novo Curso"
3. Preencha:
   - Título: "React Avançado"
   - Instrutor: "Prof. João"
   - Categoria: "Programação"
   - Preço: "249.90"
4. Clique "Salvar"
```

### Deletar um Usuário Inativo
```
1. Clique em "Usuários" (aba)
2. Encontre o usuário na tabela
3. Clique em "Deletar"
4. Confirme a exclusão
```

### Exportar Relatório de Vendas
```
1. Clique em "Vendas" (aba)
2. Clique em "Exportar Relatório"
3. Um arquivo CSV será baixado automaticamente
```

---

## 🎨 Interface

### Cores e Elementos
- **Azul Escuro (#1e3c72):** Cor principal, headers, botões primários
- **Vermelho (#dc3545):** Botões de deletar
- **Verde (#28a745):** Status ativo
- **Laranja (#17a2b8):** Botões de editar

### Responsividade
- ✅ Funciona em desktop (100%)
- ✅ Funciona em tablet (com ajustes)
- ✅ Funciona em mobile (tabelas scrolláveis)

---

## ⚠️ Informações Importantes

### Dados e Armazenamento
- Tudo é salvo no **localStorage** do navegador
- Se limpar cache/cookies, dados podem ser perdidos
- **Recomendação:** Fazer backup regularmente

### Segurança
- Senhas são criptografadas antes de salvar
- Sessões expiram após 24 horas
- Apenas contas com "admin" no email têm acesso
- Confirmação necessária para ações destrutivas

### Limitações Atuais
- Dados apenas locais (sem servidor/API)
- Sem autenticação de dois fatores
- Sem logs de auditoria completos
- Limite de armazenamento do navegador (5-10MB)

---

## 🆘 Troubleshooting

### "Nenhum usuário aparece na tabela"
- Certifique-se de estar logado como admin
- Nenhum usuário foi registrado ainda

### "Não consigo ver o botão 'Administrador'"
- Faça logout e login novamente
- Verifique se está usando a conta admin
- Seu email deve conter "admin"

### "Dados desapareceram"
- Você pode ter limpado o cache do navegador
- Use modo anônimo/incógnito
- Considere usar navegadores diferentes para dados diferentes

### "Curso não aparece na loja depois de criar"
- Atualize a página (F5 ou Ctrl+R)
- O curso pode estar em filtro de categoria diferente

---

## 📚 Arquivos Importantes

```
Ecommerce/
├── index.html          (Página principal com painel)
├── css/
│   └── style.css       (Estilos do painel admin)
├── js/
│   └── script.js       (Lógica do painel admin)
├── ADMIN_INFO.md       (Instruções completas)
├── ADMIN_SETUP.md      (Setup técnico)
└── README.md           (Este arquivo)
```

---

## 🔗 Navegação Rápida

| Função | Menu | Botão | Atalho |
|--------|------|-------|--------|
| Usuários | Admin → Usuários | + Novo Usuário | Aba 1 |
| Cursos | Admin → Cursos | + Novo Curso | Aba 2 |
| Vendas | Admin → Vendas | Exportar Relatório | Aba 3 |
| Sessões | Admin → Sessões | (sem botão) | Aba 4 |

---

## 💬 Dúvidas?

Consulte:
- `ADMIN_INFO.md` - Guia detalhado
- `ADMIN_SETUP.md` - Informações técnicas
- Código comentado em `js/script.js` e `css/style.css`

---

**Versão:** 1.0 | **Data:** 28/11/2025 | **Autor:** G&F
