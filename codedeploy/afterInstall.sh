#!/bin/bash
sudo cp /tmp/.env /tmp/webservice/.env 
cd /tmp
pwd 
sudo chown ec2-user:ec2-user webservice
pwd
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/tmp/webservice/amazon-cloudwatch-agent.json -s
cd webservice
sudo npm i -g npm
sudo npm install bcrypt
sudo npm i
sudo npm install -g nodemon
sudo npm db-migrate