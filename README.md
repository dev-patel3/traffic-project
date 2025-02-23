Traffic Junction Modelling Software

Welcome to the Traffic Junction Simulation software! This guide will help you set up and run the software on your computer.

------------------------------------------------------------
PREREQUISITES
------------------------------------------------------------
Before installing the software, ensure your computer meets the following requirements:

Operating System:
  - Windows 10 or later, macOS, or Linux

Python:
  - Version 3.10 or later
  - Download from: https://python.org

Node.js:
  - Version 18.x or later
  - Download from: https://nodejs.org/en

PostgreSQL:
  - Version 14 or later
  - Download from: https://www.postgresql.org/download/
  - To start PostgreSQL, run the following command in your terminal:
      sudo service postgresql start

------------------------------------------------------------
DOWNLOADING AND SETTING UP THE PROJECT
------------------------------------------------------------
1. Download the project files.
2. Navigate to the project folder in your terminal.

------------------------------------------------------------
BACKEND SETUP
------------------------------------------------------------
Run the following commands in order:

  cd backend
  pip install -r requirements.txt
  pip install -U flask-cors
  python app.py

------------------------------------------------------------
FRONTEND SETUP
------------------------------------------------------------
In a separate terminal, navigate to the project folder and run:

  cd frontend
  npm install
  npm install react-scripts
  npm install lucide-react
  npm install @radix-ui/react-toast
  npm install @radix-ui/react-switch
  npm install @radix-ui/react-tooltip
  npm start

------------------------------------------------------------
RUNNING THE PROGRAM
------------------------------------------------------------
After completing the setup steps, your program should now be successfully running!

------------------------------------------------------------
NEED HELP?
------------------------------------------------------------
For additional assistance, please contact our support team at example@email.com