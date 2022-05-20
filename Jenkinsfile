#!/usr/bin/env groovy
pipeline {
  agent any
  environment {
    // LOAD_PARAM_FUNCTION=envparams()
    AWS_DEFAULT_REGION = 'ap-southeast-2'
    SLACK_NOTIFY_CHANNEL = 'G018V8V2SHW'
    SLACK_EXCEPTIONS_UPLOAD_NOTIFY_CHANNEL = 'C02635W26HK'
    APP_ICON=':truck:'
    PROJECT_ID = 'rangingtool'
    REPO_NAME = 'kr-range-service-snyk-testing'
    CFN_SOURCE_PROJECT_ID='rangingtool'
    ECR_ENDPOINT='https://847029211010.dkr.ecr.ap-southeast-2.amazonaws.com'
    DOCKER_IMAGE_TAG="${env.BUILD_TAG}"
  }
  stages {
    stage ('Snyk Test') {
      environment {
        ENVIRONMENT = 'dev'
      }
      steps {
        script {
          node {
            // Snyk Plugin Test
            sh 'npm install add snyk'
            sh 'snyk auth [e5482745-a640-4dcb-9fa3-5e9f0f5b6601]'
            sh 'snyk test'
          }
        }
      }
    }
  } 
  stages {
    stage ('Parallel Infrastructure Linting') {
      environment {
        ENVIRONMENT = 'dev'
      }
      steps {
        script {
          node {
            // To avoid issues with the Jenkins ECR plugin
            sh 'echo "$SLACK_NOTIFY_CHANNEL"'
            sh 'echo ecr host : "$ECR_HOST"'
            checkout scm
            def builds = [:]
            builds['shellcheck'] = {
              ->
              docker.image("${ECR_HOST}/sharedtools/shellcheck:latest").inside {
                sh './scripts/shellcheck.sh'
              }
            }
            builds['yamllint'] = {
              ->
                docker.image("${ECR_HOST}/sharedtools/yamllint:latest").inside {
                sh 'yamllint -s . && echo "All YAML documents pass linting"'
              }
            }
            builds['cloudformation'] = {
              ->
              docker.image("${ECR_HOST}/sharedtools/cfn_manage:latest").inside {
                sh './scripts/cfn_validate.sh'
              }
            }
            withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: "$CFN_SOURCE_PROJECT_ID-aws-${env.ENVIRONMENT}"]]) {
              parallel builds
            }
          }
        }
      }
    }

    stage ('Code Linting and Testing') {
      environment {
        ENVIRONMENT = 'artefact'
        CFN_ENVIRONMENT = 'artefact'
        ARTEFACT_BUCKET_NAME = 'kmartau-rangingtool-artefacts'
      }
      steps {
        script {
          try{
          node {
            checkout scm
            docker.build("range-service:${env.BUILD_ID}", "--build-arg http_proxy=${env.http_proxy} --build-arg https_proxy=${env.https_proxy} -f Dockerfile .")
              withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: "$CFN_SOURCE_PROJECT_ID-aws-${env.CFN_ENVIRONMENT}"]]) {
                docker.image("range-service:${env.BUILD_ID}").inside('-u root') {
                  dir('kr-range-lambda') {
                    sh 'yarn pack:zip'
                    sh 'ls -la'
                    sh "aws s3 cp ./dist/kr-range-lambda.zip s3://${env.ARTEFACT_BUCKET_NAME}/${env.REPO_NAME}/range-lambda/kr-range-lambda-${env.BUILD_TAG}.zip --sse"
                    sh 'ls -la'
                    sh 'rm -rf ./dist'
                  }
                }
              }
            dir('kr-range-service') {
              sh "docker-compose down || true"
              sh "docker-compose rm || true"
              sh 'echo http_proxy: ${http_proxy} and https_proxy: ${https_proxy}'
              sh 'docker-compose build --build-arg HTTP_PROXY=${http_proxy} --build-arg HTTPS_PROXY=${https_proxy} --build-arg BUILD_ENV="ci"'
              sh 'sleep 10'
              //sh 'docker ps -q --filter ancestor=postgres:10.6 | grep -q . && docker stop $(docker ps -q --filter ancestor=postgres:10.6)'
              sh 'while curl http://localhost:5432/ 2>&1 | grep "52";do sleep 10; echo "sleeping";done'
              sh 'docker-compose up -d range-db range-service'
              sh 'sleep 10'
              sh 'docker ps'
              sh 'docker-compose logs range-service'
              sh 'docker-compose exec -T range-service sh -c "yarn audit && yarn lint && yarn test"'
              sh "docker-compose down || true"
              sh "docker-compose rm || true"
            }
          }
        }
        catch(Exception e){
           dir('kr-range-service') {
            sh "docker-compose down || true"
            sh "docker-compose rm || true"
          }
        }
      }
    }
    }

    stage('Range Service ECR stack') {
      environment {
        CFN_ENVIRONMENT = 'artefact'
      }
      steps {
        script {
          withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: "$CFN_SOURCE_PROJECT_ID-aws-${env.CFN_ENVIRONMENT}"]]) {
            docker.image("${ECR_HOST}/sharedtools/cfn_manage:latest").inside {
              sh './scripts/deploy_ecr.sh'
            }
          }
        }
      }
    }

    stage('Publish Range Service ECR Image') {
      environment {
        CFN_ENVIRONMENT = 'artefact'
      }
      steps {
        script {
          node {
            checkout scm
            dir('kr-range-service'){
              withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: "$CFN_SOURCE_PROJECT_ID-aws-${env.CFN_ENVIRONMENT}"]]) {
                def dockerBuild = docker.build("rangingtool/kr-range-service:${env.BUILD_ID}", "--build-arg HTTP_PROXY=${env.http_proxy} --build-arg HTTPS_PROXY=${env.https_proxy} -f Dockerfile .")
                docker.withRegistry(env.ECR_ENDPOINT) {
                  dockerBuild.push('latest')
                  dockerBuild.push("${env.DOCKER_IMAGE_TAG}")
                }
              }
            }
          }
        }
      }
    }

    stage('Upload Exceptions Sheet to S3 in dev and nonprod') {
      agent any
      steps {
        script {
          UploadExceptions("dev")
          UploadExceptions("nonprod")
        }
      }
    }

    stage('Deploy Cloudformation to dev') {
      agent any
      environment {
        ENVIRONMENT = 'dev'
        CFN_ENVIRONMENT = 'dev' //"datasvcs${ENVIRONMENT}"
      }
      steps{
        script{
          if (BRANCH_NAME.equals("master")) {
            env.PROCEED_DEPLOYMENT = "proceed"
          } else {
              try {
                timeout(time: 90, unit: 'SECONDS') {
                env.INPUT_MESSAGE = input message: "Do you want to deploy to ${env.ENVIRONMENT} ?", ok: 'ok',
                                parameters: [choice(name: 'INPUT_MESSAGE', choices: 'yes\nno')]

                  if (env.INPUT_MESSAGE.equals("no")) {
                    env.PROCEED_DEPLOYMENT = "stop"
                  }else if(env.INPUT_MESSAGE.equals("yes")){
                    env.PROCEED_DEPLOYMENT = "proceed"
                  }
              }
            } catch(err) {
              // abort also comes here
              env.PROCEED_DEPLOYMENT="timeout"
            }
          }
          ProceedDeploymentOnInput(env.PROCEED_DEPLOYMENT)
          PROCEED_DEPLOYMENT = "reset"
        }
      }
    }

    stage('Deploy Cloudformation to Non Prod') {
      agent any
      environment {
        ENVIRONMENT = 'nonprod'
        CFN_ENVIRONMENT = 'nonprod' //"datasvcs${ENVIRONMENT}"
      }
      steps{
        script{
            try {
              timeout(time: 90, unit: 'SECONDS') {
              INPUT_MESSAGE = input message: "Do you want to deploy to ${env.ENVIRONMENT} ?", ok: 'ok',
                              parameters: [choice(name: 'INPUT_MESSAGE', choices: 'yes\nno')]

                if (INPUT_MESSAGE.equals("no")) {
                  PROCEED_DEPLOYMENT = "stop"
                }else if(INPUT_MESSAGE.equals("yes")){
                  PROCEED_DEPLOYMENT = "proceed"
                }
            }
          } catch(err) {
            // abort also comes here
            PROCEED_DEPLOYMENT="timeout"
          }
          ProceedDeploymentOnInput(PROCEED_DEPLOYMENT)
          PROCEED_DEPLOYMENT = "reset"
        }
      }
    }

    stage('Upload Exceptions Sheet to S3 in prod') {
      agent any
      steps {
        script {
          if (BRANCH_NAME.equals("master")) {
            UploadExceptions("prod")
          } else {
            echo "Not a Master branch !!!! Not recommended to upload exceptions to prod !!!!"
          }
        }
      }
    }

    stage('Deploy Cloudformation to Prod') {
      agent any
      environment {
        ENVIRONMENT = 'prod'
        CFN_ENVIRONMENT = 'prod' //"datasvcs${ENVIRONMENT}"
      }
      steps{
        script{
          if(BRANCH_NAME.equals("master")){
            try {
              timeout(time: 90, unit: 'SECONDS') {
              INPUT_MESSAGE = input message: "Do you want to deploy to ${env.ENVIRONMENT} ?", ok: 'ok',
                              parameters: [choice(name: 'INPUT_MESSAGE', choices: 'yes\nno')]

                if (INPUT_MESSAGE.equals("no")) {
                  PROCEED_DEPLOYMENT = "stop"
                }else if(INPUT_MESSAGE.equals("yes")){
                  PROCEED_DEPLOYMENT = "proceed"
                }
              }
            } catch(err) {
              // abort also comes here
              PROCEED_DEPLOYMENT="timeout"
            }
          } else {
            echo " Not a Master branch !!!! Not recommended to deploy to prod !!!!"
          }
          ProceedDeploymentOnInput(PROCEED_DEPLOYMENT)
          PROCEED_DEPLOYMENT = "reset"
        }
      }
    }
  }

  post {
    always {
     dir('kr-range-service') {
        sh "docker-compose down || true"
        sh "docker-compose rm || true"
      }
      script {
        if (BRANCH_NAME == 'master') {
          CALLOUT = '@here '
        } else {
          CALLOUT = ''
        }
      }
    }

    success {
      echo "SUCCESS !!!!"
    }
    failure {
      echo "FAIL !!!"
    }
    unstable {
      echo 'Unstable'
    }
  }
}

