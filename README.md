# IT Guide Tool

A lightweight web-based troubleshooting application that uses decision trees to guide users through common IT problems.

Instead of presenting long documents or checklists, the application walks users through one decision at a time. Each answer determines the next action, helping users troubleshoot issues in a structured and easy-to-follow way.

The same guide data is used to generate:

* Interactive troubleshooting guides
* Visual flowchart diagrams
* Printable PDF-friendly documentation

The project is designed as a static website and can be hosted directly on GitHub Pages.

---

## Features

* Decision-tree based troubleshooting
* Interactive step-by-step workflow
* Mermaid flowchart generation
* Printable guide output
* Dark and light theme support
* Mobile-friendly design
* Modular guide structure
* Static GitHub Pages hosting
* No frameworks required

---

## Available Guides

### Internet Issues

Troubleshoot common internet connectivity problems.

Topics include:

* Connection checks
* Router and modem restarts
* Testing additional devices
* ISP outage checks
* Escalation to providers

### Email Issues

Troubleshoot common email problems.

Topics include:

* Internet connectivity
* Webmail access
* Password verification
* Mailbox storage limits
* Email client configuration

### Printer Issues

Troubleshoot common printer problems.

Topics include:

* Power and status checks
* USB and network connectivity
* Print queue issues
* Ink, toner and paper checks
* Driver reinstallation

---

## How It Works

Each guide is stored as a decision tree.

Example:

```text
Can you browse to a website?

├─ Yes
│  └─ Issue resolved
│
└─ No
   └─ Restart router
      │
      ├─ Fixed
      │  └─ Issue resolved
      │
      └─ Still broken
         └─ Test another device
```

Each node contains:

* A title
* Instructions
* Optional button labels
* A success path
* A failure path

The application automatically generates the user interface, flowchart, and printable guide from the same data.

---

## Project Structure

```text
index.html

css/
└── style.css

js/
├── app.js
├── core/
│   └── decisionTreeUtils.js
├── pages/
│   ├── homePage.js
│   └── guidePage.js
├── panes/
│   ├── IntroPane.js
│   ├── DecisionTreePane.js
│   ├── DecisionTreeDiagramPane.js
│   └── DecisionTreePrintPane.js
└── data/
    ├── intro.js
    ├── introCards.js
    └── guides/
        ├── internetIssues.js
        ├── emailIssues.js
        ├── printerIssues.js
        └── index.js
```

---

## Adding a New Guide

### Create a Guide File

Create a file in:

```text
js/data/guides/
```

Example:

```javascript
window.passwordResetGuide = {
  title: "Password Reset",
  startNode: "checkAccount",
  nodes: {
    checkAccount: {
      title: "Can you access the account?",
      body: [
        "Attempt to log in using your current password."
      ],
      successLabel: "Yes",
      failLabel: "No",
      successNext: "resolved",
      failNext: "resetPassword"
    }
  }
};
```

### Register the Guide

Add it to:

```javascript
window.guides = {
  internetIssues: window.internetIssuesGuide,
  emailIssues: window.emailIssuesGuide,
  printerIssues: window.printerIssuesGuide,
  passwordReset: window.passwordResetGuide
};
```

### Add a Home Page Card

Add a new card entry in:

```text
js/data/introCards.js
```

The guide will automatically work with:

* DecisionTreePane
* DecisionTreeDiagramPane
* DecisionTreePrintPane

---

## Technologies

* HTML5
* CSS3
* JavaScript (ES6)
* Mermaid.js

No build process, package manager, backend service, or framework is required.

---

## Design Goals

* Keep troubleshooting simple and structured
* Use decision trees rather than large instruction documents
* Make guides easy to create and maintain
* Generate diagrams from guide data automatically
* Support printable documentation
* Remain lightweight and easy to host

---

## Future Improvements

Potential future enhancements:

* Additional troubleshooting guides
* Search functionality
* Guide categories
* Screenshots and diagrams within guides
* User-created guides
* Import/export support
* Knowledge base integration

---

## License

MIT License
