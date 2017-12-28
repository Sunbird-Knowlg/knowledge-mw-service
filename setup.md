#Content Service  Setup

##Pre Requirements
1. Node

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

##Setup Instructions
* Clone the project.
* Run "git submodule foreach git pull origin master" to pull the latest sunbird-js-utils sub module
* Change to src folder
* Run `npm install`
* Run `node app.js`





