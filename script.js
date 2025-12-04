// Estado global da aplicação
let currentUser = null;
let cart = [];
let courses = [];
let isLoginMode = true;

// Sistema de banco de dados local
class UserDatabase {
    constructor() {
        this.dbName = 'gf_db';
        this.usersKey = 'users';
        this.sessionsKey = 'userSessions';
        this.initializeDB();
    }

    // Inicializar banco de dados
    initializeDB() {
        if (!localStorage.getItem(this.usersKey)) {
            localStorage.setItem(this.usersKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.sessionsKey)) {
            localStorage.setItem(this.sessionsKey, JSON.stringify([]));
        }
    }

    // Buscar todos os usuários
    getAllUsers() {
        return JSON.parse(localStorage.getItem(this.usersKey) || '[]');
    }

    // Buscar usuário por ID
    getUserById(id) {
        const users = this.getAllUsers();
        return users.find(user => user.id === id);
    }

    // Buscar usuário por email
    getUserByEmail(email) {
        const users = this.getAllUsers();
        return users.find(user => user.email.toLowerCase() === email.toLowerCase());
    }

    // Criar novo usuário
    createUser(userData) {
        const users = this.getAllUsers();
        
        // Verificar se email já existe
        if (this.getUserByEmail(userData.email)) {
            throw new Error('E-mail já está em uso');
        }

        // Validar dados
        if (!this.validateUserData(userData)) {
            throw new Error('Dados inválidos');
        }

        const newUser = {
            id: this.generateUserId(),
            name: userData.name.trim(),
            email: userData.email.toLowerCase().trim(),
            password: this.hashPassword(userData.password),
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true,
            profile: {
                phone: '',
                city: 'Brasília',
                state: 'DF',
                enrolledCourses: [],
                completedCourses: [],
                favoriteTopics: []
            }
        };

        users.push(newUser);
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        
        // Registrar sessão
        this.createSession(newUser.id);
        
        return this.sanitizeUser(newUser);
    }

    // Atualizar usuário
    updateUser(userId, updateData) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex === -1) {
            throw new Error('Usuário não encontrado');
        }

        // Atualizar campos permitidos
        const allowedFields = ['name', 'phone', 'city', 'state'];
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                if (field === 'name') {
                    users[userIndex].name = updateData[field].trim();
                } else {
                    users[userIndex].profile[field] = updateData[field].trim();
                }
            }
        });

        users[userIndex].updatedAt = new Date().toISOString();
        localStorage.setItem(this.usersKey, JSON.stringify(users));
        
        return this.sanitizeUser(users[userIndex]);
    }

    // Autenticar usuário
    authenticateUser(email, password) {
        const user = this.getUserByEmail(email);
        
        if (!user || !user.isActive) {
            return null;
        }

        if (this.verifyPassword(password, user.password)) {
            // Atualizar último login
            const users = this.getAllUsers();
            const userIndex = users.findIndex(u => u.id === user.id);
            users[userIndex].lastLogin = new Date().toISOString();
            localStorage.setItem(this.usersKey, JSON.stringify(users));
            
            // Criar sessão
            this.createSession(user.id);
            
            return this.sanitizeUser(users[userIndex]);
        }
        
        return null;
    }

    // Criar sessão de usuário
    createSession(userId) {
        const sessions = JSON.parse(localStorage.getItem(this.sessionsKey) || '[]');
        const sessionId = this.generateSessionId();
        
        const session = {
            id: sessionId,
            userId: userId,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
            isActive: true
        };

        sessions.push(session);
        localStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
        localStorage.setItem('currentSession', sessionId);
        
        return session;
    }

    // Verificar sessão ativa
    getActiveSession() {
        const sessionId = localStorage.getItem('currentSession');
        if (!sessionId) return null;

        const sessions = JSON.parse(localStorage.getItem(this.sessionsKey) || '[]');
        const session = sessions.find(s => s.id === sessionId && s.isActive);
        
        if (!session) return null;

        // Verificar se sessão não expirou
        if (new Date(session.expiresAt) < new Date()) {
            this.deactivateSession(sessionId);
            return null;
        }

        return session;
    }

    // Desativar sessão
    deactivateSession(sessionId) {
        const sessions = JSON.parse(localStorage.getItem(this.sessionsKey) || '[]');
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        
        if (sessionIndex !== -1) {
            sessions[sessionIndex].isActive = false;
            sessions[sessionIndex].deactivatedAt = new Date().toISOString();
            localStorage.setItem(this.sessionsKey, JSON.stringify(sessions));
        }
        
        localStorage.removeItem('currentSession');
    }

    // Validar dados do usuário
    validateUserData(userData) {
        if (!userData.name || userData.name.trim().length < 2) return false;
        if (!userData.email || !this.isValidEmail(userData.email)) return false;
        if (!userData.password || userData.password.length < 6) return false;
        return true;
    }

    // Validar formato de email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Hash simples para senha (em produção usar bcrypt ou similar)
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Converter para 32bit integer
        }
        return hash.toString();
    }

    // Verificar senha
    verifyPassword(password, hashedPassword) {
        return this.hashPassword(password) === hashedPassword;
    }

    // Gerar ID único para usuário
    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Gerar ID único para sessão
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Remover dados sensíveis do usuário
    sanitizeUser(user) {
        const { password, ...sanitizedUser } = user;
        return sanitizedUser;
    }

    // Estatísticas do banco
    getStats() {
        const users = this.getAllUsers();
        const sessions = JSON.parse(localStorage.getItem(this.sessionsKey) || '[]');
        
        return {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.isActive).length,
            totalSessions: sessions.length,
            activeSessions: sessions.filter(s => s.isActive && new Date(s.expiresAt) > new Date()).length
        };
    }
}

// Instanciar banco de dados
const userDB = new UserDatabase();

// Criar conta admin padrão se não existir
function createDefaultAdminIfNeeded() {
    const adminEmail = 'admin@gf.com';
    const existingAdmin = userDB.getUserByEmail(adminEmail);
    
    if (!existingAdmin) {
        try {
            userDB.createUser({
                name: 'Administrador',
                email: adminEmail,
                password: 'admin123456'
            });
            console.log('Conta admin criada com sucesso!');
        } catch (error) {
            console.log('Admin já existe ou erro ao criar:', error.message);
        }
    }
}

