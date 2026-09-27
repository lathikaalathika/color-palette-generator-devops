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
    stage('Checkout') { steps { checkout scm } }
    stage('Build and Test') {
      steps {
        sh 'npm ci'
        sh 'npm run typecheck'
        sh 'npm run lint'
        sh 'npm run build'
      }
    }
    stage('Docker Build') {
      steps {
        sh 'docker build -t ${IMAGE_REPO}:${BUILD_NUMBER} -t ${IMAGE_REPO}:latest .'
      }
    }
    stage('Docker Push') {
      when { branch 'main' }
      steps {
        withCredentials([usernamePassword(credentialsId: 'docker-registry',
          usernameVariable: 'REG_USER', passwordVariable: 'REG_PASS')]) {
          sh '''
            echo "$REG_PASS" | docker login -u "$REG_USER" --password-stdin
            docker push ${IMAGE_REPO}:${BUILD_NUMBER}
            docker push ${IMAGE_REPO}:latest
          '''
        }
      }
    }
    stage('Terraform') {
      when { branch 'main' }
      steps {
        dir('terraform') {
          sh 'terraform init -input=false'
          sh 'terraform validate'
          sh 'terraform apply -input=false -auto-approve'
        }
      }
    }
    stage('Ansible') {
      when { branch 'main' }
      steps {
        dir('ansible') {
          sh 'ansible-playbook -i inventory.ini site.yml --extra-vars "image_repo=${IMAGE_REPO} image_tag=${BUILD_NUMBER}"'
        }
      }
    }
    stage('Deploy to EKS') {
      when { branch 'main' }
      steps {
        sh '''
          aws eks update-kubeconfig --region ${AWS_REGION} --name ${CLUSTER_NAME}
          kubectl apply -f k8s/namespace.yaml
          kubectl apply -f k8s/configmap.yaml
          sed "s|IMAGE_REPO|${IMAGE_REPO}|g; s|IMAGE_TAG|${BUILD_NUMBER}|g" k8s/deployment.yaml | kubectl apply -f -
          kubectl apply -f k8s/service.yaml
          kubectl apply -f k8s/hpa.yaml
          kubectl apply -f k8s/ingress.yaml
          kubectl -n ${NAMESPACE} rollout status deployment/colorpalette --timeout=180s
        '''
      }
    }
  }
  post {
    always {
      sh 'docker logout || true'
      cleanWs()
    }
  }
}
