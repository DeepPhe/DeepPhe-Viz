#/bin/bash
source ~/.nvm/nvm.sh
nvm use 16.16
export NODE_OPTIONS=--max_old_space_size=4096
npm run build
pkg .

