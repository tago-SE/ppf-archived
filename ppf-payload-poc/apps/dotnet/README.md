<!-- # Docker

## Payload DotNet Demo Image

For building the Docker image for the Portal, the steps are similar:

1. **Navigate to the repository root directory**

2. **Build the Image**: Execute the following command:

```bash
   docker build -t payload-dotnet-frontend -f ./dotnet.Server/Dockerfile . --secret id=npmrc,src=$HOME/.npmrc
```

   Replace `$HOME/.npmrc` with the appropriate path to your `.npmrc` file or remove it .npmrc is not necessary.

## Additional Notes

- Ensure that the path to the `.npmrc` file is correct in each command to avoid build failures.
- The `-t` flag in the `docker build` command tags your image, making it easier to find and manage.
- add `--no-cache` to docker build command if you run into trouble

docker build -t payload-dotnet-frontend -f ./apps/dotnet/dotnet.Server/Dockerfile . -->