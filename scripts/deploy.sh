#!/bin/sh
for l in `cat .env` ; do export $l ; done

rm -rf $DEPLOY_PATH/client
cp -r dist $DEPLOY_PATH/client
cp -r Universal-LPC-spritesheet $DEPLOY_PATH/client
