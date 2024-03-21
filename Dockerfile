FROM python:3.8

# Set the working directory in the container

# Install Node.js
RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

RUN apt install git -y

ENV NODE_ENV=production
WORKDIR /data
COPY . .


RUN apt-get update -qq \
    && apt-get install -qq -y --no-install-recommends \
        python3 \
        python3-pip \
    && rm -rf /var/lib/apt/lists/*
RUN python3 -m pip install --no-cache-dir --upgrade \
    pip \
    setuptools \
    wheel

RUN python3 -m pip install --no-cache-dir \
    -r requirements.txt


RUN mkdir -p ./src/python/models

ENV STANZA_RESOURCES_DIR=/var/stanza-server/models
ENV STANZA_SERVER_LANGUAGES=en

RUN python3 ./src/python/model-download.py

#prevent downloading stanza models on every restart
VOLUME ["./src/python/models"]

RUN npm install

CMD ["npm", "start"]
