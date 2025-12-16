// Конфигурация GitHub
const GITHUB_CONFIG = {
    username: 'andreyvikodinov-ui',
    repo: '5A-Portfolio',
    branch: 'main',
    token: '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' // Только для загрузки
};

// Пароль для доступа (измените на свой)
const ADMIN_PASSWORD = '5Aclass2024';

// Данные учеников (можно расширить)
const STUDENTS = [
    { name: "Алексей", grade: "Отличник" },
    { name: "Мария", grade: "Хорошистка" },
    { name: "Дмитрий", grade: "Активный" },
    { name: "Анна", grade: "Творческая" },
    { name: "Иван", grade: "Спортсмен" },
    { name: "Елена", grade: "Ответственная" },
    { name: "Сергей", grade: "Любознательный" },
    { name: "Ольга", grade: "Доброжелательная" },
    { name: "Никита", grade: "Энергичный" },
    { name: "Виктория", grade: "Талантливая" },
    { name: "Артем", grade: "Лидер" },
    { name: "София", grade: "Артистичная" },
    { name: "Максим", grade: "Технический" },
    { name: "Ксения", grade: "Организатор" },
    { name: "Павел", grade: "Находчивый" },
    { name: "Алиса", grade: "Мечтательница" },
    { name: "Роман", grade: "Серьезный" },
    { name: "Полина", grade: "Общительная" },
    { name: "Михаил", grade: "Справедливый" },
    { name: "Дарина", grade: "Внимательная" },
    { name: "Кирилл", grade: "Усидчивый" },
    { name: "Валерия", grade: "Креативная" },
    { name: "Егор", grade: "Решительный" },
    { name: "Арина", grade: "Заботливая" },
    { name: "Тимофей", grade: "Любопытный" }
];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    displayStudents();
    loadPortfolioData();
    setupEventListeners();
});

// Отображение учеников
function displayStudents() {
    const grid = document.getElementById('students-grid');
    grid.innerHTML = '';

    STUDENTS.forEach((student, index) => {
        const card = document.createElement('div');
        card.className = 'student-card';
        
        // Цвета для аватарок
        const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
        const color = colors[index % colors.length];
        
        card.innerHTML = `
            <div class="student-avatar" style="background: ${color}">
                ${student.name.charAt(0)}
            </div>
            <h3>${student.name}</h3>
            <p>${student.grade}</p>
        `;
        
        grid.appendChild(card);
    });
}

// Загрузка портфолио из GitHub
async function loadPortfolioData() {
    try {
        const response = await axios.get(
            `https://raw.githubusercontent.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/data.json`
        );
        
        if (response.data && Array.isArray(response.data)) {
            displayPortfolioItems(response.data);
        }
    } catch (error) {
        console.log('Используем тестовые данные...');
        displayTestPortfolio();
    }
}

// Отображение тестовых данных
function displayTestPortfolio() {
    const testData = [
        {
            id: 1,
            image: "https://via.placeholder.com/400x300/4A90E2/FFFFFF?text=Школьный+концерт",
            description: "Наш класс на школьном концерте. Выступали с песней о дружбе!",
            student: "Мария и Алексей",
            date: "15.09.2024"
        },
        {
            id: 2,
            image: "https://via.placeholder.com/400x300/38B2AC/FFFFFF?text=Спортивные+достижения",
            description: "Заняли первое место в школьной эстафете! Мы - чемпионы!",
            student: "Иван и команда",
            date: "10.09.2024"
        },
        {
            id: 3,
            image: "https://via.placeholder.com/400x300/F687B3/FFFFFF?text=Творческая+работа",
            description: "Наша выставка рисунков 'Осенняя пора'. Все работы были прекрасны!",
            student: "Анна и София",
            date: "05.09.2024"
        }
    ];
    
    displayPortfolioItems(testData);
}

