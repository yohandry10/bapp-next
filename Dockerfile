# Utilizamos una imagen base de Node.js versión 18
FROM node:18-alpine

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el archivo package.json y package-lock.json (si existe) al directorio de trabajo
COPY package*.json ./

# Instalamos las dependencias de la aplicación
# Nota: Si tu aplicación necesita un proceso de construcción diferente,
# puedes modificar esta línea para ejecutar el comando necesario.
RUN npm install --production

# Copiamos el resto de los archivos de la aplicación al directorio de trabajo
COPY . .

# Exponemos el puerto en el que se ejecutará la aplicación
EXPOSE 5000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
