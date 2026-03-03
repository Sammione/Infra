const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? "http://localhost:8000"
    : "https://your-render-backend-url.onrender.com"; // Replace with actual Render URL after deployment

const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const btnText = document.getElementById('btnText');
const loader = document.getElementById('loader');

// CEO specific elements (might be null on user page)
const fileInput = document.getElementById('fileInput');
const uploadZone = document.getElementById('uploadZone');
const fileList = document.getElementById('fileList');
const uploadStatus = document.getElementById('uploadStatus');

// Add message to chat UI
function addMessage(text, role) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;

    const avatar = role === 'ai' ? 'AI' : 'ME';

    msgDiv.innerHTML = `
        <div class="avatar">${avatar}</div>
        <div class="content">${text}</div>
    `;

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Auto-expand textarea
userInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Send question to AI
async function askAI() {
    const question = userInput.value.trim();
    if (!question) return;

    addMessage(question, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';

    // Show loading
    sendBtn.disabled = true;
    loader.style.display = 'block';
    const originalIcon = sendBtn.querySelector('svg');
    if (originalIcon) originalIcon.style.display = 'none';

    try {
        const formData = new FormData();
        formData.append('question', question);

        const response = await fetch(`${API_URL}/query`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        addMessage(data.answer, 'ai');
    } catch (error) {
        addMessage("Sorry, I encountered an error. Is the backend running?", 'ai');
        console.error(error);
    } finally {
        sendBtn.disabled = false;
        loader.style.display = 'none';
        if (originalIcon) originalIcon.style.display = 'block';
    }
}

// Upload file (CEO only)
async function uploadFile(file) {
    if (!uploadStatus) return;

    uploadStatus.textContent = `Uploading ${file.name}...`;
    uploadStatus.style.color = '#818cf8';

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        if (data.status === 'success') {
            uploadStatus.textContent = `Successfully processed ${file.name}`;
            uploadStatus.style.color = '#4ade80';
            loadFileList();
        }
    } catch (error) {
        uploadStatus.textContent = "Error uploading file.";
        uploadStatus.style.color = '#f87171';
        console.error(error);
    }
}

// List files (CEO only)
async function loadFileList() {
    if (!fileList) return;

    try {
        const response = await fetch(`${API_URL}/files`);
        const data = await response.json();

        fileList.innerHTML = '';
        data.files.forEach(filename => {
            const li = document.createElement('li');
            li.className = 'file-item';
            li.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                ${filename}
            `;
            fileList.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading file list", error);
    }
}

// Event Listeners
sendBtn.addEventListener('click', askAI);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') askAI();
});

if (uploadZone) {
    uploadZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            uploadFile(e.target.files[0]);
        }
    });

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = '#6366f1';
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        if (e.dataTransfer.files.length > 0) {
            uploadFile(e.dataTransfer.files[0]);
        }
    });

    // Initial load
    loadFileList();
}
