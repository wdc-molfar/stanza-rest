



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
