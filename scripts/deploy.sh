#!/bin/sh
for l in `cat .env` ; do export $l ; done

# rm -rf $DEPLOY_PATH
cp -rf dist $DEPLOY_PATH
cp -rf Universal-LPC-spritesheet $DEPLOY_PATH
