import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader, TextLoader, Docx2txtLoader
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
import glob

load_dotenv()

class RAGEngine:
    def __init__(self):
        self.embeddings = OpenAIEmbeddings()
        self.vector_store_path = "faiss_index"
        self.vector_store = None
        self.memory = ConversationBufferMemory(
            memory_key="chat_history", 
            return_messages=True
        )
        self._load_vector_store()

    def _load_vector_store(self):
        if os.path.exists(self.vector_store_path):
            self.vector_store = FAISS.load_local(
                self.vector_store_path, 
                self.embeddings,
                allow_dangerous_deserialization=True
            )
        else:
            self.vector_store = None

    def process_file(self, file_path):
        """Process a PDF or TXT file and add it to the vector store."""
        if file_path.endswith(".pdf"):
            loader = PyPDFLoader(file_path)
        elif file_path.endswith(".docx"):
            loader = Docx2txtLoader(file_path)
        elif file_path.endswith(".txt"):
            loader = TextLoader(file_path)
        else:
            return False

        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        texts = text_splitter.split_documents(documents)

        if self.vector_store is None:
            self.vector_store = FAISS.from_documents(texts, self.embeddings)
        else:
            self.vector_store.add_documents(texts)
        
        self.vector_store.save_local(self.vector_store_path)
        return True

    def query(self, question):
        """Query the vector store for an answer."""
        if self.vector_store is None:
            return "No documents uploaded yet. Please ask the CEO to upload some documents."
        
        llm = ChatOpenAI(model_name="gpt-4o", temperature=0)
        qa_chain = ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=self.vector_store.as_retriever(),
            memory=self.memory
        )
        
        response = qa_chain.invoke({"question": question})
        return response["answer"]

    def list_files(self, upload_dir):
        """List files in the upload directory."""
        return [os.path.basename(f) for f in glob.glob(os.path.join(upload_dir, "*"))]

# Singleton instance
rag_engine = RAGEngine()
