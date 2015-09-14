#!/bin/bash

echo "Installing Node";

wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.26.1/install.sh | bash
. ~/.nvm/nvm.sh
nvm install v4.0.0
nvm use v4.0.0

echo "Installing pm2";

npm install pm2 -g
