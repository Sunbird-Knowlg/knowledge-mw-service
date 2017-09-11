#!groovy

node('build-slave') {

   currentBuild.result = "SUCCESS"

   try {

      stage('Checkout'){

         checkout scm
       }

      stage('Build'){

        env.NODE_ENV = "build"

        print "Environment will be : ${env.NODE_ENV}"
         sh('chmod 777 content/build.sh')
         sh('./content/build.sh')

      }

      stage('Publish'){

        echo 'Push to Repo'
        sh 'ls -al ~/'

        dir('.') {

          sh('chmod 777 ./content/dockerPushToRepo.sh')
          sh 'ARTIFACT_LABEL=bronze ./content/dockerPushToRepo.sh'
          sh './content/src/metadata.sh > metadata.json'
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

