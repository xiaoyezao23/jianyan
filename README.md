# jianyan (检验)
Laboratory Document Search System

A web-based application for uploading, indexing, and searching laboratory documents.

## Features

- 📤 **Document Upload**: Upload laboratory documents in multiple formats (TXT, PDF, DOC, DOCX)
- 🔍 **Full-Text Search**: Search through document content using powerful indexing
- 📁 **Document Management**: View all uploaded documents with timestamps
- 🎨 **Modern UI**: Clean and intuitive web interface
- ⚡ **Fast Search**: Uses Whoosh search engine for quick results

## Installation

### Prerequisites

- Python 3.7 or higher
- pip package manager

### Setup

1. Clone the repository:
```bash
git clone https://github.com/xiaoyezao23/jianyan.git
cd jianyan
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

1. Start the application:
```bash
python app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

3. Use the web interface to:
   - Upload laboratory documents
   - Search through uploaded documents
   - View all indexed documents

## Project Structure

```
jianyan/
├── app.py              # Main Flask application
├── search_engine.py    # Search and indexing logic
├── requirements.txt    # Python dependencies
├── templates/
│   └── index.html     # Web interface
├── uploads/           # Uploaded documents (created at runtime)
└── index_dir/         # Search index (created at runtime)
```

## API Endpoints

- `GET /` - Main web interface
- `POST /upload` - Upload a document
- `GET /search?q=<query>` - Search documents
- `GET /documents` - List all indexed documents

## Supported File Types

- Plain text files (.txt)
- PDF documents (.pdf)
- Microsoft Word documents (.doc, .docx)

## Technical Details

- **Backend**: Flask (Python web framework)
- **Search Engine**: Whoosh (pure Python search library)
- **Document Parsing**: PyPDF2 (PDF), python-docx (Word)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript

## Development

The application runs in debug mode by default. For production deployment, disable debug mode and configure a production WSGI server.

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
