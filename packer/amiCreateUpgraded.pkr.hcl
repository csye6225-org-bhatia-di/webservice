
variable "ami_source_owner" {
  type    = string
  default = "274019733827"
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "source_ami" {
  type    = string
  default = "ami-033b95fb8079dc481"
}

variable "ssh_username" {
  type    = string
  default = "ec2-user"
}

variable "subnet_id" {
  type    = string
  default = "subnet-03c9315defccfa591"
}

variable "vpc_id" {
  type    = string
  default = "vpc-0d35bc197f9c58ebf"
}

variable "aws_access_key" {
  type= string
  default = env("AWS_ACCESS_KEY_ID")
}
variable "aws_secret_key" {
  type= string
  default = env("AWS_SECRET_ACCESS_KEY")
}

locals { timestamp = regex_replace(timestamp(), "[- TZ:]", "") }

source "amazon-ebs" "webservice" {
  access_key      = "${var.aws_access_key}"
  region       =  "${var.aws_region}"
  secret_key   = "${var.aws_secret_key}"
  ami_description = "AMI for CSYE-6225"
  ami_name        = "webservice_ami_${local.timestamp}"
  ami_users       = ["105634846355"]
  instance_type   = "t2.micro"
  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/xvda"
    volume_size           = 8
    volume_type           = "gp2"
  }
 
  source_ami   = "${var.source_ami}"
  ssh_timeout  = "30m"
  ssh_username = "${var.ssh_username}"
  subnet_id    = "${var.subnet_id}"
  vpc_id       = "${var.vpc_id}"
}

build {
  sources = ["source.amazon-ebs.webservice"]

  provisioner "file" {
    destination = "/tmp/webservice.zip"
    source      = "packer/webservice.zip"
  }

  provisioner "file" {
    destination = "/tmp/pgdg.repo"
    source      = "packer/pgdg.repo"
  }

  provisioner "file" {
    destination = "/tmp/webservice.service"
    source      = "packer/webservice.service"
  }

  provisioner "shell" {
    scripts = ["packer/package.sh"]
  }

}
