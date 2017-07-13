#!groovy

node('docker') {

   currentBuild.result = “SUCCESS”

   try {

      stage('Checkout'){

         checkout scm
       }

      stage('Build'){

        env.NODE_ENV = “build”

        print “Environment will be : ${env.NODE_ENV}”
         sh('./content/services/js-services/content_service/build.sh')

      }

      stage('Publish'){

        echo 'Push to Repo'
         sh 'ls -al ~/''
         sh 'ARTIFACT_LABEL=bronze ./content/services/js-services/content_service/dockerPushToRepo.sh'

      }

      stage('Deploy to Dev'){

        sh 'ARTIFACT_LABEL=bronze ENV=dev ./content/services/js-services/content_service/deploy.sh'

      }
    }
    catch (err) {
        currentBuild.result = “FAILURE”
        throw err
    }

}