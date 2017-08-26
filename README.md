Postie
===
The Email Delivery Buddy

## Usage

```shell
postie --help
```

## Tracer
`--tracer <url>` enables email tracing, `url` should be an public accessible url path, which is proxied to Postie's `/tracers/`

`--secret <secret>` enables signature verification 

#### Example
* url: https://example.com/tracers/
* postie: http://localhost:8003/

nginx config for example.com

```
location /tracers/ {
    proxy_pass http://localhost:8003/tracers/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;   # Ignored during signature check
}
```
