pipeline {

  agent any

  environment {
    IMAGE_REPO = credentials('docker-image-repo')
    AWS_REGION = 'us-east-1'
    CLUSTER_NAME = 'colorpalette-cluster'
    NAMESPACE = 'colorpalette'
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
        echo %REG_PASS% | docker login https://index.docker.io/v1/ --username %REG_USER% --password-stdin

        if errorlevel 1 (
          echo Docker Hub login failed.
          exit /b 1
        )

        echo Docker Hub login successful.

        echo Pushing build image...
        docker push %IMAGE_REPO%:%BUILD_NUMBER%

        if errorlevel 1 exit /b 1

        echo Pushing latest image...
        docker push %IMAGE_REPO%:latest

        if errorlevel 1 exit /b 1

        echo Docker images pushed successfully.
      '''
    }
  }
}

    stage('Terraform') {
      steps {
        dir('terraform') {
          bat 'terraform init -input=false'
          bat 'terraform validate'
          bat 'terraform apply -input=false -auto-approve'
        }
      }
    }

    stage('Ansible') {
      steps {
        dir('ansible') {
          bat 'ansible-playbook -i inventory.ini site.yml --extra-vars "image_repo=%IMAGE_REPO% image_tag=%BUILD_NUMBER%"'
        }
      }
    }

    stage('Deploy to EKS') {
      steps {
        bat '''
          aws eks update-kubeconfig --region %AWS_REGION% --name %CLUSTER_NAME%
          kubectl apply -f k8s/namespace.yaml
          kubectl apply -f k8s/configmap.yaml
          powershell -Command "(Get-Content k8s/deployment.yaml) -replace 'IMAGE_REPO','%IMAGE_REPO%' -replace 'IMAGE_TAG','%BUILD_NUMBER%' | kubectl apply -f -"
          kubectl apply -f k8s/service.yaml
          kubectl apply -f k8s/hpa.yaml
          kubectl apply -f k8s/ingress.yaml
          kubectl -n %NAMESPACE% rollout status deployment/colorpalette --timeout=180s
        '''
      }
    }

  }

  post {
    always {
      bat 'docker logout || exit /b 0'
      cleanWs()
    }
  }

}