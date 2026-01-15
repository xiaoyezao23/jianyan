"""
Unit tests for the Laboratory Document Search application
"""

import unittest
import os
import tempfile
import shutil
from search_engine import SearchEngine


class TestSearchEngine(unittest.TestCase):
    """Test cases for SearchEngine class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.test_dir = tempfile.mkdtemp()
        self.index_dir = os.path.join(self.test_dir, 'test_index')
        self.engine = SearchEngine(index_dir=self.index_dir)
    
    def tearDown(self):
        """Clean up test fixtures"""
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)
    
    def test_extract_text_from_txt(self):
        """Test text extraction from .txt file"""
        # Create a test text file
        test_file = os.path.join(self.test_dir, 'test.txt')
        test_content = "This is a test laboratory document."
        with open(test_file, 'w') as f:
            f.write(test_content)
        
        extracted = self.engine.extract_text(test_file)
        self.assertEqual(extracted, test_content)
    
    def test_index_document(self):
        """Test document indexing"""
        # Create a test text file
        test_file = os.path.join(self.test_dir, 'test.txt')
        test_content = "Laboratory test results for sample 123."
        with open(test_file, 'w') as f:
            f.write(test_content)
        
        # Index the document
        self.engine.index_document(test_file, 'test.txt')
        
        # Verify it was indexed
        documents = self.engine.list_all_documents()
        self.assertEqual(len(documents), 1)
        self.assertEqual(documents[0]['filename'], 'test.txt')
    
    def test_search(self):
        """Test search functionality"""
        # Create and index test documents
        test_file1 = os.path.join(self.test_dir, 'test1.txt')
        with open(test_file1, 'w') as f:
            f.write("Laboratory blood test results.")
        
        test_file2 = os.path.join(self.test_dir, 'test2.txt')
        with open(test_file2, 'w') as f:
            f.write("Urine analysis report.")
        
        self.engine.index_document(test_file1, 'test1.txt')
        self.engine.index_document(test_file2, 'test2.txt')
        
        # Search for "blood"
        results = self.engine.search('blood')
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['filename'], 'test1.txt')
        
        # Search for "analysis"
        results = self.engine.search('analysis')
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['filename'], 'test2.txt')
    
    def test_list_all_documents(self):
        """Test listing all documents"""
        # Initially should be empty
        documents = self.engine.list_all_documents()
        self.assertEqual(len(documents), 0)
        
        # Add documents
        test_file1 = os.path.join(self.test_dir, 'test1.txt')
        with open(test_file1, 'w') as f:
            f.write("Document 1")
        
        test_file2 = os.path.join(self.test_dir, 'test2.txt')
        with open(test_file2, 'w') as f:
            f.write("Document 2")
        
        self.engine.index_document(test_file1, 'test1.txt')
        self.engine.index_document(test_file2, 'test2.txt')
        
        # Should now have 2 documents
        documents = self.engine.list_all_documents()
        self.assertEqual(len(documents), 2)
    
    def test_extract_text_unknown_format(self):
        """Test extraction from unsupported file format"""
        test_file = os.path.join(self.test_dir, 'test.xyz')
        with open(test_file, 'w') as f:
            f.write("Some content")
        
        extracted = self.engine.extract_text(test_file)
        self.assertEqual(extracted, '')


if __name__ == '__main__':
    unittest.main()