// Base de dados dos cursos disponíveis
const coursesData = [
    {
        id: 1,
        title: "JavaScript Completo",
        instructor: "Prof. João Silva",
        description: "Aprenda JavaScript do básico ao avançado, incluindo ES6+, DOM, APIs e muito mais.",
        price: 199.90,
        originalPrice: 299.90,
        rating: 4.8,
        students: 1234,
        duration: "40 horas",
        category: "programacao",
        icon: "fas fa-code",
        badge: "Bestseller",
        courseLink: "https://www.udemy.com/course/javascript-completo-es6/",
        features: [
            "40 horas de conteúdo",
            "Certificado de conclusão",
            "Suporte do instrutor",
            "Acesso vitalício",
            "Projetos práticos"
        ]
    },
    {
        id: 2,
        title: "React.js Avançado",
        instructor: "Prof. Maria Santos",
        description: "Domine React.js com hooks, context API, Redux e desenvolvimento de aplicações modernas.",
        price: 249.90,
        originalPrice: 349.90,
        rating: 4.9,
        students: 892,
        duration: "35 horas",
        category: "programacao",
        icon: "fab fa-react",
        badge: "Novo",
        courseLink: "https://www.udemy.com/course/react-the-complete-guide/",
        features: [
            "35 horas de conteúdo",
            "Projetos reais",
            "Redux e Context API",
            "Testes automatizados",
            "Deploy na nuvem"
        ]
    },
    {
        id: 3,
        title: "UI/UX Design",
        instructor: "Prof. Ana Costa",
        description: "Crie interfaces incríveis e experiências de usuário memoráveis com design thinking.",
        price: 179.90,
        originalPrice: 249.90,
        rating: 4.7,
        students: 756,
        duration: "30 horas",
        category: "design",
        icon: "fas fa-palette",
        badge: "Popular",
        courseLink: "https://www.coursera.org/learn/user-experience-design",
        features: [
            "30 horas de conteúdo",
            "Figma e Adobe XD",
            "Design System",
            "Prototipagem",
            "Portfolio profissional"
        ]
    },
    {
        id: 4,
        title: "Marketing Digital",
        instructor: "Prof. Carlos Lima",
        description: "Estratégias completas de marketing digital, SEO, redes sociais e análise de dados.",
        price: 159.90,
        originalPrice: 229.90,
        rating: 4.6,
        students: 1456,
        duration: "25 horas",
        category: "marketing",
        icon: "fas fa-bullhorn",
        badge: "Oferta",
        courseLink: "https://www.udemy.com/course/marketing-digital-completo/",
        features: [
            "25 horas de conteúdo",
            "Google Ads e Facebook Ads",
            "SEO e Analytics",
            "E-mail marketing",
            "Casos de sucesso"
        ]
    },
    {
        id: 5,
        title: "Python para Data Science",
        instructor: "Prof. Roberto Mendes",
        description: "Análise de dados, machine learning e visualização com Python, Pandas e Matplotlib.",
        price: 229.90,
        originalPrice: 319.90,
        rating: 4.8,
        students: 634,
        duration: "45 horas",
        category: "programacao",
        icon: "fab fa-python",
        badge: "Trending",
        courseLink: "https://www.coursera.org/learn/python-data-analysis",
        features: [
            "45 horas de conteúdo",
            "Pandas e NumPy",
            "Machine Learning",
            "Visualização de dados",
            "Projetos reais"
        ]
    },
    {
        id: 6,
        title: "Gestão de Negócios",
        instructor: "Prof. Lucia Ferreira",
        description: "Fundamentos de administração, liderança, estratégia e gestão de equipes.",
        price: 189.90,
        originalPrice: 269.90,
        rating: 4.5,
        students: 923,
        duration: "28 horas",
        category: "negocios",
        icon: "fas fa-chart-line",
        badge: "Essencial",
        courseLink: "https://www.coursera.org/learn/business-management",
        features: [
            "28 horas de conteúdo",
            "Liderança e gestão",
            "Planejamento estratégico",
            "Gestão financeira",
            "Cases empresariais"
        ]
    }
];

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    courses = coursesData;
    // Criar conta admin se não existir
    createDefaultAdminIfNeeded();
    initializeApp();
    loadCourses();
    setupEventListeners();
    checkStoredLogin();
});

// Inicializar configurações da aplicação
function initializeApp() {
    // Carregar carrinho salvo do localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

// Verificar se existe sessão ativa no navegador
function checkStoredLogin() {
    const session = userDB.getActiveSession();
    if (session) {
        const user = userDB.getUserById(session.userId);
        if (user) {
            currentUser = userDB.sanitizeUser(user);
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserDisplay();
            initializeAdminIfNeeded();
        } else {
            // Usuário não encontrado, limpar sessão
            userDB.deactivateSession(session.id);
        }
    }
}

// Configurar todos os ouvintes de eventos da página
function setupEventListeners() {
    // Menu hambúrguer para navegação mobile
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Configuração do modal de login/cadastro
    const loginBtn = document.getElementById('login-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.getElementById('close-modal');
    const authForm = document.getElementById('auth-form');
    const authSwitchLink = document.getElementById('auth-switch-link');
    const logoutBtn = document.getElementById('logout-btn');

    loginBtn.addEventListener('click', () => openModal(loginModal));
    closeModal.addEventListener('click', () => closeModalById(loginModal));
    authForm.addEventListener('submit', handleAuth);
    authSwitchLink.addEventListener('click', toggleAuthMode);
    const profileBtn = document.getElementById('profile-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
    if (profileBtn) profileBtn.addEventListener('click', openProfileModal);

    // Configuração do modal do carrinho de compras
    const cartBtn = document.getElementById('cart-btn');
    const cartModal = document.getElementById('cart-modal');
    const closeCartModal = document.getElementById('close-cart-modal');
    const checkoutBtn = document.getElementById('checkout-btn');

    cartBtn.addEventListener('click', () => openModal(cartModal));
    closeCartModal.addEventListener('click', () => closeModalById(cartModal));
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);

    // Configuração do modal de pagamento
    const paymentModal = document.getElementById('payment-modal');
    const closePaymentModal = document.getElementById('close-payment-modal');
    const pixForm = document.getElementById('pix-form');
    const cardForm = document.getElementById('card-form');
    
    closePaymentModal.addEventListener('click', () => closeModalById(paymentModal));
    if (pixForm) pixForm.addEventListener('submit', processPIXPayment);
    if (cardForm) cardForm.addEventListener('submit', processCardPayment);

    // Configuração do modal de detalhes do curso
    const courseModal = document.getElementById('course-modal');
    const closeCourseModal = document.getElementById('close-course-modal');
    closeCourseModal.addEventListener('click', () => closeModalById(courseModal));

    // Configuração do modal de perfil
    const profileModal = document.getElementById('profile-modal');
    const closeProfileModal = document.getElementById('close-profile-modal');
    const profileForm = document.getElementById('profile-form');
    closeProfileModal.addEventListener('click', () => closeModalById(profileModal));
    profileForm.addEventListener('submit', handleProfileUpdate);

    // Sistema de filtros por categoria de curso
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            filterCourses(e.target.dataset.filter);
        });
    });

    // Fechar modais clicando na área escura externa
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModalById(e.target);
        }
    });

    // Rolagem suave para links de navegação interna
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Se for o link do admin, garante que a seção está visível
                if (this.getAttribute('href') === '#admin' && isAdmin()) {
                    const adminSection = document.getElementById('admin');
                    if (adminSection) {
                        adminSection.style.display = 'block';
                    }
                }
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Configurar event listeners do admin
    setupAdminEventListeners();
}

