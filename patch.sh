#!/bin/bash
git add .
git commit -m "Updated"
git push
npm version patch -m "Upgrade to %s"
npm publish