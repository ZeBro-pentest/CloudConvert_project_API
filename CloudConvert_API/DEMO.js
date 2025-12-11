// ======== DEMO VERSION БЕЗ API ========
// Это демонстрационная версия, которая имитирует работу CloudConvert API

// ======== ПОЛУЧАЕМ ЭЛЕМЕНТЫ ========
const selectFileBtn = document.getElementById("selected_file");
const fileInput = document.getElementById("file_input");
const maxSizeText = document.querySelector(".max-size");
const fileCard = document.querySelector(".file-card");
const fileNameEl = document.getElementById("file_name");
const fileTypeEl = document.getElementById("type");
const fileSizeEl = document.getElementById("size");
const convertBtn = document.getElementById("convert_btn");
const downloadBtn = document.getElementById("download_btn");
const mainElement = document.querySelector("main");

let selectedFile = null;
let convertedFileUrl = null;
let isConverting = false;

// кнопка заменить файл (пока что не работает)
const refreshFile = document.getElementById("refresh_file")
// ----------------------------------------------
refreshFile.addEventListener("click", () => {
    // чтобы открыть окно выбора файла
    fileInput.click()
})
// ----------------------------------------------
const closeFile = document.getElementById("close_file")
// кнопка удалить (обновляет страницу)
// ----------------------------------------------
closeFile.addEventListener("click", () => {
    location.reload()
})
// ----------------------------------------------


// ======== 1. ВЫБОР ФАЙЛА ========
selectFileBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0];
    if (!file) return;
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
        maxSizeText.style.color = "red";
        fileCard.style.display = "none";
        selectFileBtn.style.backgroundColor = "#FF0606";
        selectedFile = null;
        convertedFileUrl = null;
    } else {
        maxSizeText.style.color = "#888";
        selectFileBtn.style.backgroundColor = "green";
        fileCard.style.display = "grid";
        fileNameEl.textContent = file.name.split('.').slice(0, -1).join('.');
        fileTypeEl.textContent = file.type.split('/').pop().toUpperCase();
        fileSizeEl.textContent = (file.size / 1024 / 1024).toFixed(2) + " MB";
        downloadBtn.disabled = true;
        selectedFile = file;
        convertedFileUrl = null;
        console.log("📁 Файл выбран:", file.name);
    }
});

// ======== 2. ВЫБОР ФОРМАТА И КОНВЕРТАЦИЯ ========
convertBtn.addEventListener("click", async () => {
    if (!selectedFile) {
        alert("Сначала выберите файл!");
        return;
    }

    if (isConverting) {
        alert("Конвертация уже выполняется! Пожалуйста, подождите.");
        return;
    }

    // Теперь можно безопасно обращаться к selectedFile.type
    const type = selectedFile.type.toLowerCase();
    let formats = [];

    if (type.includes("zip") || type.includes("rar") || type.includes("7z")) {
        formats = ["ZIP", "RAR", "7Z"];
    } else if (type.includes("pdf") || type.includes("word")) {
        formats = ["PDF", "DOC", "DOCX", "TXT"];
    } else if (type.includes("image")) {
        formats = ["JPG", "PNG", "GIF", "WEBP", "BMP"];
    } else if (type.includes("video")) {
        formats = ["MP4", "AVI", "MKV", "MOV", "WEBM"];
    } else if (type.includes("audio")) {
        formats = ["MP3", "WAV", "AAC", "OGG"];
    } else if (type.includes("text")) {
        formats = ["TXT", "PDF", "DOC", "DOCX"];
    } else {
        alert("Не поддерживаемый формат!");
        return;
    }

    const choice = prompt("Выберите формат конвертации:\n" + formats.join(", "))
    if (!choice || !formats.includes(choice.toUpperCase())) return alert("Не поддерживаемый формат!")

    convertBtn.textContent = `Convert to ${choice.toUpperCase()}`
    await startConversion(selectedFile, choice)
})


