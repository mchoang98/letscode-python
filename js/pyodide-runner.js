async function runPython(index) {
    const code = document.getElementById(`code-${index}`).value;
    const outputElement = document.getElementById(`output-${index}`);

    if (code.trim() === "") {
        outputElement.innerText = "⚠️ Vui lòng nhập code!";
        return;
    }

    outputElement.innerText = "⏳ Đang chạy code...";
    console.log("📜 Code nhập vào:", code);

    try {
        if (!window.pyodide) {
            window.pyodide = await loadPyodide();
        }

        window.pyodide.runPython(`
            import sys
            from io import StringIO
            sys.stdout = StringIO()
        `);

        await window.pyodide.runPythonAsync(code);

        const result = window.pyodide.runPython("sys.stdout.getvalue()");
        console.log("📢 Kết quả:", result);
        outputElement.innerText = `✅ Kết quả:\n${result}`;
    } catch (error) {
        outputElement.innerText = `❌ Lỗi:\n${error.message}`;
    }
}
