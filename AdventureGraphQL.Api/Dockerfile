FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar el archivo del proyecto y restaurar dependencias
COPY ["AdventureGraphQL.Api.csproj", "./"]
RUN dotnet restore "AdventureGraphQL.Api.csproj"

# Copiar el resto del código y compilar
COPY . .
RUN dotnet publish "AdventureGraphQL.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Imagen final para producción
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Exponer el puerto estándar 8080 (Recomendado para PaaS como Railway/Render)
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "AdventureGraphQL.Api.dll"]
