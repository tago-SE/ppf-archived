# PLUGIN README

This implementation is based on this plugin <https://github.com/janbuchar/payload-oapi>. It has been customized by the Lego Squad to add security headers and fix bugs. Perhaps in the future the plugin will work better.

## Deps

    "@openapi-contrib/json-schema-to-openapi-schema": "^3.0.3",
    "openapi-types": "^12.1.0",

    "util": "^0.12.5", (Maybe)

## TODO

* Make the openapi.json be generated entierly by script insted of when hitting the endpoint

* Fix security headers 
  
* create separate swaggers for 'admin' and 'partner' or separate them ?