def ProceedDeploymentOnInput(String inputStatus) {
  echo "ProceedDeploymentOnInput | inputStatus : ${inputStatus} "
  if (inputStatus.equals("proceed")) {
    try{
        echo "deploying to ${env.ENVIRONMENT}"
        response = "Started Deploying to ${env.ENVIRONMENT} !!!"
        slackSend(
          color: 'warning',
          channel: SLACK_NOTIFY_CHANNEL,
          message: ":warning: :eyes: ${response} :: Job - <${env.JOB_DISPLAY_URL}|${env.JOB_NAME} #${env.BUILD_NUMBER}>"
        )
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: "$CFN_SOURCE_PROJECT_ID-aws-${env.CFN_ENVIRONMENT}"]]) {
          docker.image("${ECR_HOST}/sharedtools/cfn_manage:latest").inside {
            sh "./scripts/deploy_cloudformation.sh ${env.DOCKER_IMAGE_TAG}"
          }
        }
      response = "Successfully Deployed to ${env.ENVIRONMENT} !!!"
      slackSend(
        color: 'good',
        channel: SLACK_NOTIFY_CHANNEL,
        message: ":beer: :beers: ${response}: Job - <${env.JOB_DISPLAY_URL}|${env.JOB_NAME} #${env.BUILD_NUMBER}>"
      )
    }catch(err){
      echo "deployment failed at ${env.ENVIRONMENT}"
      currentBuild.result = 'Failure'
      response = "Failed to deploy to ${env.ENVIRONMENT} !!!"
      catchError(stageResult: 'FAILURE') {
          slackSend(
            color: 'danger',
            channel: SLACK_NOTIFY_CHANNEL,
            message: ":fire: :fire_engine: :ambulance: ${response}: Job - <${env.JOB_DISPLAY_URL}|${env.JOB_NAME} #${env.BUILD_NUMBER}>"
          )
          sh "exit 1"
      }
    }
  }
  else if (inputStatus.equals("stop")) {
    currentBuild.result = 'SUCCESS'
    response = "Success , Not Deployed to ${env.ENVIRONMENT}"
    echo "Stopped by User,  Not Deployed to ${env.ENVIRONMENT}"
  }
  else{
    currentBuild.result = 'SUCCESS'
    response = "Success , Not Deployed to ${env.ENVIRONMENT}"
    echo "Timeout, No body wants to deploy this build ${env.ENVIRONMENT} "
  }
}