// Carregar cursos
function loadCourses(filter = 'all') {
    const coursesGrid = document.getElementById('courses-grid');
    coursesGrid.innerHTML = '';

    const filteredCourses = filter === 'all' ? courses : courses.filter(course => course.category === filter);

    filteredCourses.forEach(course => {
        const courseCard = createCourseCard(course);
        coursesGrid.appendChild(courseCard);
    });
}

// Criar card do curso
function createCourseCard(course) {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.setAttribute('data-category', course.category);

    card.innerHTML = `
        <div class="course-image">
            <i class="${course.icon}"></i>
            <div class="course-badge">${course.badge}</div>
        </div>
        <div class="course-content">
            <h3 class="course-title">${course.title}</h3>
            <p class="course-instructor">Por ${course.instructor}</p>
            <p class="course-description">${course.description}</p>
            <div class="course-meta">
                <div class="course-rating">
                    <i class="fas fa-star"></i>
                    <span>${course.rating}</span>
                    <span>(${course.students})</span>
                </div>
                <div class="course-duration">
                    <i class="fas fa-clock"></i>
                    <span>${course.duration}</span>
                </div>
            </div>
            <div class="course-footer">
                <div class="course-price">
                    R$ ${course.price.toFixed(2).replace('.', ',')}
                    ${course.originalPrice ? `<small style="text-decoration: line-through; color: #999;">R$ ${course.originalPrice.toFixed(2).replace('.', ',')}</small>` : ''}
                </div>
                <button class="add-to-cart" onclick="addToCart(${course.id})">
                    <i class="fas fa-shopping-cart"></i> Adicionar
                </button>
            </div>
        </div>
    `;

    // Evento para abrir modal do curso
    card.addEventListener('click', (e) => {
        if (!e.target.classList.contains('add-to-cart') && !e.target.closest('.add-to-cart')) {
            openCourseModal(course);
        }
    });

    return card;
}

// Filtrar cursos
function filterCourses(category) {
    loadCourses(category);
}

