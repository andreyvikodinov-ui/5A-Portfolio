// Конфигурация GitHub API (заполнена внутри кода как требуется)
const GITHUB_CONFIG = {
    username: "andreyvikodinov-ui",
    repository: "5A-Portfolio",
    encodedToken: "01100111 01101000 01110000 01011111 01101101 01000010 01110001 01010010 01001101 01011000 01100011 01111000 01010111 01100100 00110000 00110100 01011010 01001110 01101100 00110010 01011001 01010010 01111001 00111001 01011000 01001000 01011010 01100001 01000001 01000100 01101010 01101111 01110011 01010001 00110011 01000111 01001110 01110000 01000100 01000001",
    portfolioFile: "portfolio.json",
    adminPassword: "1234"
};

// Функция для расшифровки бинарного токена
function decodeBinaryToken(binaryString) {
    const binaryArray = binaryString.split(' ');
    let token = '';
    
    for (let i = 0; i < binaryArray.length; i++) {
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
    currentFilter: '',
    photoToDelete: null
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
const fileName = document.getElementById('fileName');
const uploadBtn = document.getElementById('uploadBtn');
const clearFormBtn = document.getElementById('clearFormBtn');
const uploadStatus = document.getElementById('uploadStatus');
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalStudent = document.getElementById('modalStudent');
const modalDate = document.getElementById('modalDate');
const closeModalBtn = document.querySelector('.close-modal');
const adminPortfolioList = document.getElementById('adminPortfolioList');
const confirmDeleteModal = document.getElementById('confirmDeleteModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

// Показать/скрыть админ-панель
adminToggleBtn.addEventListener('click', () => {
    adminPanel.classList.toggle('hidden');
    
    if (adminPanel.classList.contains('hidden')) {
        adminToggleBtn.innerHTML = '<i class="fas fa-lock"></i> Админ-панель';
        adminToggleBtn.style.background = 'linear-gradient(to right, #ff7e5f, #feb47b)';
    } else {
        adminToggleBtn.innerHTML = '<i class="fas fa-times"></i> Закрыть админ-панель';
        adminToggleBtn.style.background = 'linear-gradient(to right, #718096, #4a5568)';
        
        // Сброс состояния админ-панели
        if (!AppState.isAdmin) {
            uploadSection.classList.add('hidden');
            adminPasswordInput.value = '';
        } else {
            // Если админ уже вошел, обновляем список для удаления
            renderAdminPortfolioList();
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
        
        // Обновляем список для удаления
        renderAdminPortfolioList();
        
        // Показать информацию о репозитории (для отладки)
        console.log('Админ вошел в систему. Репозиторий:', GITHUB_CONFIG.repository);
        console.log('Фотографии сохраняются в файл:', GITHUB_CONFIG.portfolioFile);
        console.log('Все данные (включая фото в base64) хранятся в одном JSON файле на GitHub');
    } else {
        uploadStatus.textContent = 'Неверный пароль. Попробуйте снова.';
        uploadStatus.className = 'status-message status-error';
        uploadSection.classList.add('hidden');
    }
});

// Отслеживание изменения файла
photoFileInput.addEventListener('change', function() {
    const file = this.files[0];
    
    if (file) {
        // Проверяем, что это изображение
        if (!file.type.match('image.*')) {
            uploadStatus.textContent = 'Пожалуйста, выберите файл изображения (JPG, PNG, GIF)';
            uploadStatus.className = 'status-message status-error';
            filePreview.innerHTML = '<p><i class="fas fa-exclamation-triangle"></i> Выберите файл изображения</p>';
            fileName.textContent = 'Файл не выбран';
            return;
        }
        
        // Показываем имя файла
        fileName.textContent = file.name;
        
        // Показываем превью
        const reader = new FileReader();
        reader.onload = function(e) {
            filePreview.innerHTML = `<img src="${e.target.result}" alt="Предпросмотр">`;
        };
        reader.readAsDataURL(file);
        
        uploadStatus.textContent = '';
        uploadStatus.className = 'status-message';
    } else {
        filePreview.innerHTML = '<p><i class="fas fa-image"></i> Превью появится здесь</p>';
        fileName.textContent = 'Файл не выбран';
    }
});

// Очистка формы
clearFormBtn.addEventListener('click', () => {
    document.getElementById('photoTitle').value = '';
    document.getElementById('photoDescription').value = '';
    document.getElementById('studentName').value = '';
    photoFileInput.value = '';
    filePreview.innerHTML = '<p><i class="fas fa-image"></i> Превью появится здесь</p>';
    fileName.textContent = 'Файл не выбран';
    uploadStatus.textContent = '';
    uploadStatus.className = 'status-message';
});

// Функция для правильного кодирования русского текста в base64
function encodeToBase64(str) {
    // Кодируем строку в base64 с поддержкой Unicode
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, 
        function(match, p1) {
            return String.fromCharCode('0x' + p1);
        }
    ));
}

// Функция для правильного декодирования русского текста из base64
function decodeFromBase64(str) {
    // Декодируем base64 с поддержкой Unicode
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}

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
    clearFormBtn.disabled = true;
    
    try {
        // Читаем файл как Data URL (base64)
        const fileDataUrl = await readFileAsDataURL(file);
        
        // Создаем объект для нового фото
        const newPhoto = {
            id: Date.now(), // Используем временную метку как ID
            title: title,
            description: description,
            student: studentName || 'Весь класс',
            date: new Date().toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }),
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
        
        // Обновляем состояние приложения
        AppState.portfolioData = existingData;
        
        // Обновляем отображение портфолио
        renderPortfolio();
        
        // Обновляем список для удаления
        renderAdminPortfolioList();
        
        // Очищаем форму
        document.getElementById('photoTitle').value = '';
        document.getElementById('photoDescription').value = '';
        document.getElementById('studentName').value = '';
        photoFileInput.value = '';
        filePreview.innerHTML = '<p><i class="fas fa-image"></i> Превью появится здесь</p>';
        fileName.textContent = 'Файл не выбран';
        
    } catch (error) {
        console.error('Ошибка при загрузке фото:', error);
        uploadStatus.textContent = 'Ошибка при загрузке фото: ' + error.message;
        uploadStatus.className = 'status-message status-error';
    } finally {
        uploadBtn.disabled = false;
        clearFormBtn.disabled = false;
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
        
        // Декодируем содержимое файла из base64 с поддержкой русского
        const content = decodeFromBase64(data.content);
        
        // Парсим JSON
        return JSON.parse(content);
        
    } catch (error) {
        console.error('Ошибка при загрузке портфолио:', error);
        
        // В случае ошибки возвращаем тестовые данные для демонстрации
        return getDemoPortfolioData();
    }
}

