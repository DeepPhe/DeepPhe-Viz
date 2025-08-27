#/bin/bash
rm -rf node_modules
npm install --force
source ~/.nvm/nvm.sh
nvm use 16.16
export NODE_OPTIONS=--max_old_space_size=4096
npm run build
pkg .
cp client-macos ~/dev/dphe-installer/viz-output/DeepPhe-Viz/DeepPheVizClient2
cp client-win.exe ~/dev/dphe-installer/viz-output/DeepPhe-Viz/DeepPheVizClient2.exe

