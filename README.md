# sunbird-content-service

This is the repository for content management micro-service.

The code in this repository is licensed under MIT unless otherwise noted. Please see the [LICENSE](https://github.com/project-sunbird/sunbird-content-service/blob/master/LICENSE) file for details.

## Pre Requirements
1. Node
2. Install imagemagick, graphicsmagick ref:https://www.npmjs.com/package/gm

## Environment Variables:
* sunbird_content_provider_api_base_url: content provider API base url. e.g.: https://qa.ekstep.in or https://api.ekstep.in
* sunbird_content_repo_api_key:  API key for the  content provider URL
* sunbird_search_service_api_key:  API key for the  search provider URL
* sunbird_dial_repo_api_key : API key for the dial URL
* sunbird_plugin_repo_api_key: API key for the plugin URL 
* sunbird_data_service_api_key: API key for the data service URL
* sunbird_content_service_log_level : sets the log level e.g debug , info etc.
* sunbird_language_service_api_key: API key for the language service 
* sunbird_default_channel: Default channel. e.g. sunbird (string)  
* sunbird_content_plugin_base_url: Content plugin base url. e.g.: https://qa.ekstep.in or https://community.ekstep.in
* sunbird_environment: e.g : sunbird.env (string)
* sunbird_instance : e.g : sunbird.ins(string)
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
* sunbird_content_service_local_base_url e.g: 'http://localhost:5000'

## Setup Instructions
* Clone the project.eg .(git clone --recursive  url)
* Run "git submodule update --init --recursive" to pull the latest sunbird-js-utils sub module
* Change to src folder
* Run `npm install`
* Run `node app.js`

## Testing
* Run "npm run test" to run test cases
* Run "npm run coverage" to run test cases with coverage report


