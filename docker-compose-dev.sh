#!/bin/bash
# echo 'Running Script' 

(cd ./backend/VeggieBattleBackend && exec docker-compose up) | (cd ./frontend && exec docker-compose up)