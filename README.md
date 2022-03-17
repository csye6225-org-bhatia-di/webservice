# webservice
Description: Webservice with nodejs , Postgres , Sequelize ORM & Github actions

# Assumption: GitHub SSH Keys are set up on your user account
# Added update

# Installations
1. Install VSCode. Go to the link -> https://code.visualstudio.com/download
2. As per your system requirements locally, please download the Visual Studio and follow the required installation steps
3. Install Git & Git Bash. Go to the link -> https://git-scm.com/downloads
4. Install Postman.
5. Install the latest node Version. Go to the link -> https://nodejs.org/en/download/
6. Install PostgreSQL
7. Install pyadmin4 UI to access databases
8. Open GitHub Bash
9. Clone the repo using command -> Run command -> git clone git@github.com:csye6225-org-bhatia-di/webservice.git

10. Add the forked repo as a remote -> Run command -> git remote add <YOUR-USERNAME> git@github.com:csye6225-org-bhatia-di/webservice.git
11. Check out a new branch on remote
12. In order to run the web application locally, open your terminal
13. Go to directory -> Your_Location/webservice
14. Start terminal
15. Run command npm install
16. Run command npm run db-create
17. Run command npm run db-migrate
18. Run command npm run db-reset to undo all migrations
19. In order to run the test cases, run command npm test

# POSTGRESQL Commands in depth


A. \l : list all database 

B. \c DBNAME: move inside a database

C. \dt DBNAME: show table in a database


#Zip and copy file intp ec2 instance
1. Goto pem direcotry
2. scp -i assignment5.pem webservice.zip ec2-user@3.143.232.254:/tmp

# Linux commands
pwd current directory
la -la list with permissions
rm -rf dirName
unlink filename
ps aux | grep node -> list all process
