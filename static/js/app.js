// Global variables
let uploadedFiles = [];
let sessionId = generateSessionId();

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupFileUpload();
    loadDocuments();
    setupChatInterface();
}

// Session management
function generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// File upload functionality
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // Drag and drop events
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Click to upload
    uploadArea.addEventListener('click', () => fileInput.click());
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    processFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    processFiles(files);
}

async function processFiles(files) {
    const formData = new FormData();
    
    for (let file of files) {
        if (isValidFileType(file)) {
            formData.append('files', file);
        } else {
            showNotification(`Invalid file type: ${file.name}`, 'error');
        }
    }
    
    if (formData.has('files')) {
        showLoading(true);
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showNotification(result.message, 'success');
                loadDocuments();
            } else {
                showNotification(result.detail || 'Upload failed', 'error');
            }
        } catch (error) {
            showNotification('Upload failed: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }
}

function isValidFileType(file) {
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const validExtensions = ['.pdf', '.docx', '.txt'];
    return validTypes.includes(file.type) || validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
}

// Document management
async function loadDocuments() {
    try {
        const response = await fetch('/api/documents');
        const result = await response.json();
        
        if (response.ok) {
            displayDocuments(result.documents);
        } else {
            console.error('Failed to load documents:', result.detail);
        }
    } catch (error) {
        console.error('Error loading documents:', error);
    }
}

function displayDocuments(documents) {
    const documentsContainer = document.getElementById('documents');
    
    if (documents.length === 0) {
        documentsContainer.innerHTML = `
            <div class="no-documents">
                <i class="fas fa-file"></i>
                <p>No documents uploaded yet</p>
            </div>
        `;
        document.getElementById('chatInterface').style.display = 'none';
    } else {
        documentsContainer.innerHTML = documents.map(doc => `
            <div class="document-item">
                <div class="document-icon ${doc.type.toLowerCase()}">
                    <i class="fas fa-file-${getFileIcon(doc.type)}"></i>
                </div>
                <div class="document-info">
                    <div class="document-name">${doc.name}</div>
                    <div class="document-size">${formatFileSize(doc.size)}</div>
                </div>
            </div>
        `).join('');
        
        document.getElementById('chatInterface').style.display = 'block';
    }
}

function getFileIcon(type) {
    switch (type.toLowerCase()) {
        case 'pdf': return 'pdf';
        case 'docx': return 'word';
        default: return 'alt';
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Document indexing
async function indexDocuments() {
    showLoading(true);
    try {
        const response = await fetch('/api/index', {
            method: 'POST'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification(result.message, 'success');
        } else {
            showNotification(result.detail || 'Indexing failed', 'error');
        }
    } catch (error) {
        showNotification('Indexing failed: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function clearDocuments() {
    if (confirm('Are you sure you want to clear all documents? This action cannot be undone.')) {
        showLoading(true);
        try {
            // Note: You'll need to implement a clear endpoint in the backend
            showNotification('Documents cleared successfully', 'success');
            loadDocuments();
        } catch (error) {
            showNotification('Failed to clear documents: ' + error.message, 'error');
        } finally {
            showLoading(false);
        }
    }
}

// Chat functionality
function setupChatInterface() {
    const messageInput = document.getElementById('messageInput');
    messageInput.addEventListener('keypress', handleKeyPress);
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) return;
    
    // Clear input
    messageInput.value = '';
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Show typing indicator
    const typingId = addTypingIndicator();
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                session_id: sessionId
            })
        });
        
        const result = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        if (response.ok) {
            // Add assistant response to chat
            addMessageToChat('assistant', result.answer, result.sources);
        } else {
            addMessageToChat('assistant', 'Sorry, I encountered an error processing your request.', []);
        }
    } catch (error) {
        removeTypingIndicator(typingId);
        addMessageToChat('assistant', 'Sorry, I encountered an error processing your request.', []);
    }
}

function addMessageToChat(sender, content, sources = []) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-bubble ' + sender;
    
    const avatarClass = sender === 'user' ? 'user' : 'assistant';
    const avatarIcon = sender === 'user' ? 'fas fa-user' : 'fas fa-robot';
    
    let sourcesHtml = '';
    if (sources && sources.length > 0) {
        sourcesHtml = `
            <div class="message-sources">
                <strong>Sources:</strong>
                ${sources.map(source => `
                    <div class="source-item">
                        <div class="source-title">${source.source}</div>
                        <div class="source-content">${source.content}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    messageDiv.innerHTML = `
        <div class="message-avatar ${avatarClass}">
            <i class="${avatarIcon}"></i>
        </div>
        <div class="message-content">
            ${content}
            ${sourcesHtml}
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    const typingId = 'typing_' + Date.now();
    typingDiv.id = typingId;
    typingDiv.className = 'message-bubble assistant';
    
    typingDiv.innerHTML = `
        <div class="message-avatar assistant">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return typingId;
}

function removeTypingIndicator(typingId) {
    const typingElement = document.getElementById(typingId);
    if (typingElement) {
        typingElement.remove();
    }
}

async function clearChat() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        try {
            const response = await fetch('/api/chat/history', {
                method: 'DELETE'
            });
            
            if (response.ok) {
                document.getElementById('chatMessages').innerHTML = `
                    <div class="welcome-message">
                        <i class="fas fa-robot"></i>
                        <h3>Ready to Answer Your Questions!</h3>
                        <p>Ask me anything about your uploaded documents. I'll provide accurate answers with source citations.</p>
                    </div>
                `;
                showNotification('Chat history cleared', 'success');
            }
        } catch (error) {
            showNotification('Failed to clear chat history', 'error');
        }
    }
}

// UI utilities
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#28a745';
        case 'error': return '#dc3545';
        case 'warning': return '#ffc107';
        default: return '#17a2b8';
    }
}

// Navigation functions
function scrollToChat() {
    document.getElementById('chat').scrollIntoView({ behavior: 'smooth' });
}

function scrollToFeatures() {
    document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .typing-indicator {
        display: flex;
        gap: 4px;
        align-items: center;
    }
    
    .typing-indicator span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #666;
        animation: typing 1.4s infinite ease-in-out;
    }
    
    .typing-indicator span:nth-child(1) {
        animation-delay: -0.32s;
    }
    
    .typing-indicator span:nth-child(2) {
        animation-delay: -0.16s;
    }
    
    @keyframes typing {
        0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);
