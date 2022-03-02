packer {
  required_plugins {
    amazon = {
      version = ">= 0.0.1"
      source  = "github.com/hashicorp/amazon"
    }
  }
}





source "amazon-ebs" "ubuntu" {
  ami_name      = "webservice-ami"
  ssh_username = "ec2-user"
  instance_type = "t2.micro"
  region        = "us-east-1"
  source_ami = "ami-033b95fb8079dc481" 
  access_key = "$var.access_key"
  secret_key = "$var.secret_key"
}


build {
  name    = "webservice-build-ami"
  
  sources = [
    "source.amazon-ebs.ubuntu"
  ]

  provisioner "file" {
      source = "packer/webservice.zip"
      destination = "/tmp/webservice.zip"
  }
   provisioner "file" {
      source = "packer/pgdg.repo"
      destination = "/tmp/pgdg.repo"
  }
  provisioner "file" {
      source = "packer/webservice.service"
      destination = "/tmp/webservice.service"
  }

  provisioner "shell" {
      script = "packer/package.sh"
  }
}