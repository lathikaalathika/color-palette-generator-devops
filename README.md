# Color Palette Generator — AWS DevOps Project

React + TypeScript Color Palette Generator deployed through:

GitHub → Jenkins → Docker → Docker Hub → Terraform → Ansible → AWS EKS → Kubernetes

## Application
- Generates 5 random colors
- HEX/RGB values
- Copy buttons
- Color locking
- Responsive UI

## Local
```bash
npm ci
npm run dev
npm run build
npm run lint
```

## Docker
Replace `YOUR_DOCKERHUB_USERNAME` with your username:
```bash
docker build -t YOUR_DOCKERHUB_USERNAME/color-palette-generator:latest .
docker run --rm -p 8080:80 YOUR_DOCKERHUB_USERNAME/color-palette-generator:latest
```

## GitHub
Branches:
- main = production
- develop = integration
- feature/* = features
- fix/* = bug fixes

Use pull requests and protect `main`.

## Jenkins
Create Jenkins credentials:
- `docker-registry`: Docker Hub username + access token
- `docker-image-repo`: secret text such as `YOUR_DOCKERHUB_USERNAME/color-palette-generator`

The Jenkins agent needs Git, Node/npm, Docker, Terraform, Ansible, AWS CLI and kubectl.

Configure a GitHub webhook/multibranch pipeline so pushes and pull requests trigger Jenkins.

## Terraform
Configure AWS authentication securely. Do not commit access keys.

```bash
cd terraform
terraform init
terraform fmt
terraform validate
terraform plan
terraform apply
```

This uses official Terraform AWS VPC/EKS modules to provision networking and an EKS managed node group.

Then:
```bash
aws eks update-kubeconfig --region us-east-1 --name colorpalette-cluster
kubectl get nodes
```

## Ansible
Use Ansible for separately provisioned Linux utility/Jenkins servers. Edit `ansible/inventory.ini` and run:
```bash
cd ansible
ansible-playbook -i inventory.ini site.yml
```

EKS managed worker nodes are managed by AWS and do not need the old self-managed Kubernetes setup playbook.

## Kubernetes
The `k8s` directory contains:
- namespace
- configmap
- deployment
- service
- ingress
- HPA

The Deployment has rolling updates, readiness/liveness probes and multiple replicas.

```bash
kubectl apply -f k8s/
kubectl -n colorpalette get pods
kubectl -n colorpalette get svc
kubectl -n colorpalette get ingress
kubectl -n colorpalette get hpa
```

An Ingress Controller must be installed in EKS for the Ingress resource to receive external traffic. Configure DNS/TLS for a real production URL.

## Security
Never commit AWS keys, Docker passwords, SSH private keys, kubeconfig files or sensitive Terraform state. Use Jenkins Credentials and AWS IAM roles.

## Important
The project files are complete and consistent, but external accounts/services still require your own authentication and setup: GitHub repository, Jenkins server, Docker Hub repository, AWS account and Ingress/DNS.
