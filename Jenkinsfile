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
        bat 'docker build -t %IMAGE_REPO%:%BUILD_NUMBER% -t %IMAGE_REPO%:latest .'
      }
    }

    stage('Docker Push') {
      when {
        branch 'main'
      }
      steps {
        withCredentials([
          usernamePassword(
            credentialsId: 'docker-registry',
            usernameVariable: 'REG_USER',
            passwordVariable: 'REG_PASS'
          )
        ]) {
          bat '''
            echo %REG_PASS% | docker login -u %REG_USER% --password-stdin
            docker push %IMAGE_REPO%:%BUILD_NUMBER%
            docker push %IMAGE_REPO%:latest
          '''
        }
      }
    }

    stage('Terraform') {
      when {
        branch 'main'
      }
      steps {
        dir('terraform') {
          bat 'terraform init -input=false'
          bat 'terraform validate'
          bat 'terraform apply -input=false -auto-approve'
        }
      }
    }

    stage('Ansible') {
      when {
        branch 'main'
      }
      steps {
        dir('ansible') {
          bat 'ansible-playbook -i inventory.ini site.yml --extra-vars "image_repo=%IMAGE_REPO% image_tag=%BUILD_NUMBER%"'
        }
      }
    }

    stage('Deploy to EKS') {
      when {
        branch 'main'
      }
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