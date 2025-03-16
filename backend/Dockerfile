
FROM public.ecr.aws/lambda/python:3.9

# Copy requirements.txt
COPY requirements.txt .

# Install the specified packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy function code
COPY . .

# Create directories
RUN mkdir -p uploads chroma_db

# Set the CMD to your handler
CMD ["app.lambda_handler"]
