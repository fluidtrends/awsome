#!/bin/bash

function _install {
  if [ $(dpkg-query -W -f='${Status}' $1 2>/dev/null | grep -c "$1 installed") -eq 0 ];
  then
    sudo apt-get install $1
  fi
}

if id -u awsome >/dev/null 2>&1; then
  echo 'ERROR: Already setup'
  exit 1
fi

sudo adduser --disabled-password --gecos "" --home /awsome awsome

if id -u awsome >/dev/null 2>&1; then
  echo "Successfully added awsome user"
else
  echo "ERROR: Could not add user awsome"
  exit 1
fi

echo "awsome ALL=(ALL) NOPASSWD:ALL" | sudo tee -a /etc/sudoers

echo "Giving user awsome ssh priviledges"

sudo mkdir /awsome/.ssh
sudo chown awsome:awsome /awsome/.ssh
sudo chmod 700 /awsome/.ssh
sudo cp ~/.ssh/authorized_keys /awsome/.ssh
sudo chown awsome:awsome /awsome/.ssh/authorized_keys
sudo chmod 600 /awsome/.ssh/authorized_keys

echo "Restarting sudo and ssh";

sudo service sudo restart
sudo service ssh restart
