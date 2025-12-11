// элементы из index.html

// кнопка Select File
const selectFileBtn = document.getElementById("selected_file")
// кнопка ввести файл (или загрузить)
const fileInput = document.getElementById("file_input")
// текст
const maxSizeText = document.querySelector(".max-size")
// карточка с инфой о файле
const fileCard = document.querySelector(".file-card")
// информация о файле
const fileNameEl = document.getElementById("file_name")
const fileTypeEl = document.getElementById("type")
const fileSizeEl = document.getElementById("size")
// кнопка Convert to...
const convertBtn = document.getElementById("convert_btn")
// кнопка Download
const downloadBtn = document.getElementById("download_btn")

// флажки для определения статуса о файле и кновертайции
let selectedFile = null
let convertedFileUrl = null
let isConverting = false

const apiKey = "apiKey"
const URL = "https://api.cloudconvert.com/v2/jobs"

// кнопка заменить файл (пока что с логикей не проверял, работает как Select File)
const refreshFile = document.getElementById("refresh_file")
refreshFile.addEventListener("click", () => {
    fileInput.click()
})
// кнопка удалить (просто обновляет страницу, доконца не реализовал)
const closeFile = document.getElementById("close_file")
closeFile.addEventListener("click", () => {
    location.reload()
})
// кнопка выбора файла
selectFileBtn.addEventListener("click", () => {
    fileInput.click()
})

fileInput.addEventListener("change", () => {
    const file = fileInput.files[0]
    // Если пользователь ничего не выбрал или нажал 'отмена' выходим
    if (!file) return
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
        maxSizeText.style.color = "red"
        selectFileBtn.style.backgroundColor = "#FF0606"
        selectedFile = null
        convertedFileUrl = null
    } else {
        maxSizeText.style.color = "#888"
        selectFileBtn.style.backgroundColor = "green"
        fileCard.style.display = "grid"
        fileNameEl.textContent = file.name.split('.').slice(0, -1).join('.')
        fileTypeEl.textContent = file.type.split('/').pop().toUpperCase()
        fileSizeEl.textContent = (file.size / 1024 / 1024).toFixed(2) + " MB"

        downloadBtn.disabled = true
        selectedFile = file
        convertedFileUrl = null
    }
})

convertBtn.addEventListener("click", async () => {
    if (!selectedFile) {
        alert("Сначала выберите файл!");
        return
    }

    if (isConverting) {
        alert("Конвертация уже выполняется! Пожалуйста, подождите.")
        return
    }

    const type = selectedFile.type.toLowerCase()
    let formats = []

    if (type.includes("zip") || type.includes("rar")) {
        formats = ["ZIP", "RAR"]
    } else if (type.includes("pdf") || type.includes("word")) {
        formats = ["PDF", "DOC", "DOCX", "TXT"]
    } else if (type.includes("image")) {
        formats = ["JPG", "PNG", "GIF", "WEBP", "BMP"]
    } else if (type.includes("video")) {
        formats = ["MP4", "AVI", "MKV", "MOV", "WEBM"]
    } else if (type.includes("audio")) {
        formats = ["MP3", "WAV", "AAC", "OGG"]
    } else if (type.includes("text")) {
        formats = ["TXT", "PDF", "DOC", "DOCX"]
    } else {
        alert("Не поддерживаемый формат!")
        return
    }

    const choice = prompt("Выберите формат конвертации:\n" + formats.join(", "))
    if (!choice || !formats.includes(choice.toUpperCase())) return alert("Не поддерживаемый формат!")

    convertBtn.textContent = `Convert to ${choice.toUpperCase()}`
    await startConversion(selectedFile, choice)
})


async function startConversion(file, outputFormat) {
    const start = new Date().getTime(); // Получаем текущее время в мс
    isConverting = true
    convertBtn.style.backgroundColor = "#FFA500"
    // Создаём job
    const jobResp = await fetch(URL, {
        method: "POST",
        headers: {"Authorization": `Bearer ${apiKey}`,"Content-Type": "application/json"},
        body: JSON.stringify({
            tasks: {
                "upload": { operation: "import/upload" },
                "convert": { operation: "convert",input: "upload",output_format: outputFormat.toLowerCase()},
                "export": {operation: "export/url",input: "convert"}
            }
        })
    })
    const job = await jobResp.json()
    // Upload
    const uploadTask = job.data.tasks.find(t => t.name === "upload")
    const fd = new FormData()
    for (const key in uploadTask.result.form.parameters) {
        fd.append(key, uploadTask.result.form.parameters[key])
    }
    fd.append("file", file)
    await fetch(uploadTask.result.form.url, { method: "POST", body: fd })
    // Export
    let exportTask
    while (true) {
        const resp = await fetch(`${URL}/${job.data.id}`, {
            headers: { "Authorization": `Bearer ${apiKey}` }
        })
        const updatedJob = await resp.json()
        exportTask = updatedJob.data.tasks.find(t => t.name === "export")
        if (exportTask.result && exportTask.result.files && exportTask.result.files.length > 0) break
        // повторяет проверку каждые 2 секунды
        await new Promise(r => setTimeout(r, 2000))
    }
    const end = new Date().getTime(); // Получаем время снова
    console.log(`Время выполнения: ${end - start} мс`);
    // флажки успешной конвертации
    convertedFileUrl = exportTask.result.files[0].url
    isConverting = false
    convertBtn.style.backgroundColor = "green"
    downloadBtn.disabled = false

    return convertedFileUrl
}

downloadBtn.addEventListener("click", () => {
    if (!convertedFileUrl) {
        alert("Файл ещё не конвертирован!")
        return
    }
    const a = document.createElement("a")
    a.href = convertedFileUrl
    a.download = selectedFile.name
    a.click()
    downloadBtn.style.backgroundColor = "green"
})