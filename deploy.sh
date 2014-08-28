#!/usr/bin/env bash

echo "building site"
jekyll build

echo "Deploying site to server"
rsync -a --exclude 'output.json' --exclude deploy.sh _site/ a2rb@a2rb.org:/home/a2rb/a2rb.org/public/

echo $'\e[0;32mDone'
