variable "aws_region" { type = string default = "us-east-1" }
variable "project_name" { type = string default = "colorpalette" }
variable "cluster_name" { type = string default = "colorpalette-cluster" }
variable "kubernetes_version" { type = string default = "1.33" }
variable "node_count" { type = number default = 2 }
variable "node_instance_type" { type = string default = "t3.medium" }
