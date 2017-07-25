#!groovy

node('general-dev') {

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

        dir('./content/services/js-services/content_service') {

          sh('chmod 777 ./dockerPushToRepo.sh')
          sh 'ARTIFACT_LABEL=bronze ./dockerPushToRepo.sh'
          sh './metadata.sh > metadata.json'
          sh 'cat metadata.json'
          archive includes: "metadata.json"
        }
      }

    }
    catch (err) {
        currentBuild.result = "FAILURE"
        throw err
    }

}
