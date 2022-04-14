#!/bin/bash

cd /tmp/webservice
pwd
sudo systemctl enable webservice.service
sudo systemctl start webservice.service