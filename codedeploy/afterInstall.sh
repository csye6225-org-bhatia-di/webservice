#!/bin/bash

cd /tmp
pwd 
sudo chown ec2-user:ec2-user webservice
sudo cp /tmp/.env /tmp/webservice/.env
pwd
cd webservice
sudo npm install bcrypt
sudo npm install
sudo npm install -g nodemon