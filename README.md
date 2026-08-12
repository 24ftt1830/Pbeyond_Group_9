# 🚀 Hello and welcome team, 
I've set up some constraints and standards so that our code will not be jumbled up and to also prevent file corruption.
<br>
<br>

## Here's how you should Push your work
1. **Get the latest code** - `git checkout main` then `git pull origin main`.

2. **Start your work** - Add the features or edit the design. Be *specific* about your Pull Request changes. E.g., If you're working on the login page then, `git switch -c feature/new-button`.

3. **Save changes** - `git add .` <- don't forget the full stop.

4. **Label** - Be descriptive and concise. `git commit -m "Add blue submit button to contact form"`. 

5. **Upload** - `git push origin feature/new-button`.
<br>
<br>
## It's not done yet! You still have to trigger a Pull Request
- Go to your repository website in your browser.

- Look for the **"Compare & pull request"** button at the top.

- Provide a brief description of your changes and click **"Create Pull Request"**.
<br>
<br>
## What happens next?
I will review the code (as the repo owner) to ensure that the new changes will be able to safely merge into the main branch and not break the app.
<br>
<br>
# Summary Table
| Action | Command |
| :--- | :--- |
| **Get latest code** | `git pull origin main` |
| **New Branch** | `git switch -c branch-name` |
| **Stage Changes** | `git add .` |
| **Commit Work** | `git commit -m "Your message"` |
| **Upload Work** | `git push origin branch-name` |
| **Switch Branches** | `git switch branch-name` |


PBeyond Group 9 (Cohort 2): Phase 2 Development

This repository contains the PBeyond web application maintained by Cohort 2. The codebase has been migrated from the previous cohort repository and will be used for all future development, testing, and collaboration.

The project is built with Laravel, Inertia.js, React, TypeScript (.tsx), and Vite.

Step 1: Clone the Repository
Open Git Bash, PowerShell, or Terminal.
Navigate to the folder where you want to store the project.
Run the following command:

`git clone https://github.com/24ftt1830/Pbeyond_Group_9.git`

Open the project folder:

`cd Pbeyond_Group_9`

Proceed to Step 2.

## Step 2: Install Dependencies


## Important: Run the following commands in order.

PHP / Laravel Dependencies

`composer install`

React / JavaScript Dependencies

`npm install`

## Step 3: Environment Setup

If you are using PowerShell on Windows:

`Copy-Item .env.example .env`

If you are using Command Prompt (CMD):

`copy .env.example .env`

If you are using Git Bash:

`cp .env.example .env`

Note: It is normal if no output appears after pressing Enter.

Generate the Laravel application key:

`php artisan key:generate`

## Step 4: Database Setup

Configure your database credentials in the `.env` file, then run the following commands in order:

`php artisan migrate`

`php artisan db:seed`

You are now ready to run the project.

## Running the Project

If using Laravel Herd, access the project through your Herd domain (for example, `http://pbeyond.test`).

Otherwise, start the backend and frontend separately.

Open **VS Code** and create two terminals.

Terminal 1

`php artisan serve`

Terminal 2

`npm run dev`

## Important

Do not close these two terminals while developing the project.

The React + TypeScript frontend is compiled by Vite, so npm run dev must remain running during development.

If the website takes longer than usual to load on the first run, it is normal. Wait a few moments and refresh the browser until the application loads successfully.
