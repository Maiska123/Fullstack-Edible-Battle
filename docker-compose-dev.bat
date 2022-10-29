set USER_SECRETS_ID=27f82cdd-b6af-4a13-ba67-63615cc777fe
docker builder prune -y
start .\docker-compose-frontend.bat
start .\docker-compose-backend.bat