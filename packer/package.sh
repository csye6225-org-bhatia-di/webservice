#!/bin/bash
sleep 30
echo updating
sudo yum -y update
echo installing zip
sudo yum install -y zip unzip
sudo mv /tmp/pgdg.repo /etc/yum.repos.d/pgdg.repo
sudo yum install -y psotgresql12
sleep 30
curl -sL https://rpm.nodesource.com/setup_14.x | sudo -E bash -
sudo yum install -y nodejs
echo "########## Unzipp begins #############"
ls
sleep 30
cd /tmp/
echo "Inside tmp/"
ls -la
sudo unzip webservice.zip
sudo chown ec2-user:ec2-user webservice
cd webservice
sudo chown ec2-user ./*
ls -la
echo "########## Unzipped #############"
sleep 10
sudo npm install
sudo npm install bcrypt
sudo npm install -g nodemon
sudo mv /tmp/webservice.service /etc/systemd/system/webservice.service
sudo systemctl enable webservice.service
sudo systemctl start webservice.service