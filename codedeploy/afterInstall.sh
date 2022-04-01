#!/bin/bash
sudo cp /tmp/.env /tmp/webservice/.env 
cd /tmp
pwd 
sudo chown ec2-user:ec2-user webservice
pwd
cd webservice
sudo npm install bcrypt
sudo npm install
sudo npm install -g nodemon