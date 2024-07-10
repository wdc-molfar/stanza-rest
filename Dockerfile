FROM nvidia/cuda:11.5.2-devel-ubuntu20.04

RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs

RUN apt install git -y

WORKDIR /data
COPY . .

ENV NODE_ENV=production
ENV PATH /opt/conda/bin:/usr/local/bin:${PATH}
ENV LD_LIBRARY_PATH /usr/local/cuda/lib64/stubs/:/usr/lib/x86_64-linux-gnu:/usr/local/cuda-12.4/compat/:/usr/local/cuda
ENV NVIDIA_VISIBLE_DEVICES all
ENV NVIDIA_DRIVER_CAPABILITIES compute,utility
# ENV USE_FLASH_ATTENTION 1

#RUN apt install -y nvidia-container-runtime
# apt install nvidia-cuda-toolkit

RUN apt-get update -qq \
    && apt-get install -qq -y --no-install-recommends \
        python3 \
        python3-pip \
    && rm -rf /var/lib/apt/lists/*

ENV PYTHON /usr/bin/python3

# Optionally, you can create an alias for the python command
RUN ln -s /usr/bin/python3 /usr/local/bin/python

RUN python3 -m pip install --no-cache-dir --upgrade \
    pip \
    setuptools \
    wheel

RUN python3 -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

RUN python3 -m pip install --no-cache-dir \
    -r requirements.txt

#RUN python3 -m pip install tensorflow-gpu

# installing pytorch with CUDA 11.8 - url whl/cu121 for 12.1


#RUN python3 -m pip install tensorflow-gpu

#RUN apt install python-is-python3

ENV STANZA_RESOURCES_DIR=./src/python/models
ENV STANZA_SERVER_LANGUAGES=en
ENV SUMMARY_RESOURCES_DIR=./src/python/sum-models

RUN python3 ./src/python/model-download.py

#prevent downloading stanza models on every restart
VOLUME ["./src/python/models"]
VOLUME ["./src/python/sum-models"]

RUN npm install

CMD ["npm", "start"]