// Конфигурация GitHub
const GITHUB_CONFIG = {
    username: 'andreyvikodinov-ui', // Замените на ваш логин
    repo: '5A-Portfolio',     // Замените на название репозитория
    branch: 'main',
    token: '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'    // Получите на GitHub: Settings → Developer settings → Personal access tokens
};

// Пароль для доступа к форме загрузки
const ADMIN_PASSWORD = '1234';

// Переменные состояния
let portfolioData = [];
let isAdminMode = false;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadPortfolioFromGitHub();
    
    // Настройка Lightbox
    lightbox.option({
        'resizeDuration': 200,
        'wrapAround': true,
        'albumLabel': 'Фото %1 из %2'
    });
});

// Настройка обработчиков событий
function setupEventListeners() {
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const logoutBtn = document.getElementById('logout-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const photoUpload = document.getElementById('photo-upload');
    
    // Проверка пароля
    passwordSubmit.addEventListener('click', checkPassword);
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkPassword();
    });
    
    // Выход из режима админа
    logoutBtn.addEventListener('click', logout);
    
    // Загрузка фото
    uploadBtn.addEventListener('click', uploadPhotoToGitHub);
    
    // Отображение имени выбранного файла
    photoUpload.addEventListener('change', function(e) {
        const fileName = document.getElementById('file-name');
        if (e.target.files.length > 0) {
            fileName.textContent = `Выбрано: ${e.target.files[0].name}`;
            fileName.style.color = '#4a5568';
        } else {
            fileName.textContent = '';
        }
    });
    
    // Установка текущей даты по умолчанию
    document.getElementById('photo-date').valueAsDate = new Date();
}

