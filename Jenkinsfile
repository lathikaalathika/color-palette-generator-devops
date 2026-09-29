pipeline {

  agent any

  environment {
    IMAGE_REPO = credentials('docker-image-repo')
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    disableConcurrentBuilds()
    timeout(time: 30, unit: 'MINUTES')
  }

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build and Test') {
      steps {
        bat 'npm ci'
        bat 'npm run typecheck'
        bat 'npm run lint'
        bat 'npm run build'
      }
    }

    stage('Docker Build') {
      steps {
        bat 'docker info'
        bat 'docker build --network=host -t %IMAGE_REPO%:%BUILD_NUMBER% -t %IMAGE_REPO%:latest .'
      }
    }

    stage('Docker Push') {
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: 'docker-registry',
            usernameVariable: 'REG_USER',
            passwordVariable: 'REG_PASS'
          )
        ]) {

          bat '''
            @echo off

            echo Logging in to Docker Hub...

            powershell -NoProfile -Command "$env:REG_PASS | docker login --username $env:REG_USER --password-stdin"

            if errorlevel 1 (
              echo Docker Hub login failed.
              exit /b 1
            )

            echo Docker Hub login successful.

            echo Pushing build image...
            docker push %IMAGE_REPO%:%BUILD_NUMBER%

            if errorlevel 1 (
              echo Build image push failed.
              exit /b 1
            )

            echo Pushing latest image...
            docker push %IMAGE_REPO%:latest

            if errorlevel 1 (
              echo Latest image push failed.
              exit /b 1
            )

            echo Docker images pushed successfully.
          '''
        }
      }
    }

  }

  post {
    success {
      echo '========================================'
      echo 'JENKINS PIPELINE COMPLETED SUCCESSFULLY!'
      echo 'GitHub -> Build/Test -> Docker -> Docker Hub'
      echo '========================================'
    }

    failure {
      echo 'Jenkins pipeline failed. Check the stage logs above.'
    }

    always {
      bat 'docker logout >nul 2>&1 || exit /b 0'
      cleanWs()
    }
  }

}