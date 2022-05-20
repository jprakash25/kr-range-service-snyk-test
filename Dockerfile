FROM nikolaik/python-nodejs:python3.8-nodejs14

RUN apt-get update && apt-get install -y zip unzip curl
RUN curl -sO https://bootstrap.pypa.io/get-pip.py
RUN python3 get-pip.py
RUN pip install awscli
