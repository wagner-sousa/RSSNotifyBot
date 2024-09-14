# 🤖 RSS NOTIFY BOT
> _A simple method to send notification reading a feed web_

## Technologies
![GitHub repo size](https://img.shields.io/github/repo-size/wagner-sousa/gitlab-release-notification?style=for-the-badge)
![GitHub language count](https://img.shields.io/github/languages/count/wagner-sousa/gitlab-release-notification?style=for-the-badge)
![GitHub forks](https://img.shields.io/github/forks/wagner-sousa/gitlab-release-notification?style=for-the-badge)

* [Node](https://nodejs.org/en/)
* [Typescript](https://www.typescriptlang.org/) _(This is my first project with Typescript_ 😄 _)_
* [Google Apps Script](https://developers.google.com/apps-script/) _(You need a Google account)_
* [Docker](https://www.docker.com/) (optional for local environment)
* [VS Code](https://code.visualstudio.com/) (optional but recommended for local environment)
* [CLASP](https://github.com/google/clasp) (library to Google Apps Script)

## Install Project

### Clone the project
```bash
git clone https://github.com/wagner-sousa/gitlab-release-notification.git
```

### Dependencies
**If** (you use the VS Code with Dev Containers)
- you don't need to install anything 😎

**Else**
After downloading the project, you need to install the dependencies:
```bash
npm install
```

## Setup Google Account
<sup>_This project uses the [clasp package](https://github.com/google/clasp) for managing Google Apps Script._</sup>

So, you need to setup your Google account, for that you need to run:
```bash
npm run login
```
This command will returns a link authentication.

<sup>_Probably, you need to authorize a [Google Apps Script API](https://script.google.com/home/usersettings) for you user account to continue._</sup>

***This is very important. Without this, you don't publish/deploy your script***

<sup>Case this you firt time, you need to read the [clasp package](https://github.com/google/clasp) documentation for a setup account and a create a new project.</sup>

### Run Project
Were created many default properties to run the script.(_You can see them in the [Google Apps Script Documentation](https://developers.google.com/apps-script/guides/properties?hl=pt-br)_)

<sup>*Note: negrite property is required*</sup>

* **`RSS_URL`** - Feed URL for RSS use `;` to separate for multiple URLs. (See [documentation](https://www.rss2json.com/))
* **`GOOGLE_CHAT_WEBHOOKS`** - Webhooks URL for Google Chat use `;` to separate for multiple URLs. (See [documentation](https://developers.google.com/chat/how-tos/webhooks))
