"""
Search Engine Module
Handles document indexing and searching using Whoosh
"""

import os
from whoosh import index
from whoosh.fields import Schema, TEXT, ID, DATETIME
from whoosh.qparser import QueryParser, MultifieldParser
from whoosh.writing import AsyncWriter
from datetime import datetime
import PyPDF2
import docx


class SearchEngine:
    """Search engine for laboratory documents"""
    
    def __init__(self, index_dir='index_dir'):
        """Initialize search engine with index directory"""
        self.index_dir = index_dir
        
        # Define schema for document indexing
        self.schema = Schema(
            path=ID(stored=True, unique=True),
            filename=TEXT(stored=True),
            content=TEXT(stored=True),
            timestamp=DATETIME(stored=True)
        )
        
        # Create or open index
        if not os.path.exists(index_dir):
            os.makedirs(index_dir)
            self.ix = index.create_in(index_dir, self.schema)
        else:
            self.ix = index.open_dir(index_dir)
    
    def extract_text(self, filepath):
        """Extract text content from different file types"""
        _, ext = os.path.splitext(filepath)
        ext = ext.lower()
        
        try:
            if ext == '.txt':
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    return f.read()
            
            elif ext == '.pdf':
                text = []
                with open(filepath, 'rb') as f:
                    pdf_reader = PyPDF2.PdfReader(f)
                    for page in pdf_reader.pages:
                        text.append(page.extract_text())
                return '\n'.join(text)
            
            elif ext in ['.doc', '.docx']:
                doc = docx.Document(filepath)
                text = []
                for paragraph in doc.paragraphs:
                    text.append(paragraph.text)
                return '\n'.join(text)
            
            else:
                return ''
        
        except Exception as e:
            print(f"Error extracting text from {filepath}: {e}")
            return ''
    
    def index_document(self, filepath, filename):
        """Index a document"""
        content = self.extract_text(filepath)
        
        writer = AsyncWriter(self.ix)
        writer.update_document(
            path=filepath,
            filename=filename,
            content=content,
            timestamp=datetime.now()
        )
        writer.commit()
    
    def search(self, query_string, limit=10):
        """Search for documents matching query"""
        results = []
        
        with self.ix.searcher() as searcher:
            # Search in both filename and content
            parser = MultifieldParser(['filename', 'content'], schema=self.ix.schema)
            query = parser.parse(query_string)
            
            search_results = searcher.search(query, limit=limit)
            
            for hit in search_results:
                results.append({
                    'filename': hit['filename'],
                    'path': hit['path'],
                    'score': hit.score,
                    'highlight': hit.highlights('content', top=3)
                })
        
        return results
    
    def list_all_documents(self):
        """List all indexed documents"""
        documents = []
        
        with self.ix.searcher() as searcher:
            for doc in searcher.all_stored_fields():
                documents.append({
                    'filename': doc.get('filename'),
                    'path': doc.get('path'),
                    'timestamp': doc.get('timestamp').isoformat() if doc.get('timestamp') else None
                })
        
        return documents
