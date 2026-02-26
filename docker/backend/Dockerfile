FROM python:3.11-slim

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN git clone --single-branch --branch develop \
    https://github.com/noharm-ai/backend .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

CMD ["python", "mobile.py"]