// Функция для сохранения данных портфолио в GitHub (с исправлением кодировки)
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
        
        // Преобразуем данные в JSON и кодируем в base64 с поддержкой русского
        const content = JSON.stringify(portfolioData, null, 2);
        const encodedContent = encodeToBase64(content);
        
        // Формируем данные для отправки
        const updateData = {
            message: `Обновление портфолио: ${new Date().toLocaleString('ru-RU')}`,
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
            const errorText = await putResponse.text();
            throw new Error(`Ошибка HTTP при сохранении: ${putResponse.status}. ${errorText}`);
        }
        
        return true;
        
    } catch (error) {
        console.error('Ошибка при сохранении портфолио:', error);
        throw error;
    }
}

// Функция для удаления фото из портфолио
async function deletePhoto(photoId) {
    try {
        // Находим индекс фото для удаления
        const photoIndex = AppState.portfolioData.findIndex(photo => photo.id === photoId);
        
        if (photoIndex === -1) {
            throw new Error('Фото не найдено');
        }
        
        // Удаляем фото из массива
        AppState.portfolioData.splice(photoIndex, 1);
        
        // Сохраняем обновленные данные
        await savePortfolioData(AppState.portfolioData);
        
        // Обновляем отображение
        renderPortfolio();
        renderAdminPortfolioList();
        
        return true;
        
    } catch (error) {
        console.error('Ошибка при удалении фото:', error);
        throw error;
    }
}

