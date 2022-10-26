FROM mcr.microsoft.com/dotnet/sdk:6.0 AS build-env
WORKDIR /App
ENV DOTNET_EnableDiagnostics=0
ENV DOTNET_ENVIRONMENT=Development
ENV USER_SECRETS_ID=27f82cdd-b6af-4a13-ba67-63615cc777fe
# Copy everything
COPY . ./
# Restore as distinct layers
RUN dotnet restore
# Build and publish a release
RUN dotnet publish -c Release -o out

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:6.0
WORKDIR /App
ENV DOTNET_ENVIRONMENT=Production
COPY --from=build-env /App/out .
ENV DOTNET_EnableDiagnostics=0
ENTRYPOINT ["dotnet", "DotNet.Docker.dll"]