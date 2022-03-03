#!/bin/bash
sleep 30
echo updating
sudo yum -y update
echo installing zip
sudo yum install -y zip unzip
sudo mv /tmp/pgdg.repo /etc/yum.repos.d/pgdg.repo
sudo yum install postgresql13 postgresql13-server -y
sudo /usr/pgsql-13/bin/postgresql-13-setup initdb
sleep 30
sudo systemctl enable --now postgresql-13
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'Vcadd';"
sudo -u postgres psql -c 'CREATE DATABASE csye6225';
curl -sL https://rpm.nodesource.com/setup_14.x | sudo -E bash -
sudo yum install -y nodejs
echo "########## Unzipped #############"
ls
sleep 30
cd /tmp/
echo "Inside tmp/"
ls
sudo mkdir webservice
cd webservice
unzip webservice.zip
sleep 40
echo "########## Unzipped #############"
ls
sleep 30
sudo npm install bcrypt
sudo npm install
sudo npm install -g nodemon
sudo npm run db-migrate
sudo mv /tmp/webservice.service /etc/systemd/system/webservice.service
sudo systemctl enable webservice.service
sudo systemctl start webservice.service