// Abrir modal
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Fechar modal
function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Fechar modal por ID (função auxiliar para event listeners)
function closeModalById(modal) {
    if (modal && modal.style) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Alternar modo de autenticação
function toggleAuthMode(e) {
    e.preventDefault();
    isLoginMode = !isLoginMode;
    
    const modalTitle = document.getElementById('modal-title');
    const authSubmit = document.getElementById('auth-submit');
    const authSwitchText = document.getElementById('auth-switch-text');
    const authSwitchLink = document.getElementById('auth-switch-link');
    const nameGroup = document.getElementById('name-group');
    const confirmPasswordGroup = document.getElementById('confirm-password-group');

    if (isLoginMode) {
        modalTitle.textContent = 'Login';
        authSubmit.textContent = 'Entrar';
        authSwitchText.innerHTML = 'Não tem uma conta? <a href="#" id="auth-switch-link">Cadastre-se</a>';
        nameGroup.style.display = 'none';
        confirmPasswordGroup.style.display = 'none';
    } else {
        modalTitle.textContent = 'Cadastro';
        authSubmit.textContent = 'Cadastrar';
        authSwitchText.innerHTML = 'Já tem uma conta? <a href="#" id="auth-switch-link">Faça login</a>';
        nameGroup.style.display = 'block';
        confirmPasswordGroup.style.display = 'block';
    }

    // Reconfigurar event listener
    document.getElementById('auth-switch-link').addEventListener('click', toggleAuthMode);
}

// Processar formulário de autenticação
function handleAuth(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const email = formData.get('email').trim();
    const password = formData.get('password');
    const name = formData.get('name')?.trim();
    const confirmPassword = formData.get('confirm-password');

    // Validações básicas
    if (!email || !password) {
        showNotification('Por favor, preencha todos os campos obrigatórios!', 'warning');
        return;
    }

    if (!userDB.isValidEmail(email)) {
        showNotification('Por favor, insira um e-mail válido!', 'warning');
        return;
    }

    if (isLoginMode) {
        // Processo de login
        if (login(email, password)) {
            showNotification('Login realizado com sucesso! Bem-vindo de volta!', 'success');
            closeModalById(document.getElementById('login-modal'));
            e.target.reset();
        } else {
            showNotification('E-mail ou senha incorretos. Verifique suas credenciais!', 'error');
        }
    } else {
        // Processo de cadastro
        if (!name || name.length < 2) {
            showNotification('Por favor, insira um nome válido (mínimo 2 caracteres)!', 'warning');
            return;
        }

        if (password.length < 6) {
            showNotification('A senha deve ter pelo menos 6 caracteres!', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            showNotification('As senhas não coincidem!', 'error');
            return;
        }
        
        if (register(name, email, password)) {
            showNotification('Cadastro realizado com sucesso! Bem-vindo à G&F!', 'success');
            closeModalById(document.getElementById('login-modal'));
            e.target.reset();
            // Resetar para modo login
            isLoginMode = true;
            toggleAuthMode({ preventDefault: () => {} });
        }
        // Erros do registro são tratados na função register()
    }
}

// Realizar login do usuário
function login(email, password) {
    try {
        const user = userDB.authenticateUser(email, password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUserDisplay();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Erro no login:', error.message);
        return false;
    }
}

// Registrar novo usuário
function register(name, email, password) {
    try {
        const userData = { name, email, password };
        const user = userDB.createUser(userData);
        
        // Login automático após registro
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserDisplay();
        
        return true;
    } catch (error) {
        console.error('Erro no registro:', error.message);
        
        // Exibir mensagem específica do erro
        if (error.message === 'E-mail já está em uso') {
            showNotification('Este e-mail já está cadastrado!', 'error');
        } else if (error.message === 'Dados inválidos') {
            showNotification('Por favor, verifique os dados informados!', 'error');
        } else {
            showNotification('Erro ao criar conta. Tente novamente!', 'error');
        }
        
        return false;
    }
}

// Realizar logout do usuário
function logout() {
    // Desativar sessão no banco
    const session = userDB.getActiveSession();
    if (session) {
        userDB.deactivateSession(session.id);
    }
    
    // Limpar dados locais
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('adminUser');
    updateUserDisplay();
    showNotification('Logout realizado com sucesso!', 'success');
}

// Atualizar display do usuário
function updateUserDisplay() {
    const loginBtn = document.getElementById('login-btn');
    const userMenu = document.getElementById('user-menu');
    const username = document.getElementById('username');

    if (currentUser) {
        loginBtn.style.display = 'none';
        userMenu.style.display = 'flex';
        username.textContent = currentUser.name;
        initializeAdminIfNeeded();
    } else {
        loginBtn.style.display = 'block';
        userMenu.style.display = 'none';
        toggleAdminPanel();
    }
}

// Adicionar ao carrinho
function addToCart(courseId) {
    if (!currentUser) {
        showNotification('Faça login para adicionar cursos ao carrinho!', 'error');
        openModal(document.getElementById('login-modal'));
        return;
    }

    const course = courses.find(c => c.id === courseId);
    const existingItem = cart.find(item => item.id === courseId);

    if (existingItem) {
        showNotification('Este curso já está no seu carrinho!', 'warning');
        return;
    }

    cart.push(course);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    showNotification('Curso adicionado ao carrinho!', 'success');
}

// Remover do carrinho
function removeFromCart(courseId) {
    cart = cart.filter(item => item.id !== courseId);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    updateCartModal();
    showNotification('Curso removido do carrinho!', 'success');
}

// Atualizar display do carrinho
function updateCartDisplay() {
    const cartCount = document.getElementById('cart-count');
    cartCount.textContent = cart.length;
    updateCartModal();
}

// Atualizar modal do carrinho
function updateCartModal() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const totalAmount = document.getElementById('total-amount');

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
        cartTotal.style.display = 'none';
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(course => {
        total += course.price;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${course.title}</h4>
                <p>Por ${course.instructor}</p>
            </div>
            <div class="cart-item-price">R$ ${course.price.toFixed(2).replace('.', ',')}</div>
            <button class="remove-item" onclick="removeFromCart(${course.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });

    totalAmount.textContent = total.toFixed(2).replace('.', ',');
    cartTotal.style.display = 'block';
}

// Finalizar compra (abrir modal de pagamento)
function checkout() {
    if (!currentUser) {
        showNotification('Faça login para finalizar a compra!', 'error');
        return;
    }

    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio!', 'warning');
        return;
    }

    // Abrir modal de pagamento
    closeModalById(document.getElementById('cart-modal'));
    openPaymentModal();
}

// Abrir modal de pagamento
function openPaymentModal() {
    const paymentModal = document.getElementById('payment-modal');
    
    // Calcular total
    const total = cart.reduce((sum, course) => sum + course.price, 0);
    
    // Atualizar valores nos formulários
    document.getElementById('pix-amount').textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
    document.getElementById('card-amount').textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
    
    // Armazenar total para processar pagamento
    paymentModal.dataset.total = total;
    paymentModal.dataset.cartItems = JSON.stringify(cart.map(c => c.id));
    
    openModal(paymentModal);
}

// Selecionar método de pagamento
function selectPaymentMethod(method) {
    const pixForm = document.getElementById('pix-form');
    const cardForm = document.getElementById('card-form');
    const paymentCards = document.querySelectorAll('.payment-method-card');
    
    paymentCards.forEach(card => card.classList.remove('selected'));
    
    if (method === 'pix') {
        event.target.closest('.payment-method-card').classList.add('selected');
        pixForm.style.display = 'block';
        cardForm.style.display = 'none';
    } else {
        event.target.closest('.payment-method-card').classList.add('selected');
        pixForm.style.display = 'none';
        cardForm.style.display = 'block';
    }
}

// Copiar chave Pix
function copyPixKey() {
    const pixKeyValue = document.getElementById('pix-key-value').textContent;
    navigator.clipboard.writeText(pixKeyValue).then(() => {
        showNotification('Chave Pix copiada com sucesso!', 'success');
    }).catch(err => {
        showNotification('Erro ao copiar chave Pix', 'error');
    });
}

// Processar pagamento via PIX
function processPIXPayment(e) {
    e.preventDefault();
    
    const confirm = document.getElementById('pix-confirm').checked;
    
    if (!confirm) {
        showNotification('Você precisa confirmar que realizou o pagamento!', 'warning');
        return;
    }
    
    processPaymentSuccess('PIX');
}

// Processar pagamento via Cartão
function processCardPayment(e) {
    e.preventDefault();
    
    const holder = document.getElementById('card-holder').value.trim();
    const number = document.getElementById('card-number').value.replace(/\s/g, '');
    const validity = document.getElementById('card-validity').value;
    const cvv = document.getElementById('card-cvv').value;
    
    // Validações básicas
    if (!holder || holder.length < 3) {
        showNotification('Nome do titular inválido!', 'warning');
        return;
    }
    
    if (number.length !== 16 || isNaN(number)) {
        showNotification('Número do cartão inválido! Use 16 dígitos.', 'warning');
        return;
    }
    
    if (!validity.match(/^\d{2}\/\d{2}$/)) {
        showNotification('Validade inválida! Use o formato MM/AA', 'warning');
        return;
    }
    
    if (cvv.length < 3 || isNaN(cvv)) {
        showNotification('CVV inválido!', 'warning');
        return;
    }
    
    processPaymentSuccess('CARTÃO DE CRÉDITO');
}

// Processar sucesso do pagamento
function processPaymentSuccess(paymentMethod) {
    if (!currentUser) {
        showNotification('Sessão expirada. Faça login novamente!', 'error');
        return;
    }
    
    showNotification('Processando pagamento...', 'info');
    
    setTimeout(() => {
        try {
            // Adicionar cursos à lista de cursos matriculados do usuário
            const user = userDB.getUserById(currentUser.id);
            const courseIds = cart.map(course => course.id);
            
            // Atualizar perfil do usuário com novos cursos
            const newEnrolledCourses = [...(user.profile.enrolledCourses || []), ...courseIds];
            
            // Simular atualização no banco
            const users = userDB.getAllUsers();
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            if (userIndex !== -1) {
                users[userIndex].profile.enrolledCourses = newEnrolledCourses;
                users[userIndex].updatedAt = new Date().toISOString();
                localStorage.setItem('users', JSON.stringify(users));
            }
            
            // Registrar venda (para estatísticas do admin)
            const sales = JSON.parse(localStorage.getItem('sales') || '[]');
            const totalAmount = cart.reduce((sum, c) => sum + c.price, 0);
            sales.push({
                id: 'sale_' + Date.now(),
                userId: currentUser.id,
                courseIds: courseIds,
                totalAmount: totalAmount,
                paymentMethod: paymentMethod,
                status: 'completed',
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('sales', JSON.stringify(sales));
            
            // Limpar carrinho
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartDisplay();
            closeModalById(document.getElementById('payment-modal'));
            
            // Mostrar mensagem de sucesso com detalhes dos cursos
            const courseNames = cart.length > 0 ? cart.map(c => c.title).join(', ') : 'seus cursos';
            showNotification(`✅ Pagamento aprovado via ${paymentMethod}! Você já pode acessar ${courseNames} no seu perfil.`, 'success');
            
            // Resetar formulários
            document.getElementById('pix-form').reset();
            document.getElementById('card-form').reset();
            
        } catch (error) {
            console.error('Erro no pagamento:', error);
            showNotification('Erro ao processar pagamento. Tente novamente!', 'error');
        }
    }, 2000);
}

// Abrir modal do curso
function openCourseModal(course) {
    const modal = document.getElementById('course-modal');
    const modalTitle = document.getElementById('course-modal-title');
    const modalBody = document.getElementById('course-modal-body');

    modalTitle.textContent = course.title;
    
    modalBody.innerHTML = `
        <div class="course-detail">
            <div class="course-detail-main">
                <div class="course-detail-image">
                    <i class="${course.icon}"></i>
                </div>
                <h3>${course.title}</h3>
                <div class="course-detail-meta">
                    <span><i class="fas fa-user"></i> ${course.instructor}</span>
                    <span><i class="fas fa-star"></i> ${course.rating} (${course.students} alunos)</span>
                    <span><i class="fas fa-clock"></i> ${course.duration}</span>
                </div>
                <div class="course-detail-description">
                    <p>${course.description}</p>
                </div>
            </div>
            <div class="course-sidebar">
                <div class="course-price-large">
                    R$ ${course.price.toFixed(2).replace('.', ',')}
                    ${course.originalPrice ? `<div style="font-size: 1rem; text-decoration: line-through; color: #999;">R$ ${course.originalPrice.toFixed(2).replace('.', ',')}</div>` : ''}
                </div>
                <button class="btn btn-primary" onclick="addToCart(${course.id})" style="width: 100%; margin-bottom: 1rem;">
                    <i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho
                </button>
                <a href="${course.courseLink}" target="_blank" class="btn btn-secondary" style="width: 100%; margin-bottom: 1rem; display: block; text-decoration: none; text-align: center;">
                    <i class="fas fa-external-link-alt"></i> Ver Curso Completo
                </a>
                <h4>O que você vai aprender:</h4>
                <ul class="course-features">
                    ${course.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    openModal(modal);
}

// Abrir modal de perfil
function openProfileModal() {
    if (!currentUser) {
        showNotification('Você precisa estar logado para acessar o perfil!', 'warning');
        return;
    }

    const profileModal = document.getElementById('profile-modal');
    const user = userDB.getUserById(currentUser.id);
    
    if (!user) {
        showNotification('Erro ao carregar dados do perfil!', 'error');
        return;
    }

    // Preencher formulário com dados do usuário
    document.getElementById('profile-name').value = user.name || '';
    document.getElementById('profile-email').value = user.email || '';
    document.getElementById('profile-phone').value = user.profile.phone || '';
    document.getElementById('profile-city').value = user.profile.city || 'Brasília';
    document.getElementById('profile-state').value = user.profile.state || 'DF';
    
    // Atualizar estatísticas
    document.getElementById('enrolled-count').textContent = user.profile.enrolledCourses.length;
    document.getElementById('completed-count').textContent = user.profile.completedCourses.length;

    openModal(profileModal);
}

// Processar atualização de perfil
function handleProfileUpdate(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Sessão expirada. Faça login novamente!', 'error');
        return;
    }

    const formData = new FormData(e.target);
    const updateData = {
        name: formData.get('name').trim(),
        phone: formData.get('phone').trim(),
        city: formData.get('city').trim(),
        state: formData.get('state').trim().toUpperCase()
    };

    // Validações
    if (!updateData.name || updateData.name.length < 2) {
        showNotification('Nome deve ter pelo menos 2 caracteres!', 'warning');
        return;
    }

    if (updateData.state && updateData.state.length !== 2) {
        showNotification('Estado deve ter exatamente 2 caracteres!', 'warning');
        return;
    }

    try {
        const updatedUser = userDB.updateUser(currentUser.id, updateData);
        
        // Atualizar dados locais
        currentUser = updatedUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUserDisplay();
        
        closeModalById(document.getElementById('profile-modal'));
        showNotification('Perfil atualizado com sucesso!', 'success');
        
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error.message);
        showNotification('Erro ao atualizar perfil. Tente novamente!', 'error');
    }
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    // Remover notificação existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

    // Adicionar estilos se não existirem
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 3000;
                max-width: 400px;
                border-radius: 8px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                animation: slideInRight 0.3s ease;
            }
            
            .notification.success { background: #d4edda; border-left: 4px solid #28a745; color: #155724; }
            .notification.error { background: #f8d7da; border-left: 4px solid #dc3545; color: #721c24; }
            .notification.warning { background: #fff3cd; border-left: 4px solid #ffc107; color: #856404; }
            .notification.info { background: #d1ecf1; border-left: 4px solid #17a2b8; color: #0c5460; }
            
            .notification-content {
                display: flex;
                align-items: center;
                padding: 1rem;
                gap: 0.5rem;
            }
            
            .notification-close {
                background: none;
                border: none;
                margin-left: auto;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.3s ease;
            }
            
            .notification-close:hover { opacity: 1; }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto remover após 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// ============================================
// SISTEMA DE ADMINISTRADOR
// ============================================

// Verificar se usuário é administrador
function isAdmin() {
    console.debug('[ADMIN] isAdmin() - currentUser:', currentUser, 'adminUser:', localStorage.getItem('adminUser'));
    if (!currentUser) return false;
    // Considerar como admin se o ID contém 'admin' ou se localStorage.adminUser corresponde
    const adminUserId = localStorage.getItem('adminUser');
    const result = (adminUserId === currentUser.id)
        || Boolean(currentUser.id && currentUser.id.includes('admin'))
        || Boolean(currentUser.email && currentUser.email.toLowerCase().includes('admin'));
    console.debug('[ADMIN] isAdmin() =>', result);
    return result;
}

// Alternar visibilidade do painel admin
function toggleAdminPanel() {
    const adminNavItem = document.getElementById('admin-nav-item');
    const adminSection = document.getElementById('admin');
    console.debug('[ADMIN] toggleAdminPanel() - found adminNavItem:', !!adminNavItem, 'adminSection:', !!adminSection);

    // Se os elementos não existirem, sair silenciosamente (evita erros no console)
    if (!adminNavItem && !adminSection) return;

    const amIAdmin = isAdmin();
    console.debug('[ADMIN] toggleAdminPanel() - isAdmin:', amIAdmin);

    if (amIAdmin) {
        if (adminNavItem) adminNavItem.style.display = 'block';
    } else {
        if (adminNavItem) adminNavItem.style.display = 'none';
        if (adminSection) adminSection.style.display = 'none';
    }
}

// Carregar dados do admin
function loadAdminData() {
    if (!isAdmin()) return;
    
    updateAdminStats();
    loadUsersTable();
    loadCoursesTable();
    loadSalesTable();
    loadSessionsTable();
}

// Atualizar estatísticas do admin
function updateAdminStats() {
    const allUsers = userDB.getAllUsers();
    const stats = userDB.getStats();
    
    // Calcular receita total (simulado)
    let totalRevenue = 0;
    allUsers.forEach(user => {
        totalRevenue += user.profile.enrolledCourses.length * 199.90; // Preço médio simulado
    });

    document.getElementById('total-users').textContent = stats.totalUsers;
    document.getElementById('active-users').textContent = stats.activeUsers;
    document.getElementById('total-courses').textContent = courses.length;
    document.getElementById('total-revenue').textContent = 'R$ ' + totalRevenue.toFixed(2).replace('.', ',');
}

// Carregar tabela de usuários
function loadUsersTable() {
    const allUsers = userDB.getAllUsers();
    const tableBody = document.getElementById('users-table-body');
    tableBody.innerHTML = '';

    if (allUsers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #999;">📭 Nenhum usuário cadastrado</td></tr>';
        return;
    }

    allUsers.forEach(user => {
        const row = document.createElement('tr');
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca';
        const createdAt = new Date(user.createdAt).toLocaleDateString('pt-BR');
        
        row.innerHTML = `
            <td><small>${user.id.substring(0, 10)}...</small></td>
            <td><strong>${user.name}</strong></td>
            <td>${user.email}</td>
            <td>${createdAt}</td>
            <td>${lastLogin}</td>
            <td>
                <span class="status-badge ${user.isActive ? 'status-active' : 'status-inactive'}">
                    ${user.isActive ? '✓ Ativo' : '✗ Inativo'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editUser('${user.id}')" title="Editar usuário">
                        ✏️ Editar
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteUser('${user.id}')" title="Deletar usuário">
                        🗑️ Deletar
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Carregar tabela de cursos
function loadCoursesTable() {
    const tableBody = document.getElementById('courses-table-body');
    tableBody.innerHTML = '';

    if (courses.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #999;">📚 Nenhum curso cadastrado</td></tr>';
        return;
    }

    courses.forEach(course => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><small>#${course.id}</small></td>
            <td><strong>${course.title}</strong></td>
            <td>${course.instructor}</td>
            <td><span style="background: #e9ecef; padding: 0.3rem 0.6rem; border-radius: 5px; font-size: 0.85rem;">📂 ${course.category}</span></td>
            <td><strong>R$ ${course.price.toFixed(2).replace('.', ',')}</strong></td>
            <td><span style="background: #cfe2ff; color: #084298; padding: 0.3rem 0.6rem; border-radius: 5px; font-size: 0.85rem;">👥 ${course.students}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn edit-btn" onclick="editCourse(${course.id})" title="Editar curso">
                        ✏️ Editar
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteCourse(${course.id})" title="Deletar curso">
                        🗑️ Deletar
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Carregar tabela de vendas
function loadSalesTable() {
    const allUsers = userDB.getAllUsers();
    const tableBody = document.getElementById('sales-table-body');
    tableBody.innerHTML = '';

    let totalSales = 0;
    let totalRevenue = 0;
    const salesData = [];

    // Simular vendas baseado em cursos inscritos
    allUsers.forEach(user => {
        user.profile.enrolledCourses.forEach(courseId => {
            const course = courses.find(c => c.id === courseId);
            if (course) {
                totalSales++;
                totalRevenue += course.price;
                salesData.push({ user, course });
            }
        });
    });

    // Exibir vendas
    if (salesData.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #999;">💰 Nenhuma venda registrada</td></tr>';
    } else {
        salesData.forEach((sale, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${sale.user.name}</strong></td>
                <td>${sale.course.title}</td>
                <td><span style="color: #28a745; font-weight: bold;">R$ ${sale.course.price.toFixed(2).replace('.', ',')}</span></td>
                <td>${new Date().toLocaleDateString('pt-BR')}</td>
                <td><span class="status-badge status-active">✓ Concluída</span></td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Atualizar estatísticas de vendas
    document.getElementById('monthly-revenue').textContent = 'R$ ' + totalRevenue.toFixed(2).replace('.', ',');
    document.getElementById('total-sales').textContent = totalSales;
    document.getElementById('average-ticket').textContent = totalSales > 0 ? 'R$ ' + (totalRevenue / totalSales).toFixed(2).replace('.', ',') : 'R$ 0,00';
}

// Carregar tabela de sessões
function loadSessionsTable() {
    const sessions = JSON.parse(localStorage.getItem('userSessions') || '[]');
    const tableBody = document.getElementById('sessions-table-body');
    tableBody.innerHTML = '';

    if (sessions.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: #999;">🔓 Nenhuma sessão ativa</td></tr>';
        return;
    }

    sessions.forEach(session => {
        const user = userDB.getUserById(session.userId);
        if (user) {
            const row = document.createElement('tr');
            const createdAt = new Date(session.createdAt).toLocaleDateString('pt-BR');
            const expiresAt = new Date(session.expiresAt).toLocaleDateString('pt-BR');
            const isExpired = new Date(session.expiresAt) < new Date();
            
            row.innerHTML = `
                <td><small>${session.id.substring(0, 15)}...</small></td>
                <td><strong>${user.name}</strong></td>
                <td>${createdAt}</td>
                <td>${expiresAt}</td>
                <td>
                    <span class="status-badge ${session.isActive && !isExpired ? 'status-active' : 'status-inactive'}">
                        ${session.isActive && !isExpired ? '🔒 Ativa' : '⏰ Expirada'}
                    </span>
                </td>
                <td>
                    <button class="action-btn delete-btn" onclick="revokeSession('${session.id}')" title="Revogar sessão">
                        🚫 Revogar
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        }
    });
}

// Editar usuário
function editUser(userId) {
    const user = userDB.getUserById(userId);
    if (!user) {
        showNotification('Usuário não encontrado!', 'error');
        return;
    }

    document.getElementById('user-modal-title').textContent = 'Editar Usuário';
    document.getElementById('admin-user-name').value = user.name;
    document.getElementById('admin-user-email').value = user.email;
    document.getElementById('admin-user-status').value = user.isActive ? 'active' : 'inactive';
    
    // Armazenar ID para atualização
    document.getElementById('user-management-form').dataset.userId = userId;
    openModal(document.getElementById('user-management-modal'));
}

// Deletar usuário
function deleteUser(userId) {
    const user = userDB.getUserById(userId);
    if (!user) {
        showNotification('Usuário não encontrado!', 'error');
        return;
    }

    if (confirm(`⚠️ Tem certeza que deseja deletar o usuário "${user.name}"?\n\nEsta ação é irreversível!`)) {
        const allUsers = userDB.getAllUsers();
        const filteredUsers = allUsers.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        
        showNotification(`✅ Usuário "${user.name}" deletado com sucesso!`, 'success');
        loadUsersTable();
        updateAdminStats();
    }
}

// Editar curso
function editCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) {
        showNotification('Curso não encontrado!', 'error');
        return;
    }

    document.getElementById('course-modal-title').textContent = 'Editar Curso';
    document.getElementById('admin-course-title').value = course.title;
    document.getElementById('admin-course-instructor').value = course.instructor;
    document.getElementById('admin-course-category').value = course.category;
    document.getElementById('admin-course-price').value = course.price;
    
    // Armazenar ID para atualização
    document.getElementById('course-management-form').dataset.courseId = courseId;
    openModal(document.getElementById('course-management-modal'));
}

// Deletar curso
function deleteCourse(courseId) {
    const course = courses.find(c => c.id === courseId);
    if (!course) {
        showNotification('Curso não encontrado!', 'error');
        return;
    }

    if (confirm(`⚠️ Tem certeza que deseja deletar o curso "${course.title}"?\n\nEsta ação é irreversível!`)) {
        courses = courses.filter(c => c.id !== courseId);
        showNotification(`✅ Curso "${course.title}" deletado com sucesso!`, 'success');
        loadCoursesTable();
        loadCourses();
        updateAdminStats();
    }
}

// Revogar sessão
function revokeSession(sessionId) {
    const sessions = JSON.parse(localStorage.getItem('userSessions') || '[]');
    const session = sessions.find(s => s.id === sessionId);
    const user = session ? userDB.getUserById(session.userId) : null;

    if (!session || !user) {
        showNotification('Sessão não encontrada!', 'error');
        return;
    }

    if (confirm(`⚠️ Tem certeza que deseja revogar a sessão do usuário "${user.name}"?\n\nEle será desconectado imediatamente!`)) {
        userDB.deactivateSession(sessionId);
        showNotification(`✅ Sessão de "${user.name}" revogada com sucesso!`, 'success');
        loadSessionsTable();
    }
}

// Configurar event listeners do admin
function setupAdminEventListeners() {
    // Abrir modal de novo usuário
    const addUserBtn = document.getElementById('add-user-btn');
    if (addUserBtn) {
        addUserBtn.addEventListener('click', () => {
            document.getElementById('user-modal-title').textContent = 'Novo Usuário';
            document.getElementById('user-management-form').reset();
            document.getElementById('user-management-form').dataset.userId = '';
            openModal(document.getElementById('user-management-modal'));
        });
    }

    // Abrir modal de novo curso
    const addCourseBtn = document.getElementById('add-course-btn');
    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', () => {
            document.getElementById('course-modal-title').textContent = 'Novo Curso';
            document.getElementById('course-management-form').reset();
            document.getElementById('course-management-form').dataset.courseId = '';
            openModal(document.getElementById('course-management-modal'));
        });
    }

    // Fechar modal de usuário
    const closeUserModal = document.getElementById('close-user-modal');
    if (closeUserModal) {
        closeUserModal.addEventListener('click', () => closeModalById(document.getElementById('user-management-modal')));
    }

    // Fechar modal de curso
    const closeCourseModal = document.getElementById('close-course-management-modal');
    if (closeCourseModal) {
        closeCourseModal.addEventListener('click', () => closeModalById(document.getElementById('course-management-modal')));
    }

    // Enviar formulário de usuário
    const userForm = document.getElementById('user-management-form');
    if (userForm) {
        userForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const userId = userForm.dataset.userId;
            const formData = new FormData(userForm);
            
            if (userId) {
                // Atualizar usuário existente
                const allUsers = userDB.getAllUsers();
                const userIndex = allUsers.findIndex(u => u.id === userId);
                if (userIndex !== -1) {
                    allUsers[userIndex].name = formData.get('name').trim();
                    allUsers[userIndex].isActive = formData.get('status') === 'active';
                    localStorage.setItem('users', JSON.stringify(allUsers));
                    showNotification('Usuário atualizado com sucesso!', 'success');
                }
            } else {
                // Criar novo usuário (sem senha, apenas admin)
                try {
                    const userData = {
                        name: formData.get('name').trim(),
                        email: formData.get('email').trim(),
                        password: 'admin123' // Senha padrão
                    };
                    userDB.createUser(userData);
                    showNotification('Usuário criado com sucesso!', 'success');
                } catch (error) {
                    showNotification(error.message, 'error');
                }
            }
            
            closeModalById(document.getElementById('user-management-modal'));
            loadUsersTable();
        });
    }

    // Enviar formulário de curso
    const courseForm = document.getElementById('course-management-form');
    if (courseForm) {
        courseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const courseId = courseForm.dataset.courseId;
            const formData = new FormData(courseForm);
            
            if (courseId) {
                // Atualizar curso existente
                const courseIndex = courses.findIndex(c => c.id == courseId);
                if (courseIndex !== -1) {
                    courses[courseIndex].title = formData.get('title').trim();
                    courses[courseIndex].instructor = formData.get('instructor').trim();
                    courses[courseIndex].category = formData.get('category');
                    courses[courseIndex].price = parseFloat(formData.get('price'));
                    showNotification('Curso atualizado com sucesso!', 'success');
                }
            } else {
                // Criar novo curso
                const newCourse = {
                    id: Math.max(...courses.map(c => c.id), 0) + 1,
                    title: formData.get('title').trim(),
                    instructor: formData.get('instructor').trim(),
                    description: 'Descrição do novo curso',
                    price: parseFloat(formData.get('price')),
                    originalPrice: parseFloat(formData.get('price')) * 1.2,
                    rating: 0,
                    students: 0,
                    duration: '30 horas',
                    category: formData.get('category'),
                    icon: 'fas fa-book',
                    badge: 'Novo',
                    features: ['Conteúdo prático', 'Certificado de conclusão']
                };
                courses.push(newCourse);
                showNotification('Curso criado com sucesso!', 'success');
            }
            
            closeModalById(document.getElementById('course-management-modal'));
            loadCoursesTable();
            loadCourses();
        });
    }

    // Abas do admin
    const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
    adminTabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            
            // Remover classe active de todas as abas e conteúdo
            adminTabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Adicionar classe active à aba clicada
            e.target.classList.add('active');
            document.getElementById('tab-' + tabName).classList.add('active');
        });
    });

    // Exportar vendas
    const exportSalesBtn = document.getElementById('export-sales-btn');
    if (exportSalesBtn) {
        exportSalesBtn.addEventListener('click', () => {
            const allUsers = userDB.getAllUsers();
            let csv = 'Usuário,Email,Curso,Valor,Data da Compra,Status\n';
            
            allUsers.forEach(user => {
                user.profile.enrolledCourses.forEach(courseId => {
                    const course = courses.find(c => c.id === courseId);
                    if (course) {
                        csv += `"${user.name}","${user.email}","${course.title}","R$ ${course.price.toFixed(2).replace('.', ',')}","${new Date().toLocaleDateString('pt-BR')}","Concluída"\n`;
                    }
                });
            });

            if (allUsers.length === 0 || csv.split('\n').length <= 1) {
                showNotification('Nenhuma venda para exportar!', 'warning');
                return;
            }
            
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
            element.setAttribute('download', 'relatorio_vendas_' + new Date().getTime() + '.csv');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            
            showNotification('✅ Relatório de vendas exportado com sucesso!', 'success');
        });
    }
}

// Inicializar admin quando usuário faz login
function initializeAdminIfNeeded() {
    console.debug('[ADMIN] initializeAdminIfNeeded() - currentUser:', currentUser, 'adminUser before:', localStorage.getItem('adminUser'));
    // Verificar se é usuário teste para admin (email contém 'admin')
    if (currentUser && currentUser.email && currentUser.email.toLowerCase().includes('admin')) {
        localStorage.setItem('adminUser', currentUser.id);
        console.debug('[ADMIN] initializeAdminIfNeeded() - set adminUser =>', currentUser.id);
    }
    
    toggleAdminPanel();
    if (isAdmin()) {
        console.debug('[ADMIN] initializeAdminIfNeeded() - loading admin data');
        loadAdminData();
    } else {
        console.debug('[ADMIN] initializeAdminIfNeeded() - user is not admin');
    }
}