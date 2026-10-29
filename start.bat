@echo off
echo Smart Water combined project
if not exist node_modules (npm install)
node server.js