// ======== 4. ИМИТАЦИЯ КОНВЕРТАЦИИ (БЕЗ API) ========
async function startConversion(file, format) {
    const start = new Date().getTime(); // Получаем текущее время в мс
    if (isConverting) {
        alert("Конвертация уже выполняется!");
        return;
    }
    isConverting = true;
    convertBtn.disabled = true;
    try {
        convertBtn.style.backgroundColor = "#FFA500"
        console.log("🔄 ДЕМО: Начинаем конвертацию:", file.name, "→", format);
        // ШАГ 1: Имитируем создание задания
        console.log("📝 Шаг 1/4: Создание задания...");
        await sleep(800);
        console.log("✅ Job создан с ID: demo-job-12345");
        // ШАГ 2: Имитируем загрузку файла
        console.log("📤 Шаг 2/4: Загрузка файла на сервер...");
        await sleep(1200);
        console.log("✅ Файл загружен успешно");
        // ШАГ 3: Имитируем процесс конвертации
        console.log("⚙️ Шаг 3/4: Конвертация файла...");
        // Имитируем проверку статуса (4 попытки)
        for (let i = 1; i <= 4; i++) {
            console.log(`⏳ Попытка ${i}/4... Статус: processing`);
            await sleep(800);
        }
        console.log("✅ Конвертация завершена");
        // ШАГ 4: Имитируем получение результата
        console.log("📥 Шаг 4/4: Получение ссылки на файл...");
        await sleep(400);
        // Создаем демо-URL
        const originalName = file.name.split(".")[0];
        convertedFileUrl = createDemoFile(file, format);
        
        console.log("🎉 Конвертация успешно завершена!");
        // Ждем пока анимация закончится (зеленый фон)
        await sleep(1000);
        // Обновляем интерфейс
        convertBtn.style.backgroundColor = "green";
        convertBtn.disabled = false;
        downloadBtn.disabled = false;
    } catch (err) {
        convertBtn.disabled = false;
        alert("❌ Ошибка: " + err.message);
        console.error("Ошибка:", err);
    } finally {
        const end = new Date().getTime(); // Получаем время снова
        console.log(`Время выполнения: ${end - start} мс`);
        isConverting = false;
    }
}

// ======== 5. СОЗДАНИЕ ДЕМО-ФАЙЛА ========
function createDemoFile(originalFile, format) {
    // Создаем текстовый файл с демо-данными
    const demoContent = `
===========================================
    ДЕМО-КОНВЕРТАЦИЯ
===========================================

Исходный файл: ${originalFile.name}
Размер: ${(originalFile.size / 1024 / 1024).toFixed(2)} MB
Тип: ${originalFile.type}

Конвертирован в: ${format.toUpperCase()}
Дата: ${new Date().toLocaleString('ru-RU')}

-------------------------------------------
ℹ️ Это демо-версия без реального API
-------------------------------------------

В настоящей версии с CloudConvert API:
✓ Файл будет реально конвертирован
✓ Вы получите рабочий файл в новом формате
✓ Поддерживаются все популярные форматы
✓ Качество конвертации профессиональное

Для использования реальной конвертации:
1. Получите API ключ на cloudconvert.com
2. Замените код в script.js
3. Наслаждайтесь работой!

===========================================
`;

    // Создаем Blob с демо-содержимым
    const blob = new Blob([demoContent], { type: 'text/plain' });
    return URL.createObjectURL(blob);
}


// ======== 6. СКАЧИВАНИЕ ФАЙЛА ========
downloadBtn.addEventListener("click", () => {
    if (convertedFileUrl) {
        console.log("💾 Скачивание файла...");
        
        const a = document.createElement("a");
        a.href = convertedFileUrl;
        
        // Создаем имя файла
        const originalName = selectedFile.name.split(".")[0];
        const format = convertBtn.textContent.replace("Convert to ", "").toLowerCase();
        a.download = `${originalName}_converted_DEMO.${format}`;
        
        a.click();
        
        downloadBtn.style.backgroundColor = "green";
        console.log("✅ Файл скачан!");
    } else {
        alert("❌ Файл ещё не конвертирован!");
    }
});


// ======== ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ========
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


// ======== ИНФОРМАЦИЯ ПРИ ЗАГРУЗКЕ ========
console.log(`
╔════════════════════════════════════════╗
║   CLOUDCONVERT - ДЕМО ВЕРСИЯ           ║
╚════════════════════════════════════════╝

⚠️ Это демонстрационная версия БЕЗ API

Что работает:
✅ Выбор файла
✅ Проверка размера
✅ Анимация прогресса
✅ Имитация конвертации
✅ Скачивание демо-файла

Инструкция:
1. Выберите файл из вашего компьютера
2. Нажмите "Convert to"
3. Выберите формат
4. Дождитесь "конвертации"
5. Скачайте демо-файл
`);