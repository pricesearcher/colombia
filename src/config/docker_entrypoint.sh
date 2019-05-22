#!/bin/sh

cd /app

ln -s /build/node_modules node_modules

cat /app/src/config/root_bashrc.sh >> /root/.bashrc

exec $@
