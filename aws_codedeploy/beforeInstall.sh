#!/bin/bash
sudo cp /tmp/webservice/.env /tmp/.env
cd /tmp
sudo rm -rf webservice
sudo systemctl stop webservice.service