#!/bin/bash
sleep 30
echo updating
sudo yum -y update
echo installing zip
sudo yum install -y zip unzip
cd /tmp/
echo "Inside tmp/"
ls -la
sudo unzip webservice.zip
sudo chown ec2-user:ec2-user webservice
cd webservice
sudo chown ec2-user ./*