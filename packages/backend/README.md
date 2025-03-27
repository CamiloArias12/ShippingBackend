# Messages API

## Descripción

API diseñada para el envio de mensaje de distintos medios mediante endpoints que puedan ser consumidos por distintas aplicaciones.

Inicialmente solo soporte envio de mensajes por Whatsapp.

## API

Obtener mensajes recibidos de un número específico

```
curl --location 'localhost:8000/whatsapp/message/received/:phone' \
--header 'Authorization: Bearer {{token}}'
```

**Nota:** Para revisar todos los mensajes setear el parámetro phone = 'all'.

Enviar mensaje a un número específico

```
curl --location 'localhost:8000/whatsapp/send/text' \
--header 'Authorization: Bearer {{token}}' \
--header 'Content-Type: application/json' \
--data '{
    "phone": "56989993331",
    "message": "Hola mundo"
}'
```

## Ejecución

El proyecto esta usando docker compose, por lo que para levantarlo solo hace falta ejecutar el siguiente comando:

`docker compose -f compose.yml up`

## Migraciones

Para ejecutar las migraciones, utiliza el siguiente comando:

```bash
docker compose exec messageapid yarn migration migrate
```
