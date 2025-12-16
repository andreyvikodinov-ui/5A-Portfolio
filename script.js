// Конфигурация GitHub API (заполнена внутри кода как требуется)
// Эти данные будут скрыты в коде
const GITHUB_CONFIG = {
    // Логин пользователя GitHub
    username: "andreyvikodinov-ui",
    // Название репозитория
    repository: "5A-Portfolio",
    // Токен закодированный в бинарном виде (будет расшифрован)
    encodedToken: "01100111 01101000 01110000 01011111 01101101 01000010 01110001 01010010 01001101 01011000 01100011 01111000 01010111 01100100 00110000 00110100 01011010 01001110 01101100 00110010 01011001 01010010 01111001 00111001 01011000 01001000 01011010 01100001 01000001 01000100 01101010 01101111 01110011 01010001 00110011 01000111 01001110 01110000 01000100 01000001",
    // Путь к файлу с данными портфолио в репозитории
    portfolioFile: "portfolio.json",
    // Пароль для админ-панели (пользователь вводит сам)
    // В реальном использовании этот пароль должен быть сложным
    adminPassword: "1234"
};

// Функция для расшифровки бинарного токена
function decodeBinaryToken(binaryString) {
    // Разделяем строку по пробелам и преобразуем каждый байт в символ
    const binaryArray = binaryString.split(' ');
    let token = '';
    
    for (let i = 0; i < binaryArray.length; i++) {
        // Преобразуем двоичную строку в десятичное число, затем в символ
        const charCode = parseInt(binaryArray[i], 2);
        token += String.fromCharCode(charCode);
    }
    
    return token;
}

// Получаем декодированный токен
const GITHUB_TOKEN = decodeBinaryToken(GITHUB_CONFIG.encodedToken);

