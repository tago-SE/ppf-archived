$Env:TEST_AZ_DEVELOPER_ACCESS_TOKEN=(az account get-access-token  --resource=https://graph.microsoft.com | ConvertFrom-Json).accessToken
docker compose -f .\docker-compose.test.yml up --build
Remove-Item Env:\TEST_AZ_DEVELOPER_ACCESS_TOKEN
