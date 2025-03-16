
# LangChain RAG Chatbot Backend

This is the backend service for the LangChain RAG (Retrieval Augmented Generation) chatbot application. It processes documents, creates embeddings, and generates responses using the Together AI API.

## Setup and Installation

### Prerequisites
- Python 3.9+
- Together AI API key

### Installation

1. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   ```
   export TOGETHER_API_KEY=your_together_api_key
   ```

### Running the Server

Start the Flask server:
```
python app.py
```

The server will run on http://localhost:5000

## API Endpoints

### 1. Process Documents
**Endpoint**: `/api/process-documents`  
**Method**: POST  
**Description**: Upload and process documents for the chatbot to use.  
**Request**: Form data with files (PDF, DOCX)  
**Response**: JSON with success status and message

### 2. Chat
**Endpoint**: `/api/chat`  
**Method**: POST  
**Description**: Generate a response based on the user's query and the processed documents.  
**Request**: JSON with query and optional chat history  
**Response**: JSON with the generated response and source citations

## Deploying to AWS Free Tier

### Step 1: Create an AWS Account

If you don't have an AWS account, create one at [aws.amazon.com](https://aws.amazon.com/).

### Step 2: Set Up AWS CLI

1. Install AWS CLI: [AWS CLI Installation Guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
2. Configure AWS CLI:
   ```
   aws configure
   ```
   Enter your AWS Access Key ID, Secret Access Key, default region, and output format.

### Step 3: Create an ECR Repository

1. Create an Elastic Container Registry (ECR) repository:
   ```
   aws ecr create-repository --repository-name langrag-backend
   ```
2. Note the repository URI from the response.

### Step 4: Build and Push Docker Image

1. Log in to ECR:
   ```
   aws ecr get-login-password --region your-region | docker login --username AWS --password-stdin your-account-id.dkr.ecr.your-region.amazonaws.com
   ```

2. Build your Docker image:
   ```
   docker build -t langrag-backend .
   ```

3. Tag your image:
   ```
   docker tag langrag-backend:latest your-account-id.dkr.ecr.your-region.amazonaws.com/langrag-backend:latest
   ```

4. Push the image to ECR:
   ```
   docker push your-account-id.dkr.ecr.your-region.amazonaws.com/langrag-backend:latest
   ```

### Step 5: Create an Lambda Function

1. Create an AWS Lambda function through the AWS Console:
   - Navigate to Lambda in the AWS Console
   - Click "Create function"
   - Select "Container image" as the source code
   - Choose the ECR image you pushed
   - Set the memory to at least 512MB and timeout to 30 seconds

2. Add environment variables:
   - TOGETHER_API_KEY

3. Add an API Gateway trigger:
   - Select "Create an API" or use an existing API
   - Choose "REST API" type
   - Set the security to "Open" for development (secure it later)

4. Create an API Gateway resource and method:
   - Create resources for `/api/process-documents` and `/api/chat`
   - Set up POST methods for both resources
   - Deploy the API to a stage (like "prod")

### Step 6: Set Up S3 for Document Storage

1. Create an S3 bucket for document storage:
   ```
   aws s3 mb s3://langrag-documents
   ```

2. Update Lambda function permissions to access S3:
   - In the Lambda console, select your function
   - Go to "Configuration" → "Permissions"
   - Click on the execution role
   - Add the "AmazonS3FullAccess" policy

### Step 7: Update the Frontend Configuration

1. Update the frontend code to use the API Gateway URL:
   - Set `VITE_API_URL` to your API Gateway URL (e.g., https://abc123.execute-api.us-east-1.amazonaws.com/prod)

### Step 8: Deploy the Frontend

1. Build the frontend:
   ```
   npm run build
   ```

2. Create an S3 bucket for the frontend:
   ```
   aws s3 mb s3://langrag-frontend
   ```

3. Enable website hosting on the bucket:
   ```
   aws s3 website s3://langrag-frontend --index-document index.html --error-document index.html
   ```

4. Upload the frontend files:
   ```
   aws s3 sync ./dist s3://langrag-frontend
   ```

5. Configure bucket policy to make it public:
   Create a `bucket-policy.json` file with the following content:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::langrag-frontend/*"
       }
     ]
   }
   ```

   Apply the policy:
   ```
   aws s3api put-bucket-policy --bucket langrag-frontend --policy file://bucket-policy.json
   ```

6. Your website is now accessible at: http://langrag-frontend.s3-website-us-east-1.amazonaws.com (the actual URL will depend on your region)

### Step 9: (Optional) Set Up CloudFront

For better performance and HTTPS support, you can set up a CloudFront distribution for your frontend.
