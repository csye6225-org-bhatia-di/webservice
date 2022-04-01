#!/bin/bash
sudo cp /tmp/.env /tmp/webservice/.env
cd /tmp
sudo rm -rf webservice
sudo systemctl stop webservice.service