// Проверка пароля
function checkPassword() {
    const passwordInput = document.getElementById('password-input');
    const passwordStatus = document.getElementById('password-status');
    const adminSection = document.getElementById('admin-section');
    const logoutBtn = document.getElementById('logout-btn');
    
    if (passwordInput.value === ADMIN_PASSWORD) {
        isAdminMode = true;
        
        // Показываем секцию админа
        adminSection.style.display = 'block';
        logoutBtn.style.display = 'block';
        passwordInput.style.display = 'none';
        document.querySelector('.password-btn').style.display = 'none';
        
        // Показываем сообщение
        passwordStatus.textContent = 'Доступ разрешен! Теперь вы можете загружать фото в репозиторий.';
        passwordStatus.className = 'password-status success';
        
        // Прокручиваем к форме
        adminSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        passwordStatus.textContent = 'Неверный пароль! Попробуйте еще раз.';
        passwordStatus.className = 'password-status error';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

// Выход из режима админа
function logout() {
    const adminSection = document.getElementById('admin-section');
    const passwordInput = document.getElementById('password-input');
    const logoutBtn = document.getElementById('logout-btn');
    const passwordSubmit = document.querySelector('.password-btn');
    const passwordStatus = document.getElementById('password-status');
    
    isAdminMode = false;
    adminSection.style.display = 'none';
    logoutBtn.style.display = 'none';
    passwordInput.style.display = 'block';
    passwordSubmit.style.display = 'block';
    passwordInput.value = '';
    passwordStatus.textContent = '';
}

// Загрузка портфолио из GitHub
async function loadPortfolioFromGitHub() {
    try {
        // Загружаем индексный файл
        const response = await axios.get(
            `https://raw.githubusercontent.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/portfolio_index.json`,
            {
                headers: {
                    'Accept': 'application/vnd.github.v3.raw'
                }
            }
        );
        
        if (response.data && Array.isArray(response.data)) {
            portfolioData = response.data;
            displayPortfolio();
        }
    } catch (error) {
        console.log('Индексный файл не найден или репозиторий пустой.');
        portfolioData = [];
        displayPortfolio();
    }
}

// Отображение портфолио
function displayPortfolio() {
    const gallery = document.getElementById('portfolio-gallery');
    const emptyState = document.getElementById('empty-gallery');
    
    gallery.innerHTML = '';
    
    if (portfolioData.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Сортируем по дате (новые сначала)
    portfolioData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    portfolioData.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'portfolio-item';
        
        // Формируем URL к изображению в raw.githubusercontent.com
        const imageUrl = `https://raw.githubusercontent.com/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${item.image}`;
        
        itemElement.innerHTML = `
            <a href="${imageUrl}" data-lightbox="portfolio" data-title="${item.description}">
                <img src="${imageUrl}" alt="${item.description}" class="portfolio-img" loading="lazy">
            </a>
            <div class="portfolio-content">
                ${item.student ? `<h3>${item.student}</h3>` : ''}
                <p>${item.description}</p>
                <p class="portfolio-date">${formatDate(item.date)}</p>
            </div>
        `;
        
        gallery.appendChild(itemElement);
    });
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Загрузка фото в GitHub
async function uploadPhotoToGitHub() {
    const photoInput = document.getElementById('photo-upload');
    const description = document.getElementById('photo-description').value.trim();
    const studentName = document.getElementById('student-name').value.trim();
    const photoDate = document.getElementById('photo-date').value;
    const uploadBtn = document.getElementById('upload-btn');
    const uploadProgress = document.getElementById('upload-progress');
    const uploadStatus = document.getElementById('upload-status');
    
    // Валидация
    if (!photoInput.files[0]) {
        showMessage('Пожалуйста, выберите фото для загрузки', 'error');
        return;
    }
    
    if (!description) {
        showMessage('Пожалуйста, добавьте описание к фото', 'error');
        return;
    }
    
    if (!photoDate) {
        showMessage('Пожалуйста, укажите дату события', 'error');
        return;
    }
    
    // Проверка размера файла (макс 5MB)
    if (photoInput.files[0].size > 5 * 1024 * 1024) {
        showMessage('Размер файла не должен превышать 5MB', 'error');
        return;
    }
    
    // Показываем прогресс
    uploadBtn.disabled = true;
    uploadProgress.style.display = 'block';
    uploadStatus.textContent = '';
    
    try {
        // Генерируем уникальный префикс на основе timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '').replace('T', '_').split('-').join('').slice(0, 15);
        const fileExtension = photoInput.files[0].name.split('.').pop();
        
        // Имена файлов для сохранения в корень репозитория
        const photoFileName = `${timestamp}_photo.${fileExtension}`;
        const descriptionFileName = `${timestamp}_description.txt`;
        
        // Шаг 1: Получаем текущее содержимое index файла
        let currentIndex = [];
        try {
            const indexResponse = await axios.get(
                `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/contents/portfolio_index.json`,
                {
                    headers: {
                        'Authorization': `token ${GITHUB_CONFIG.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            const content = JSON.parse(atob(indexResponse.data.content));
            if (Array.isArray(content)) {
                currentIndex = content;
            }
        } catch (error) {
            // Файл не существует, создадим новый
            currentIndex = [];
        }
        
        // Шаг 2: Загружаем фото в корень репозитория
        const photoContent = await readFileAsBase64(photoInput.files[0]);
        
        await axios.put(
            `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/contents/${photoFileName}`,
            {
                message: `Добавлено фото: ${photoFileName}`,
                content: photoContent.split(',')[1], // Убираем префикс data:image/...
                branch: GITHUB_CONFIG.branch
            },
            {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        updateProgress(33);
        
        // Шаг 3: Загружаем описание в корень репозитория
        const descriptionContent = btoa(unescape(encodeURIComponent(description)));
        
        await axios.put(
            `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/contents/${descriptionFileName}`,
            {
                message: `Добавлено описание: ${descriptionFileName}`,
                content: descriptionContent,
                branch: GITHUB_CONFIG.branch
            },
            {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        updateProgress(66);
        
        // Шаг 4: Обновляем индексный файл
        const newItem = {
            image: photoFileName,
            description: description,
            student: studentName || null,
            date: photoDate,
            uploaded: new Date().toISOString()
        };
        
        currentIndex.push(newItem);
        
        const indexContent = btoa(unescape(encodeURIComponent(JSON.stringify(currentIndex, null, 2))));
        
        // Получаем SHA текущего файла, если он существует
        let sha = '';
        try {
            const shaResponse = await axios.get(
                `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/contents/portfolio_index.json`,
                {
                    headers: {
                        'Authorization': `token ${GITHUB_CONFIG.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            sha = shaResponse.data.sha;
        } catch (error) {
            // Файл не существует, sha останется пустым
        }
        
        await axios.put(
            `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repo}/contents/portfolio_index.json`,
            {
                message: `Обновлен индекс портфолио`,
                content: indexContent,
                branch: GITHUB_CONFIG.branch,
                sha: sha || undefined
            },
            {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );
        
        updateProgress(100);
        
        // Успех!
        showMessage('✅ Фото и описание успешно загружены в репозиторий! Страница обновится через 3 секунды...', 'success');
        
        // Обновляем данные и сбрасываем форму
        portfolioData.push(newItem);
        
        // Задержка перед обновлением страницы
        setTimeout(() => {
            resetUploadForm();
            loadPortfolioFromGitHub();
        }, 3000);
        
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        showMessage(`❌ Ошибка загрузки: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
        uploadBtn.disabled = false;
        uploadProgress.style.display = 'none';
    }
}

// Чтение файла как base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Обновление прогресс-бара
function updateProgress(percent) {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `Загрузка... ${percent}%`;
}

// Показать сообщение
function showMessage(text, type) {
    const status = document.getElementById('upload-status');
    status.textContent = text;
    status.className = `upload-status ${type}`;
    status.style.display = 'block';
}

// Сброс формы загрузки
function resetUploadForm() {
    document.getElementById('photo-upload').value = '';
    document.getElementById('photo-description').value = '';
    document.getElementById('student-name').value = '';
    document.getElementById('photo-date').valueAsDate = new Date();
    document.getElementById('file-name').textContent = '';
    document.getElementById('upload-status').textContent = '';
}
