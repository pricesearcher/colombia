#!/bin/sh

cat /app/src/config/root_bashrc.sh >> /root/.bashrc

exec "$@"
