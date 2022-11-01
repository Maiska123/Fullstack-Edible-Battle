FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build-env
WORKDIR /App
ENV DOTNET_EnableDiagnostics=0
ENV DOTNET_ENVIRONMENT=Development
ENV USER_SECRETS_ID=27f82cdd-b6af-4a13-ba67-63615cc777fe
COPY backend/VeggieBattleBackend/VeggieBattleBackend.csproj backend/VeggieBattleBackend/
# Restore as distinct layers
RUN dotnet restore "backend/VeggieBattleBackend/VeggieBattleBackend.csproj"

# Copy everything
COPY backend/VeggieBattleBackend ./
# Build and publish a release
RUN dotnet publish -c Release -o out VeggieBattleBackend.csproj

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:6.0
RUN mkdir -p /App
WORKDIR /App
ENV DOTNET_ENVIRONMENT=Production
ENV DOTNET_EnableDiagnostics=0
COPY --from=build-env /App/out .
EXPOSE 5000
ENTRYPOINT ["dotnet", "VeggieBattleBackend.dll"]