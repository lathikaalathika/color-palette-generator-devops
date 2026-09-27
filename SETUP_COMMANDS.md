# First GitHub setup

Open this folder in VS Code terminal:

```powershell
git init
git add .
git commit -m "Initial Color Palette Generator DevOps project"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/color-palette-generator.git
git push -u origin main
git checkout -b develop
git push -u origin develop
```

Do not add AWS credentials, Docker passwords, SSH keys or kubeconfig files.
