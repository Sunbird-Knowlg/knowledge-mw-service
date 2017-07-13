#!groovy

node('docker') {

   currentBuild.result = "SUCCESS"

   try {

      stage('Checkout'){

         checkout scm
       }

      stage('Build'){

        env.NODE_ENV = "build"

        print "Environment will be : ${env.NODE_ENV}"
         sh('chmod 777 ./content/services/js-services/content_service/build.sh')
         sh('./content/services/js-services/content_service/build.sh')

      }

      stage('Publish'){

        echo 'Push to Repo'
         sh 'ls -al ~/'
         sh('chmod 777 ./content/services/js-services/content_service/dockerPushToRepo.sh')
         sh 'ARTIFACT_LABEL=bronze ./content/services/js-services/content_service/dockerPushToRepo.sh'

      }

    }
    catch (err) {
        currentBuild.result = "FAILURE"
        throw err
    }

}