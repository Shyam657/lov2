
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import uuid
import tempfile
import json
from werkzeug.utils import secure_filename

# Import LangChain components
from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_together import ChatTogether, TogetherEmbeddings
from langchain_core.messages import HumanMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.schema.runnable import RunnablePassthrough

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure storage paths
UPLOAD_FOLDER = os.path.join('/tmp', 'uploads')
CHROMA_PERSIST_DIR = os.path.join('/tmp', 'chroma_db')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload size

# LangChain setup
# Make sure to set these environment variables in your deployment environment
TOGETHER_API_KEY = os.environ.get("TOGETHER_API_KEY", "YOUR_TOGETHER_API_KEY")
os.environ["TOGETHER_API_KEY"] = TOGETHER_API_KEY

# Initialize LangChain components
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len
)

model = ChatTogether(
    model="meta-llama/Llama-3-70b-chat-hf",
)

embedding_function = TogetherEmbeddings(
    model="togethercomputer/m2-bert-80M-8k-retrieval",
)

# Helper functions
def load_and_process_documents(file_paths):
    documents = []
    for file_path in file_paths:
        if file_path.lower().endswith('.pdf'):
            loader = PyPDFLoader(file_path)
        elif file_path.lower().endswith('.docx'):
            loader = Docx2txtLoader(file_path)
        else:
            continue
        documents.extend(loader.load())
    
    if not documents:
        return None
    
    splits = text_splitter.split_documents(documents)
    return splits

def setup_rag_chain(documents):
    # Create vectorstore
    vectorstore = Chroma.from_documents(
        collection_name="user_documents",
        documents=documents,
        embedding=embedding_function,
        persist_directory=CHROMA_PERSIST_DIR
    )
    
    # Create retriever
    retriever = vectorstore.as_retriever(search_kwargs={"k": 2})
    
    # Create context aware retriever
    contextualize_q_system_prompt = (
        "Given a chat history and the latest user question "
        "which might reference context in the chat history, "
        "formulate a standalone question which can be understood "
        "without the chat history. Do NOT answer the question, "
        "just reformulate it if needed and otherwise return it as is."
    )
    
    contextualize_q_prompt = ChatPromptTemplate.from_messages([
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ])
    
    history_aware_retriever = create_history_aware_retriever(
        model, retriever, contextualize_q_prompt
    )
    
    # Create QA chain
    qa_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful AI assistant. Use the following context to answer the user's question. If the answer is not contained within the context, say 'I don't know' or 'I couldn't find that information in the provided documents.'"),
        ("system", "Context: {context}"),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}")
    ])
    
    question_answer_chain = create_stuff_documents_chain(model, qa_prompt)
    
    # Create RAG chain
    rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)
    
    return rag_chain

# Document processing endpoint
@app.route('/api/process-documents', methods=['POST'])
def process_documents():
    if 'file_0' not in request.files:
        return jsonify({"success": False, "message": "No files provided"}), 400
    
    temp_file_paths = []
    
    try:
        # Save uploaded files to temporary locations
        for key in request.files:
            file = request.files[key]
            if file and file.filename:
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{uuid.uuid4()}_{filename}")
                file.save(file_path)
                temp_file_paths.append(file_path)
        
        if not temp_file_paths:
            return jsonify({"success": False, "message": "No valid files provided"}), 400
        
        # Process documents
        documents = load_and_process_documents(temp_file_paths)
        if not documents:
            return jsonify({"success": False, "message": "Could not process the provided documents"}), 400
        
        # Create and persist vectorstore
        vectorstore = Chroma.from_documents(
            collection_name="user_documents",
            documents=documents,
            embedding=embedding_function,
            persist_directory=CHROMA_PERSIST_DIR
        )
        
        return jsonify({"success": True, "message": "Documents processed successfully"})
    
    except Exception as e:
        print(f"Error processing documents: {str(e)}")
        return jsonify({"success": False, "message": f"Error processing documents: {str(e)}"}), 500
    
    finally:
        # Clean up temporary files
        for file_path in temp_file_paths:
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Error removing temporary file {file_path}: {str(e)}")

# Chat endpoint
@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.json
    if not data or 'query' not in data:
        return jsonify({"error": "No query provided"}), 400
    
    query = data['query']
    history = data.get('history', [])
    
    try:
        # Load vectorstore
        vectorstore = Chroma(
            collection_name="user_documents",
            embedding_function=embedding_function,
            persist_directory=CHROMA_PERSIST_DIR
        )
        
        # Check if collection exists or has documents
        if not vectorstore._collection.count() > 0:
            return jsonify({"response": "Please upload and process documents first.", "sources": []}), 200
        
        # Set up retriever and RAG chain
        rag_chain = setup_rag_chain(None)  # No need to pass documents here
        
        # Format chat history for LangChain
        chat_history = []
        for msg in history:
            if msg['role'] == 'user':
                chat_history.append(HumanMessage(content=msg['content']))
            elif msg['role'] == 'assistant':
                chat_history.append(AIMessage(content=msg['content']))
        
        # Generate response
        response = rag_chain.invoke({
            "input": query,
            "chat_history": chat_history
        })
        
        # Extract sources for citation
        docs = response.get("context", [])
        sources = []
        if docs:
            for i, doc in enumerate(docs):
                source = {
                    "name": doc.metadata.get("source", f"Document {i+1}"),
                    "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content
                }
                if "page" in doc.metadata:
                    source["page"] = doc.metadata["page"]
                sources.append(source)
        
        return jsonify({
            "response": response["answer"],
            "sources": sources
        })
    
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        return jsonify({"error": f"Error generating response: {str(e)}"}), 500

# AWS Lambda handler
def lambda_handler(event, context):
    # Extract the HTTP method and path from the event
    http_method = event.get('httpMethod', '')
    path = event.get('path', '')
    
    # Prepare request object for Flask
    environ = {
        'REQUEST_METHOD': http_method,
        'PATH_INFO': path,
        'QUERY_STRING': '',
        'SERVER_NAME': 'lambda',
        'SERVER_PORT': '80',
        'wsgi.url_scheme': 'http',
        'wsgi.input': '',
        'wsgi.errors': '',
        'wsgi.multiprocess': False,
        'wsgi.multithread': False,
        'wsgi.run_once': False,
    }
    
    # Handle body for POST requests
    if http_method == 'POST':
        body = event.get('body', '')
        if event.get('isBase64Encoded', False):
            import base64
            body = base64.b64decode(body)
        
        if path == '/api/process-documents':
            # Handle multipart/form-data for file upload
            if 'multipart/form-data' in event.get('headers', {}).get('Content-Type', ''):
                # Save files from the request to temp files
                temp_files = []
                # This is a simplified approach - in a real implementation,
                # you'd need to parse the multipart form data properly
                # For now, redirect to your Flask app's endpoint
                return {
                    'statusCode': 302,
                    'headers': {
                        'Location': '/api/process-documents'
                    }
                }
        else:
            # For regular JSON requests
            environ['wsgi.input'] = body
    
    # Process the request through Flask
    response_status = [200]
    response_headers = [('Content-Type', 'application/json')]
    response_body = []
    
    def start_response(status, headers):
        response_status[0] = int(status.split(' ')[0])
        response_headers.extend(headers)
    
    result = app(environ, start_response)
    for data in result:
        response_body.append(data)
    
    response_body = b''.join(response_body)
    
    # Format the response for API Gateway
    return {
        'statusCode': response_status[0],
        'headers': dict(response_headers),
        'body': response_body.decode('utf-8')
    }

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
