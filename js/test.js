    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
    import { getDatabase, ref, push } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

    // Cấu hình Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyCvBcYEiOvMvwUy019dTfZgsRE6m6sXUHo",
        authDomain: "letscode-python.firebaseapp.com",
        databaseURL: "https://letscode-python-default-rtdb.firebaseio.com/",
        projectId: "letscode-python",
        storageBucket: "letscode-python.appspot.com",
        messagingSenderId: "561600227551",
        appId: "1:561600227551:web:28002a8b937f785834e16a"
    };

    // Khởi tạo Firebase
    const app = initializeApp(firebaseConfig);
    const database = getDatabase(app);

    // Load câu hỏi từ JSON
    async function loadQuestions() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const date = urlParams.get('date');
            const response = await fetch(`exam_data/${date}.json`);
            if (!response.ok) throw new Error("Không thể tải file JSON");
            const questions = await response.json();

            const quizContainer = document.getElementById("questions");
            quizContainer.innerHTML = ""; // Xóa nội dung cũ (nếu có)

            questions.forEach((item, index) => {
                const div = document.createElement("div");
                div.classList.add("p-4", "bg-gray-100", "rounded-lg", "mb-4", "shadow-md");

                div.innerHTML = `
                    <p class='font-bold text-lg mb-2'>${index + 1}. ${item.q}</p>
                    ${item.code ? `<pre class="bg-gray-200 p-3 rounded">${item.code}</pre>` : ""}
                    <div class="options space-y-2"></div>
                    <p class="hidden correct-answer text-green-600 font-semibold mt-2">✅ Đáp án đúng: <span>${item.answer}</span></p>
                `;

                const optionsContainer = div.querySelector(".options");
                item.options.forEach(option => {
                    const label = document.createElement("label");
                    label.classList.add("block", "my-1", "p-2", "bg-white", "rounded", "border", "cursor-pointer", "hover:bg-gray-50");

                    label.innerHTML = `<input type="radio" name="q${index}" value="${option}" class="mr-2"> ${option}`;
                    optionsContainer.appendChild(label);
                });

                quizContainer.appendChild(div);
            });
        } catch (error) {
            console.error("Lỗi tải câu hỏi:", error);
            document.getElementById("questions").innerHTML = "<p class='text-red-500'>Lỗi tải câu hỏi.</p>";
        }
    }

    // Nộp bài và chấm điểm
    document.addEventListener("DOMContentLoaded", () => {
        loadQuestions();

        document.getElementById("quizForm").addEventListener("submit", async function (e) {
            e.preventDefault();

            const userName = document.getElementById("username").value.trim();
            if (!userName) {
                alert("Vui lòng nhập tên của bạn trước khi làm bài!");
                return;
            }

            let score = 0;
            let results = {};

            document.querySelectorAll("input[type='radio']:checked").forEach(input => {
                results[input.name] = input.value;
            });

            try {
                const urlParams = new URLSearchParams(window.location.search);
                const date = urlParams.get('date');
                const response = await fetch(`exam_data/${date}.json`); // Đổi thành "data/exam_data/09_03_25.json" nếu cần
                const questions = await response.json();

                questions.forEach((item, index) => {
                    const selectedAnswer = results[`q${index}`];
                    const correctAnswer = item.answer;
                    const answerElement = document.querySelectorAll(".correct-answer")[index];

                    if (selectedAnswer === correctAnswer) {
                        score++;
                        answerElement.classList.add("text-green-600");
                    } else {
                        answerElement.classList.add("text-red-600");
                    }

                    answerElement.classList.remove("hidden");
                });

                const userResult = {
                    username: userName,
                    timestamp: new Date().toISOString(),
                    score: score,
                    answers: results
                };

                // Lưu kết quả lên Firebase
                await push(ref(database, "quiz_results"), userResult);
                document.getElementById("result").innerHTML = `<p class="text-green-600 font-semibold">Bạn đã trả lời đúng ${score}/${questions.length} câu.</p>`;
            } catch (error) {
                console.error("Lỗi khi xử lý bài làm:", error);
                document.getElementById("result").innerHTML = "<p class='text-red-500'>Lỗi khi chấm bài.</p>";
            }
        });
    });