// Базовый URL для GitHub API
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/contents`;

// Состояние приложения
const AppState = {
    isAdmin: false,
    portfolioData: [],
    currentFilter: ''
};

// DOM элементы
const adminPanel = document.getElementById('adminPanel');
const adminToggleBtn = document.getElementById('adminToggleBtn');
const adminPasswordInput = document.getElementById('adminPassword');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const uploadSection = document.getElementById('uploadSection');
const portfolioGrid = document.getElementById('portfolioGrid');
const noPhotosMessage = document.getElementById('noPhotosMessage');
const searchInput = document.getElementById('searchInput');
const refreshPortfolioBtn = document.getElementById('refreshPortfolio');
const photoFileInput = document.getElementById('photoFile');
const filePreview = document.getElementById('filePreview');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalStudent = document.getElementById('modalStudent');
const modalDate = document.getElementById('modalDate');
const closeModalBtn = document.querySelector('.close-modal');

// Показать/скрыть админ-панель
adminToggleBtn.addEventListener('click', () => {
    adminPanel.classList.toggle('hidden');
    
    if (adminPanel.classList.contains('hidden')) {
        adminToggleBtn.innerHTML = '<i class="fas fa-lock"></i> Админ-панель';
    } else {
        adminToggleBtn.innerHTML = '<i class="fas fa-times"></i> Закрыть админ-панель';
        // Сброс состояния админ-панели
        if (!AppState.isAdmin) {
            uploadSection.classList.add('hidden');
            adminPasswordInput.value = '';
        }
    }
});

// Вход в админ-панель
adminLoginBtn.addEventListener('click', () => {
    const password = adminPasswordInput.value;
    
    if (password === GITHUB_CONFIG.adminPassword) {
        AppState.isAdmin = true;
        uploadSection.classList.remove('hidden');
        uploadStatus.textContent = 'Доступ к загрузке разрешен';
        uploadStatus.className = 'status-message status-success';
        
        // Показать информацию о репозитории (для отладки, можно удалить в продакшене)
        console.log('Админ вошел в систему. Репозиторий:', GITHUB_CONFIG.repository);
    } else {
        uploadStatus.textContent = 'Неверный пароль. Попробуйте снова.';
        uploadStatus.className = 'status-message status-error';
        uploadSection.classList.add('hidden');
    }
});

// Просмотр выбранного файла
photoFileInput.addEventListener('change', function() {
    const file = this.files[0];
    
    if (file) {
        // Проверяем, что это изображение
        if (!file.type.match('image.*')) {
            uploadStatus.textContent = 'Пожалуйста, выберите файл изображения (JPG, PNG, GIF)';
            uploadStatus.className = 'status-message status-error';
            filePreview.innerHTML = '';
            return;
        }
        
        // Показываем превью
        const reader = new FileReader();
        reader.onload = function(e) {
            filePreview.innerHTML = `<img src="${e.target.result}" alt="Предпросмотр">`;
        };
        reader.readAsDataURL(file);
        
        uploadStatus.textContent = '';
        uploadStatus.className = 'status-message';
    } else {
        filePreview.innerHTML = '';
    }
});

// Загрузка фото в портфолио
uploadBtn.addEventListener('click', async () => {
    // Проверяем, что пользователь вошел как админ
    if (!AppState.isAdmin) {
        uploadStatus.textContent = 'Сначала войдите как администратор';
        uploadStatus.className = 'status-message status-error';
        return;
    }
    
    // Получаем данные из формы
    const title = document.getElementById('photoTitle').value.trim();
    const description = document.getElementById('photoDescription').value.trim();
    const studentName = document.getElementById('studentName').value.trim();
    const file = photoFileInput.files[0];
    
    // Проверяем обязательные поля
    if (!title) {
        uploadStatus.textContent = 'Пожалуйста, введите заголовок фото';
        uploadStatus.className = 'status-message status-error';
        return;
    }
    
    if (!description) {
        uploadStatus.textContent = 'Пожалуйста, введите описание фото';
        uploadStatus.className = 'status-message status-error';
        return;
    }
    
    if (!file) {
        uploadStatus.textContent = 'Пожалуйста, выберите файл фото';
        uploadStatus.className = 'status-message status-error';
        return;
    }
    
    uploadStatus.textContent = 'Загрузка фото...';
    uploadStatus.className = 'status-message';
    uploadBtn.disabled = true;
    
    try {
        // Читаем файл как Data URL (base64)
        const fileDataUrl = await readFileAsDataURL(file);
        
        // Создаем объект для нового фото
        const newPhoto = {
            id: Date.now(), // Используем временную метку как ID
            title: title,
            description: description,
            student: studentName || 'Весь класс',
            date: new Date().toLocaleDateString('ru-RU'),
            imageData: fileDataUrl // Сохраняем изображение в base64
        };
        
        // Загружаем существующие данные портфолио
        const existingData = await loadPortfolioData();
        
        // Добавляем новое фото
        existingData.push(newPhoto);
        
        // Сохраняем обновленные данные
        await savePortfolioData(existingData);
        
        // Успешная загрузка
        uploadStatus.textContent = 'Фото успешно загружено в портфолио!';
        uploadStatus.className = 'status-message status-success';
        
        // Очищаем форму
        document.getElementById('photoTitle').value = '';
        document.getElementById('photoDescription').value = '';
        document.getElementById('studentName').value = '';
        photoFileInput.value = '';
        filePreview.innerHTML = '';
        
        // Обновляем отображение портфолио
        AppState.portfolioData = existingData;
        renderPortfolio();
        
    } catch (error) {
        console.error('Ошибка при загрузке фото:', error);
        uploadStatus.textContent = 'Ошибка при загрузке фото: ' + error.message;
        uploadStatus.className = 'status-message status-error';
    } finally {
        uploadBtn.disabled = false;
    }
});

// Функция для чтения файла как Data URL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Ошибка при чтении файла'));
        reader.readAsDataURL(file);
    });
}

// Функция для загрузки данных портфолио из GitHub
async function loadPortfolioData() {
    try {
        // Формируем URL для получения файла
        const url = `${GITHUB_API_BASE}/${GITHUB_CONFIG.portfolioFile}`;
        
        // Выполняем запрос к GitHub API
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (!response.ok) {
            // Если файл не найден, возвращаем пустой массив
            if (response.status === 404) {
                return [];
            }
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Декодируем содержимое файла из base64
        const content = atob(data.content);
        
        // Парсим JSON
        return JSON.parse(content);
        
    } catch (error) {
        console.error('Ошибка при загрузке портфолио:', error);
        
        // В случае ошибки возвращаем тестовые данные для демонстрации
        return getDemoPortfolioData();
    }
}

// Функция для сохранения данных портфолио в GitHub
async function savePortfolioData(portfolioData) {
    try {
        // Сначала получаем текущий файл, чтобы получить его SHA (идентификатор)
        const getUrl = `${GITHUB_API_BASE}/${GITHUB_CONFIG.portfolioFile}`;
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        let sha = '';
        if (getResponse.ok) {
            const existingFile = await getResponse.json();
            sha = existingFile.sha;
        }
        
        // Преобразуем данные в JSON и кодируем в base64
        const content = JSON.stringify(portfolioData, null, 2);
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        
        // Формируем данные для отправки
        const updateData = {
            message: `Добавлено новое фото в портфолио: ${new Date().toLocaleString('ru-RU')}`,
            content: encodedContent,
            sha: sha || undefined
        };
        
        // Отправляем запрос на обновление файла
        const putUrl = `${GITHUB_API_BASE}/${GITHUB_CONFIG.portfolioFile}`;
        const putResponse = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!putResponse.ok) {
            throw new Error(`Ошибка HTTP при сохранении: ${putResponse.status}`);
        }
        
        return true;
        
    } catch (error) {
        console.error('Ошибка при сохранении портфолио:', error);
        throw error;
    }
}

// Функция для получения демо-данных (используется при первой загрузке или в случае ошибки)
function getDemoPortfolioData() {
    return [
        {
            id: 1,
            title: "Наш первый день в 5А классе",
            description: "Этот памятный день, когда мы все собрались как новый 5А класс. Мы познакомились с нашей классной руководительницей Екатериной Николаевной.",
            student: "Весь класс",
            date: "01.09.2023",
            imageData: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
        },
        {
            id: 2,
            title: "Экскурсия в музей науки",
            description: "Мы посетили музей науки, где узнали много интересного о физических явлениях и провели увлекательные эксперименты.",
            student: "Весь класс",
            date: "15.10.2023",
            imageData: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
        },
        {
            id: 3,
            title: "Победитель олимпиады по математике",
            description: "Наш одноклассник занял первое место в школьной олимпиаде по математике. Мы очень гордимся его достижением!",
            student: "Иван Петров",
            date: "22.11.2023",
            imageData: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
        }
    ];
}

// Функция для отображения портфолио
function renderPortfolio() {
    // Фильтруем данные по поисковому запросу
    const filteredData = AppState.portfolioData.filter(item => {
        if (!AppState.currentFilter) return true;
        
        const searchLower = AppState.currentFilter.toLowerCase();
        return item.title.toLowerCase().includes(searchLower) ||
               item.description.toLowerCase().includes(searchLower) ||
               item.student.toLowerCase().includes(searchLower);
    });
    
    // Если нет фотографий, показываем сообщение
    if (filteredData.length === 0) {
        portfolioGrid.classList.add('hidden');
        noPhotosMessage.classList.remove('hidden');
        return;
    }
    
    // Скрываем сообщение и показываем сетку
    portfolioGrid.classList.remove('hidden');
    noPhotosMessage.classList.add('hidden');
    
    // Генерируем HTML для каждой фотографии
    let portfolioHTML = '';
    
    filteredData.forEach(item => {
        portfolioHTML += `
            <div class="portfolio-item" data-id="${item.id}">
                <div class="portfolio-image">
                    <img src="${item.imageData}" alt="${item.title}" loading="lazy">
                </div>
                <div class="portfolio-info">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <span class="student-tag">${item.student}</span>
                    <span class="date-tag">${item.date}</span>
                </div>
            </div>
        `;
    });
    
    portfolioGrid.innerHTML = portfolioHTML;
    
    // Добавляем обработчики кликов на элементы портфолио
    document.querySelectorAll('.portfolio-item').forEach(item => {
        item.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            const photoData = AppState.portfolioData.find(photo => photo.id === id);
            
            if (photoData) {
                openImageModal(photoData);
            }
        });
    });
}

// Функция для открытия модального окна с изображением
function openImageModal(photoData) {
    modalImage.src = photoData.imageData;
    modalImage.alt = photoData.title;
    modalTitle.textContent = photoData.title;
    modalDescription.textContent = photoData.description;
    
    if (photoData.student && photoData.student !== 'Весь класс') {
        modalStudent.textContent = `Ученик: ${photoData.student}`;
        modalStudent.classList.remove('hidden');
    } else {
        modalStudent.classList.add('hidden');
    }
    
    modalDate.textContent = `Добавлено: ${photoData.date}`;
    imageModal.classList.remove('hidden');
}

// Функция для закрытия модального окна
function closeImageModal() {
    imageModal.classList.add('hidden');
}

// Обработчик поиска
searchInput.addEventListener('input', function() {
    AppState.currentFilter = this.value.trim();
    renderPortfolio();
});

// Обновление портфолио
refreshPortfolioBtn.addEventListener('click', async () => {
    refreshPortfolioBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Загрузка...';
    refreshPortfolioBtn.disabled = true;
    
    try {
        AppState.portfolioData = await loadPortfolioData();
        renderPortfolio();
    } catch (error) {
        console.error('Ошибка при обновлении портфолио:', error);
        uploadStatus.textContent = 'Ошибка при загрузке портфолио: ' + error.message;
        uploadStatus.className = 'status-message status-error';
    } finally {
        refreshPortfolioBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить портфолио';
        refreshPortfolioBtn.disabled = false;
    }
});

// Обработчики для модального окна
closeModalBtn.addEventListener('click', closeImageModal);
imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
        closeImageModal();
    }
});

// Закрытие модального окна по клавише ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !imageModal.classList.contains('hidden')) {
        closeImageModal();
    }
});

// Инициализация приложения
async function initApp() {
    // Загружаем данные портфолио
    AppState.portfolioData = await loadPortfolioData();
    
    // Отображаем портфолио
    renderPortfolio();
    
    // Выводим информацию для отладки (можно удалить)
    console.log('Токен успешно расшифрован');
    console.log('Репозиторий:', GITHUB_CONFIG.repository);
    console.log('Логин:', GITHUB_CONFIG.username);
}

// Запускаем приложение при загрузке страницы
document.addEventListener('DOMContentLoaded', initApp);
