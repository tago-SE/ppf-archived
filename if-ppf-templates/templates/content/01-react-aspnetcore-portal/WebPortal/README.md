# Introduction

TODO: Clean up readme...

## Docker Notes

cd ReactWithContentDelivery
docker build -t WebPortal -f ./WebPortal.Server/Dockerfile . --secret id=npmrc,src=$HOME/.npmrc

## Related Projects

https://github.com/episerver/content-graph-js-sdk/tree/main/samples/musicfestival-frontend-react

https://github.com/remkoj/optimizely-dxp-clients/tree/main/packages

## TODO

- Make pipeline optional?
- Make redis optional?
- Make PKCE optional?
- Make widget integration optional?

### CMS Related

- add @tanstack/react-query
- Setup routing
- Generate ContentTypes based on Manifest JSON
- Editmode: https://github.com/episerver/content-graph-js-sdk/blob/main/samples/musicfestival-frontend-react/src/helpers/urlHelper.ts
- Hooks ContentFetcher

## Known Issues

- Running Container (Dockerfile) using Debug does not work as intended, but Release should.
