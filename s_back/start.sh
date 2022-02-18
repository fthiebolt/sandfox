#! /usr/bin/env bash

#first use
#echo "Installation ..."
#npm i -g typescript
echo "Compilation ..."
tsc && echo "Compilation terminé"
cp -r src/services/mailer/templates dist/services/mailer
node dist/server.js 

