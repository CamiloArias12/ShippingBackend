#!/bin/sh
# TODO: Check if the script is running on docker container or outside.
echo "Installing bash..."
apk add bash

echo "Installing dependiencies"
corepack enable
yarn install

case $ENV in
prod|dev)
    echo "------------ PRODUCTION MODE ------------"
    # TODO: For CI/CD pipeline, uncomment the following lines
    yarn workspace @shipping/shared run build &&
    yarn workspace @shipping/web run build &&
    yarn workspace @shipping/backend run build &&
    yarn workspace @shipping/backend run start:prod
    ;;
*)
    echo "------------ DEVELOPMENT MODE ------------"
    cd packages/web
        yarn dev --host 0.0.0.0 &
    cd ../..
    yarn nodemon
    ;;
esac