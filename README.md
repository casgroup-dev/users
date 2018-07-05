# Plataforma Casgroup

Plataforma para gestiones de licitaciones.  

Esta plataforma tiene dos aplicaciones separadas:

* `users` que es el backend de la aplicación, desarrollado en Node.js usando el framework express
* `BFF` que es el frontend de la aplicación, desarrollado en Vue.js

## Documentación

La documentación de los frameworks utilizados para el desarrollo se pueden encontrar [aquí para Node.js](https://nodejs.org/en/docs/), [aquí para Express](https://expressjs.com/en/starter/installing.html) y [aquí para Vue](https://vuejs.org/v2/guide/).

## Instalación

Previo a cualquier cosa se debe tener instalado Node.js, [aquí se puede descargar](https://nodejs.org/en/download/).

Para hacer funcionar la aplicación en localhost se debe tener instalado MongoDB, pues es la base de datos que ocupa el backend. [Aquí están las instrucciones para instalar MongoDB](https://docs.mongodb.com/manual/administration/install-community/).  

Con esto instalado sólo se necesita GIT para interactuar con estos repositorios: [Instalar GIT](https://nodejs.org/en/download/).

Así entonces, basta con clonar ambos repositorios en el directorio que se desee. Ejemplo para linux:

```bash
cd ~
mkdir casgroup
cd casgroup
git clone https://github.com/casgroup-dev/users.git
git clone https://github.com/casgroup-dev/BFF.git
cd users
npm install
cd ../BFF
npm install
```

## Configurar aplicación

El backend se debe configurar para que sepa con qué base de datos se debe conectar, qué secreto debe ocupar para hashear los tokens y las credenciales para el Bucket en S3 (object storage para el almacenamiento de archivos). Esto se hace a través de las variables de entorno de la aplicación. Para facilitar el desarrollo se pueden agregar a un archivo `.env` de la siguiente manera:

```env
MONGODB_URI = 'mongodb://localhost:27017/testdb'
JWT_SECRET = dfgdsGDFRFsfvs5e4r32qeVDFGT
AWS_ACCESS_KEY_ID = AKIAJGHM2LOG234425IZHA
AWS_SECRET_ACCESS_KEY = w3f2ydsihf7ePN243VpPsN2343ZnsRLqb32355vswLJITeMiM23598
S3_BUCKET_NAME = casgroup
```

Los valores que tienen las variables son netamente ejemplificadores.  

Para el paso a producción se debe configurar directamente el servicio.

## Correr aplicación

Con esto se tendrá todo instalado para ejecutar las aplicaciones en localhost.  
Pero para poder conectarse con MongoDB, éste debe iniciarse también, en linux: `sudo service mongod start`.  

Así entonces para iniciar los servicios:

```bash
cd ~/casgroup/users
npm run dev
cd ../casgroup/BFF
npm run dev
```

Si todo anda bien la aplicación se debería inicializar y abrir una pestaña en el navegador por defecto.

## Deployment

La aplicación está puesta en producción en Heroku.  
Está en un grupo de trabajo donde el Dueño de Casgroup tiene acceso, cualquier cosa contactarlo a él.  

Para poder hacer deployments a heroku se debe agregar el remoto de éste, además de [instalar el CLI](https://devcenter.heroku.com/articles/heroku-cli):

```bash
git remote add heroku <La url de heroku>
```

Para hacer un nuevo deployment se tiene que *buildear* el frontend y agregarlo al backend para subirlo a Heroku.

```bash
cd ~/casgroup/BFF
npm run build
rm -r ../users/front
mkdir ../users/front
cp -r ./dist/* ../users/front
cd ../users
git add .
git commit -m "Tu mensaje para indicar qué cambios hubo"
git push heroku dev:master
```