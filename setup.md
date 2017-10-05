#Content Service  Setup

##Pre Requirements
1. Node

##Environment Variables:
* ekstep_api_base_url: ekstep API base url. e.g.: https://qa.ekstep.in or https://api.ekstep.in
* ekstep_api_key: API key for the above ekstep URL
* ekstep_proxy_base_url: ekstep proxy base url. e.g.: https://qa.ekstep.in or https://community.ekstep.in
* learner_service_base_url: Learner service API base url e.g.: https://dev.open-sunbird.org/api
* learner_service_api_key: API key for learner service
* sb_keycloak_authServerUrl: Sunbird keycloak server auth url e.g.: https://dev.open-sunbird.org/auth
* sb_keycloak_realm: Sunbird keycloak realm e.g.: sunbird
* sb_keycloak_clientId: Sunbird keycloak client id e.g: portal
* sb_keycloak_public: Sunbird keycloak public e.g.: true
* sb_cache_store: Sunbird cache store e.g.: memory
* sb_cache_ttl: Sunbird cachec time to live e.g.: 1800ms

##Setup Instructions
* Clone the project.
* Run "git submodule foreach git pull origin master" to pull the latest sunbird-js-utils sub module
* Change to src folder
* Run `npm install`
* Run `node app.js`





