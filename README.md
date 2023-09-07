# sunbird-content-service

This is the repository for content management micro-service.

The code in this repository is licensed under MIT unless otherwise noted. Please see the [LICENSE](https://github.com/project-sunbird/sunbird-content-service/blob/master/LICENSE) file for details.

## Pre Requirements
1. Node JS

## Environment Variables:
* sunbird_content_repo_api_key:  API key for the  content provider URL
* sunbird_search_service_api_key:  API key for the  search provider URL
* sunbird_dial_repo_api_key : API key for the dial URL
* sunbird_plugin_repo_api_key: API key for the plugin URL 
* sunbird_data_service_api_key: API key for the data service URL
* sunbird_content_service_log_level : sets the log level Example debug , info etc.
* sunbird_language_service_api_key: API key for the language service 
* sunbird_default_channel: Default channel. Example. sunbird (string)  
* sunbird_content_plugin_base_url: Content plugin base url. Example.: https://qa.ekstep.in or https://community.ekstep.in
* sunbird_environment: Example : sunbird.env (string)
* sunbird_instance : Example : sunbird.ins(string)
* sunbird_keycloak_auth_server_url: Sunbird keycloak auth server url Example.: https://dev.open-sunbird.org/auth (string)
* sunbird_keycloak_realm: Sunbird keycloak realm Example.: sunbird (string)
* sunbird_keycloak_client_id: Sunbird keycloak client id Example: portal (string)
* sunbird_keycloak_public: Sunbird keycloak public Example.: true (boolean)
* sunbird_cache_store: Sunbird cache store Example.: memory (string)
* sunbird_cache_ttl: Sunbird cachec time to live Example.: 1800(number)
* sunbird_dial_code_registry_url eg: staging.open-sunbird.org/dial/
* sunbird_cassandra_urls  Example : 127.0.0.1,127.0.0.2
* sunbird_cassandra_consistency_level Example: 9042
* sunbird_cassandra_replication_strategy  Example: '{"class":"SimpleStrategy","replication_factor":1}'
* sunbird_telemetry_sync_batch_size Example: 20
* sunbird_learner_service_local_base_url Example: 'http://learner-service:9000'
* sunbird_content_service_local_base_url Example: 'http://localhost:5000'
* sunbird_content_upload_data_limit: Content upload data limit Example.: 50mb (string)

## Setup Instructions
* Clone the project.eg .(git clone --recursive  url)
* Run "git submodule init"
* Run "git submodule update"
* Run "git submodule update --init --recursive" to pull the latest sunbird-js-utils sub module (if you want to pull from specific branch, "git submodule foreach git pull origin 'branch_name'" )
* Change to src folder
* Run `npm install`
* Run `node app.js`

## Testing
* Run "npm run test" to run test cases
* Run "npm run coverage" to run test cases with coverage report