def UploadExceptions(String environment) {
  try {
    echo "Uploading Exceptions Sheet to S3 in ${environment}"
    withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: "$CFN_SOURCE_PROJECT_ID-aws-${environment}"]]) {
      if (fileExists("./kr-range-service/src/data/whitelist-blacklist-${environment}.csv")) {
        sh "aws s3 cp ./kr-range-service/src/data/whitelist-blacklist-${environment}.csv s3://kmartau-rangingtool-${environment}-range-service-inputs/upload-whitlelist-blacklist/whitelist-blacklist.csv --sse"
        slackSend(
          color: 'good',
          channel: SLACK_EXCEPTIONS_UPLOAD_NOTIFY_CHANNEL,
          message: ":beer: :beers: Successfully Uploaded Exceptions Sheet to S3 in ${environment} !!!"
        )
      } else {
        echo "Exceptions Sheet does not exist for ${environment}"
      }
    }
  } catch (err) {
    echo "Uploading Exceptions Sheet to S3 failed in ${environment}"
    catchError(stageResult: 'FAILURE') {
      slackSend(
        color: 'danger',
        channel: SLACK_EXCEPTIONS_UPLOAD_NOTIFY_CHANNEL,
        message: ":fire: :fire_engine: :ambulance: Uploading Exceptions Sheet to S3 failed in ${environment}"
      )
      sh "exit 1"
    }
  }
}
