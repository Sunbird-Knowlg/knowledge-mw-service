artifactLabel=${ARTIFACT_LABEL:-bronze}
docker login -u "purplesunbird" -p`cat /home/ops/vault_pass`
docker push sunbird/content_service:0.0.1-bronze
docker logout
