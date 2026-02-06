#  DocuMind AI - Professional Document Intelligence Platform

A modern, commercial-grade document intelligence platform that transforms your documents into intelligent insights using advanced AI technology.

##  Features

###  Professional Web Interface
- **Modern Design**: Beautiful, responsive interface that works on all devices
- **Drag & Drop Upload**: Intuitive file upload with support for PDF, DOCX, and TXT files
- **Real-time Chat**: Interactive Q&A interface with typing indicators
- **Source Citations**: Every answer includes references to source documents
- **Chat History**: Persistent conversation memory

###  Advanced AI Capabilities
- **Multi-Format Support**: Process PDF, DOCX, and TXT documents
- **Intelligent Search**: Natural language question answering
- **Context Awareness**: AI understands document context and relationships
- **High Accuracy**: Powered by Cohere's advanced language models
- **Fast Responses**: Optimized for speed and efficiency

###  Commercial Features
- **Professional UI**: Enterprise-grade user interface
- **API Access**: RESTful API for integration
- **Scalable Architecture**: Built with FastAPI for high performance
- **Security**: Secure document processing
- **Analytics Ready**: Built-in metrics and monitoring

##  Architecture

```
DocuMind AI/
├── backend/                 # FastAPI backend server
│   └── main.py             # Main API server
├── static/                 # Frontend assets
│   ├── index.html          # Main web page
│   ├── css/style.css       # Professional styling
│   └── js/app.js          # Interactive functionality
├── app/                    # Core RAG functionality
│   ├── config.py           # Configuration management
│   ├── document_loader.py  # Document processing
│   ├── embed_and_store.py  # Vector storage
│   ├── rag_chain.py        # AI chain management
│   └── memory.py           # Chat memory
├── data/                   # Document storage
├── vectorstore/            # FAISS vector database
├── run_website.py          # Easy startup script
├── requirements.txt        # Python dependencies
└── README.md              # This file
```

##  Quick Start

### Option 1: Easy Startup (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourname/documind-ai.git
cd documind-ai

# Run the startup script
python run_website.py
```

The script will:
-  Check your environment setup
-  Install all dependencies
-  Start the web server
-  Open your browser to http://localhost:8000

### Option 2: Manual Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Create environment file
echo "COHERE_API_KEY=your_api_key_here" > .env
echo "DATA_DIR=data" >> .env

# 3. Start the server
cd backend
python main.py
```

##  API Key Setup

1. **Get Cohere API Key**:
   - Visit [https://cohere.com/](https://cohere.com/)
   - Sign up for an account
   - Navigate to API Keys section
   - Create a new API key

2. **Configure Environment**:
   - Create a `.env` file in the project root
   - Add your API key:
     ```
     COHERE_API_KEY=your_actual_api_key_here
     DATA_DIR=data
     ```

##  Using the Web Interface

### 1. Upload Documents
- Drag and drop files or click to browse
- Supported formats: PDF, DOCX, TXT
- Multiple files can be uploaded at once

### 2. Index Documents
- Click "Index Documents" to process your files
- This creates searchable embeddings
- Required before asking questions

### 3. Ask Questions
- Type questions in natural language
- Get instant answers with source citations
- View chat history and manage conversations

##  API Endpoints

The platform provides a RESTful API:

- `POST /api/upload` - Upload documents
- `POST /api/index` - Index uploaded documents
- `POST /api/chat` - Send chat messages
- `GET /api/documents` - List uploaded documents
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/history` - Clear chat history

### API Documentation
Visit `http://localhost:8000/docs` for interactive API documentation.

##  Commercial Features

### Professional Design
- Modern, responsive interface
- Professional color scheme and typography
- Mobile-friendly design
- Loading states and animations

### Enterprise Ready
- RESTful API for integration
- Scalable FastAPI backend
- Secure document processing
- Error handling and validation

### User Experience
- Intuitive drag-and-drop interface
- Real-time feedback and notifications
- Chat history management
- Source citation display

##  Advanced Configuration

### Customizing the Interface
Edit `static/css/style.css` to customize:
- Colors and branding
- Layout and spacing
- Typography and fonts
- Responsive breakpoints

### API Customization
Modify `backend/main.py` to:
- Add new endpoints
- Implement authentication
- Add rate limiting
- Customize response formats

##  Development

### Local Development
```bash
# Install development dependencies
pip install -r requirements.txt

# Start development server with auto-reload
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Adding New Features
1. **Backend**: Add endpoints in `backend/main.py`
2. **Frontend**: Update `static/js/app.js` for new functionality
3. **Styling**: Modify `static/css/style.css` for UI changes
4. **Testing**: Use the API documentation at `/docs`

##  Performance

- **Fast Response Times**: Typically 2-3 seconds per query
- **Scalable**: Built on FastAPI for high concurrency
- **Memory Efficient**: Optimized document processing
- **Caching**: Intelligent vector storage caching

##  Security

- **API Key Protection**: Secure environment variable handling
- **File Validation**: Strict file type and size validation
- **CORS Configuration**: Proper cross-origin resource sharing
- **Input Sanitization**: Protection against malicious inputs

##  Monitoring

The platform includes built-in monitoring:
- Health check endpoint (`/api/health`)
- Request logging and error tracking
- Performance metrics collection
- User interaction analytics

##  Deployment

### Production Deployment
```bash
# Install production server
pip install gunicorn

# Start production server
cd backend
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Docker Deployment
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "backend/main.py"]
```


##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built using FastAPI, Cohere AI, and modern web technologies.**