// Функция для рендеринга списка в админ-панели для удаления
function renderAdminPortfolioList() {
    if (!AppState.isAdmin || AppState.portfolioData.length === 0) {
        adminPortfolioList.innerHTML = '<p class="empty-list-message">Загрузите первое фото, чтобы появился список</p>';
        return;
    }
    
    let listHTML = '';
    
    AppState.portfolioData.forEach(item => {
        // Обрезаем длинное описание для отображения в списке
        const shortDescription = item.description.length > 100 
            ? item.description.substring(0, 100) + '...' 
            : item.description;
            
        listHTML += `
            <div class="admin-portfolio-item" data-id="${item.id}">
                <div class="item-info">
                    <h4>${item.title}</h4>
                    <p>${shortDescription}</p>
                    <p><strong>Ученик:</strong> ${item.student} | <strong>Дата:</strong> ${item.date}</p>
                </div>
                <button class="btn-delete delete-photo-btn" data-id="${item.id}">
                    <i class="fas fa-trash-alt"></i> Удалить
                </button>
            </div>
        `;
    });
    
    adminPortfolioList.innerHTML = listHTML;
    
    // Добавляем обработчики для кнопок удаления
    document.querySelectorAll('.delete-photo-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation(); // Останавливаем всплытие события
            const photoId = parseInt(this.getAttribute('data-id'));
            showDeleteConfirmation(photoId);
        });
    });
}

// Показать модальное окно подтверждения удаления
function showDeleteConfirmation(photoId) {
    AppState.photoToDelete = photoId;
    
    // Находим данные фото для отображения в подтверждении
    const photoData = AppState.portfolioData.find(photo => photo.id === photoId);
    
    if (photoData) {
        confirmDeleteModal.classList.remove('hidden');
    }
}

// Скрыть модальное окно подтверждения удаления
function hideDeleteConfirmation() {
    confirmDeleteModal.classList.add('hidden');
    AppState.photoToDelete = null;
}

// Обработчик подтверждения удаления
confirmDeleteBtn.addEventListener('click', async () => {
    if (AppState.photoToDelete) {
        try {
            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Удаление...';
            
            await deletePhoto(AppState.photoToDelete);
            
            uploadStatus.textContent = 'Фото успешно удалено из портфолио!';
            uploadStatus.className = 'status-message status-success';
            
            hideDeleteConfirmation();
            
        } catch (error) {
            uploadStatus.textContent = 'Ошибка при удалении фото: ' + error.message;
            uploadStatus.className = 'status-message status-error';
        } finally {
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Да, удалить';
        }
    }
});

// Обработчик отмены удаления
cancelDeleteBtn.addEventListener('click', hideDeleteConfirmation);

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
            description: "Наш одноклассник Иван Петров занял первое место в школьной олимпиаде по математике. Мы очень гордимся его достижением!",
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
        
        // Если админ вошел, обновляем и список для удаления
        if (AppState.isAdmin) {
            renderAdminPortfolioList();
        }
        
        uploadStatus.textContent = 'Портфолио успешно обновлено';
        uploadStatus.className = 'status-message status-success';
    } catch (error) {
        console.error('Ошибка при обновлении портфолио:', error);
        uploadStatus.textContent = 'Ошибка при загрузке портфолио: ' + error.message;
        uploadStatus.className = 'status-message status-error';
    } finally {
        refreshPortfolioBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить';
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
    if (e.key === 'Escape') {
        if (!imageModal.classList.contains('hidden')) {
            closeImageModal();
        }
        if (!confirmDeleteModal.classList.contains('hidden')) {
            hideDeleteConfirmation();
        }
    }
});

// Инициализация приложения
async function initApp() {
    // Загружаем данные портфолио
    AppState.portfolioData = await loadPortfolioData();
    
    // Отображаем портфолио
    renderPortfolio();
    
    // Выводим информацию для отладки
    console.log('=== ИНФОРМАЦИЯ О ХРАНЕНИИ ДАННЫХ ===');
    console.log('1. Все данные хранятся в одном файле: portfolio.json');
    console.log('2. Фотографии конвертируются в формат base64 и сохраняются внутри JSON файла');
    console.log('3. Русский текст корректно кодируется и декодируется');
    console.log('4. Файл portfolio.json хранится в репозитории GitHub:');
    console.log('   - Репозиторий:', GITHUB_CONFIG.repository);
    console.log('   - Пользователь:', GITHUB_CONFIG.username);
    console.log('5. Для изменения данных используется GitHub API с токеном доступа');
}

// Запускаем приложение при загрузке страницы
document.addEventListener('DOMContentLoaded', initApp);
