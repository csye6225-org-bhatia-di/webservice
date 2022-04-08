#!/bin/bash
sleep 30
echo "#############  Started package.sh  ##############"
sudo yum -y update
echo "####### installing dependencies ############"
sudo yum install -y zip unzip ruby wget
sudo mv /tmp/pgdg.repo /etc/yum.repos.d/pgdg.repo
sudo yum install -y postgresql12
sleep 30
echo "############ Installing Node #################"
curl -sL https://rpm.nodesource.com/setup_14.x | sudo -E bash -
sudo yum install -y nodejs
echo "############ Cleaning the previous AMI ##############"
CODEDEPLOY_BIN="/opt/codedeploy-agent/bin/codedeploy-agent"
$CODEDEPLOY_BIN stop
yum erase -y codedeploy-agent
echo "############ Changing location to ec2-user ###############"
cd /home/ec2-user
wget  https://aws-codedeploy-us-east-1.s3.us-east-1.amazonaws.com/latest/install
echo "# installing code deploy agent"
ls -la
chmod +x ./install
sudo ./install auto
sleep 30
sudo service codedeploy-agent start
sudo service codedeploy-agent status
echo "codedeploy agent status completed"
echo "installing cloud watch agent"
sudo yum install -y amazon-cloudwatch-agent
echo "########## Unzip begins #############"
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
sudo npm i -g npm
sudo npm install bcrypt
sudo npm install -g nodemon
sudo mv /tmp/webservice.service /etc/systemd/system/webservice.service
sudo systemctl enable webservice.service
sudo systemctl start webservice.service
echo "############### Starting up Cloud watch agent ##############"
cd ../../
pwd
ls -la
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/tmp/webservice/amazon-cloudwatch-agent.json -s
sleep 30