# Quiz Management System

A web-based Quiz Management System built using HTML, CSS, JavaScript, Node.js, and Express.js. The project allows users to create accounts, log in, select quiz subjects and difficulty levels, attempt timed quizzes, view scores, review answers, and track previous quiz results.

## Features

- User signup system
- User login system
- Protected pages after login
- Subject-wise quiz selection
- Difficulty level selection
- Available quiz subjects:
  - HTML
  - CSS
  - JavaScript
- Available difficulty levels:
  - Low
  - Medium
  - High
- Timed quiz attempt
- Question navigation
- Automatic quiz submission when time ends
- Score calculation
- Percentage calculation
- Pass/Fail result status
- Answer review with chosen and correct answers
- Result history for each user
- View all previous attempts
- Text-file based data storage
- Responsive frontend design
- Express.js backend API
- CORS-enabled backend server

## Tech Stack

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- CORS
- Text file storage

## Project Structure

```text
Projects/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── questions.txt
│   ├── users.txt
│   └── results.txt
├── frontend/
│   ├── index.html
│   ├── signup.html
│   ├── dashboard.html
│   ├── select.html
│   ├── quiz.html
│   ├── result.html
│   ├── allresults.html
│   ├── style.css
│   └── script.js
├── Project Report.docx
├── Project Report.pdf
├── README.md
└── .gitignore

Installation
Clone the repository:

git clone https://github.com/your-username/Quiz-Management-System.git
cd Quiz-Management-System
Go to the backend folder:

cd backend
Install dependencies:

npm install
Start the server:

npm start
Open the app in your browser:

http://localhost:3000
API Features
The Express server provides endpoints for:

User signup
User login
Fetch quiz questions
Filter questions by subject and level
Submit quiz answers
Calculate score and percentage
Generate pass/fail result
Store quiz result
Fetch user result history
Data Storage
The project stores data in text files inside the backend folder:

users.txt
questions.txt
results.txt
users.txt stores registered user login details.
questions.txt stores quiz questions, options, answers, subject, and level.
results.txt stores submitted quiz results and answer reviews.
Question Format
Questions are stored in questions.txt using this format:

Question|Option A|Option B|Option C|Option D|Correct Option|Subject|Level
Example:

What is HTML?|Markup|Programming|DB|OS|A|html|low
Important Note
Do not upload node_modules to GitHub. It can be regenerated using:

npm install
If users.txt or results.txt contains real user data, clear it before uploading publicly.

Author
Created by Sachin.


**Recommended `.gitignore`**

```gitignore
node_modules/
npm-debug.log*
.env

.DS_Store
Thumbs.db

*.log

.vscode/
.idea/

# Optional: ignore private user/result data
# backend/users.txt
# backend/results.txt
Files You Should Upload

Upload these:

backend/server.js
backend/package.json
backend/package-lock.json
backend/questions.txt
backend/users.txt
backend/results.txt
frontend/index.html
frontend/signup.html
frontend/dashboard.html
frontend/select.html
frontend/quiz.html
frontend/result.html
frontend/allresults.html
frontend/style.css
frontend/script.js
Project Report.docx
Project Report.pdf
README.md
.gitignore
Do Not Upload These

backend/node_modules/
npm-debug.log
.env
GitHub About Section

Description:
A web-based Quiz Management System using HTML, CSS, JavaScript, Node.js, Express.js, and text-file storage with login, quiz selection, timed attempts, result calculation, answer review, and result history.
