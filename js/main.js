let questions = [];

async function loadQuestions() {
    try {
        const response = await fetch('data/exercises.json');
        questions = await response.json();
        renderQuestions();
        loadSavedCodes();
        attachAutoSave();
    } catch (error) {
        console.error("Lỗi khi tải danh sách bài tập:", error);
    }
}

function renderQuestions() {
    const questionsList = document.getElementById("questions-list");
    questionsList.innerHTML = ""; // Xóa nội dung cũ nếu có
    questions.forEach((q, index) => {
        const card = document.createElement("div");
        card.className = "card p-3 question-card";
        card.innerHTML = `
            <div class="question-title" onclick="toggleContent(${index})">
                🔹 ${q.title}
            </div>
            <div class="question-content" id="content-${index}">
                <p><strong>Mô tả:</strong> ${q.description}</p>
                <p><strong>Hàm cần triển khai:</strong></p>
                <pre>${q.function}</pre>
                <p><strong>Ví dụ:</strong></p>
                <pre>${q.example}</pre>

                <p><strong>Viết Code:</strong></p>
                <textarea class="code-editor" id="code-${index}" placeholder="Nhập code tại đây..."></textarea>
                <button class="btn btn-primary run-button" onclick="runPython(${index})">Chạy Code</button>
                <pre id="output-${index}" class="mt-2"></pre>
            </div>
        `;
        questionsList.appendChild(card);
    });
}

function toggleContent(index) {
    const content = document.getElementById(`content-${index}`);
    content.style.display = content.style.display === "none" ? "block" : "none";
}

// Lưu code vào localStorage
function saveCode(index) {
    const code = document.getElementById(`code-${index}`).value;
    localStorage.setItem(`exercise_code_${index}`, code);
}

// Tải code đã lưu từ localStorage
function loadSavedCodes() {
    questions.forEach((_, index) => {
        const savedCode = localStorage.getItem(`exercise_code_${index}`);
        if (savedCode) {
            document.getElementById(`code-${index}`).value = savedCode;
        }
    });
}

// Gắn sự kiện tự động lưu khi nhập code
function attachAutoSave() {
    questions.forEach((_, index) => {
        const textarea = document.getElementById(`code-${index}`);
        textarea.addEventListener("input", () => saveCode(index));
    });
}

// Tải tất cả code xuống dưới dạng file ZIP
async function downloadAllCodes() {
    const zip = new JSZip();
    let hasCode = false;

    questions.forEach((q, index) => {
        const code = document.getElementById(`code-${index}`).value.trim();
        if (code) {
            zip.file(`bai${index + 1}.py`, code);
            hasCode = true;
        }
    });

    if (!hasCode) {
        alert("⚠️ Không có đoạn code nào để tải xuống!");
        return;
    }

    const zipFilename = prompt("Nhập tên của bạn:", "baitap_python.zip");
    if (!zipFilename) return;

    zip.generateAsync({ type: "blob" }).then((content) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = zipFilename.endsWith(".zip") ? zipFilename : zipFilename + ".zip";
        link.click();
    });
}

document.addEventListener("DOMContentLoaded", loadQuestions);