// Отображение элементов портфолио
function displayPortfolioItems(items) {
    const gallery = document.getElementById('portfolio-gallery');
    gallery.innerHTML = '';
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'portfolio-item';
        
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.description}" class="portfolio-img">
            <div class="portfolio-content">
                <h3>${item.student || 'Класс 5А'}</h3>
                <p>${item.description}</p>
                <p class="portfolio-date"><small>${item.date || 'Сентябрь 2024'}</small></p>
            </div>
        `;
        
        gallery.appendChild(itemElement);
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const logoutBtn = document.getElementById('logout-btn');
    const uploadBtn = document.getElementById('upload-btn');
    
    // Проверка пароля
    passwordSubmit.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkPassword();
    });
    
    // Выход из режима админа
    logoutBtn.addEventListener('click', logout);
    
    // Загрузка фото
    uploadBtn.addEventListener('click', uploadPhoto);
}

// Проверка пароля
function checkPassword() {
    const passwordInput = document.getElementById('password-input');
    const adminSection = document.getElementById('admin-section');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (passwordInput.value === ADMIN_PASSWORD) {
        // Показываем секцию админа
        adminSection.style.display = 'block';
        logoutBtn.style.display = 'block';
        passwordInput.style.display = 'none';
        document.querySelector('.password-btn').style.display = 'none';
        
        // Показываем сообщение
        showMessage('Доступ разрешен! Теперь вы можете загружать фото.', 'success');
    } else {
        showMessage('Неверный пароль! Попробуйте еще раз.', 'error');
        passwordInput.value = '';
    }
}

// Выход из режима админа
function logout() {
    const adminSection = document.getElementById('admin-section');
    const passwordInput = document.getElementById('password-input');
    const logoutBtn = document.getElementById('logout-btn');
    const passwordSubmit = document.querySelector('.password-btn');
    
    adminSection.style.display = 'none';
    logoutBtn.style.display = 'none';
    passwordInput.style.display = 'block';
    passwordSubmit.style.display = 'block';
    passwordInput.value = '';
    
    showMessage('Режим загрузки закрыт', 'success');
}

// Загрузка фото (симуляция через GitHub API)
async function uploadPhoto() {
    const photoInput = document.getElementById('photo-upload');
    const description = document.getElementById('photo-description').value;
    const studentName = document.getElementById('student-name').value;
    const uploadStatus = document.getElementById('upload-status');
    
    // Проверка заполненности
    if (!photoInput.files[0]) {
        showMessage('Пожалуйста, выберите фото', 'error');
        return;
    }
    
    if (!description.trim()) {
        showMessage('Пожалуйста, добавьте описание', 'error');
        return;
    }
    
    // Показываем загрузку
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
    
    try {
        // В реальном проекте здесь будет загрузка на GitHub
        // Для демо используем тестовые данные
        setTimeout(() => {
            // Создаем тестовый элемент
            const newItem = {
                id: Date.now(),
                image: URL.createObjectURL(photoInput.files[0]),
                description: description,
                student: studentName || 'Ученик 5А',
                date: new Date().toLocaleDateString('ru-RU')
            };
            
            // Добавляем в галерею
            addPortfolioItem(newItem);
            
            // Очищаем форму
            photoInput.value = '';
            document.getElementById('photo-description').value = '';
            document.getElementById('student-name').value = '';
            
            // Показываем успех
            showMessage('Фото успешно загружено!', 'success');
            
            // Восстанавливаем кнопку
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Загрузить';
            
        }, 1500);
        
    } catch (error) {
        showMessage('Ошибка при загрузке: ' + error.message, 'error');
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Загрузить';
    }
}

// Добавление элемента в портфолио
function addPortfolioItem(item) {
    const gallery = document.getElementById('portfolio-gallery');
    
    const itemElement = document.createElement('div');
    itemElement.className = 'portfolio-item';
    
    itemElement.innerHTML = `
        <img src="${item.image}" alt="${item.description}" class="portfolio-img">
        <div class="portfolio-content">
            <h3>${item.student || 'Класс 5А'}</h3>
            <p>${item.description}</p>
            <p class="portfolio-date"><small>${item.date}</small></p>
        </div>
    `;
    
    // Добавляем в начало
    gallery.insertBefore(itemElement, gallery.firstChild);
}

// Показать сообщение
function showMessage(text, type) {
    const status = document.getElementById('upload-status');
    status.textContent = text;
    status.className = `upload-status ${type}`;
    status.style.display = 'block';
    
    // Автоматически скрываем через 5 секунд
    setTimeout(() => {
        status.style.display = 'none';
    }, 5000);
}
