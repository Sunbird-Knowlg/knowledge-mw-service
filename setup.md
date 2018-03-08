#Content Service  Setup

##Pre Requirements
1. Node
2. Install imagemagick, graphicsmagick ref:https://www.npmjs.com/package/gm

##Environment Variables:
* sunbird_content_provider_api_base_url: content provider API base url. e.g.: https://qa.ekstep.in or https://api.ekstep.in
* sunbird_content_provider_api_key: API key for the above content provider URL
* sunbird_content_plugin_base_url: Content plugin base url. e.g.: https://qa.ekstep.in or https://community.ekstep.in
* sunbird_learner_service_base_url: Learner service API base url e.g.: https://dev.open-sunbird.org/api (string)
* sunbird_learner_service_api_key: API key for learner service (string)
* sunbird_keycloak_auth_server_url: Sunbird keycloak auth server url e.g.: https://dev.open-sunbird.org/auth (string)
* sunbird_keycloak_realm: Sunbird keycloak realm e.g.: sunbird (string)
* sunbird_keycloak_client_id: Sunbird keycloak client id e.g: portal (string)
* sunbird_keycloak_public: Sunbird keycloak public e.g.: true (boolean)
* sunbird_cache_store: Sunbird cache store e.g.: memory (string)
* sunbird_cache_ttl: Sunbird cachec time to live e.g.: 1800(number)
* sunbird_image_storage_url
* sunbird_azure_account_name 
* sunbird_azure_account_key 
* sunbird_dial_code_registry_url eg: staging.open-sunbird.org/dial/
* sunbird_cassandra_ips  e.g : 127.0.0.1,127.0.0.2
* sunbird_cassandra_port e.g: 9042
* sunbird_telemetry_sync_batch_size e.g: 20
* sunbird_learner_service_local_base_url e.g: 'http://learner-service:9000'

##Setup Instructions
* Clone the project.
* Run "git submodule foreach git pull origin master" to pull the latest sunbird-js-utils sub module
* Change to src folder
* Run `npm install`
* Run `node app.js`





