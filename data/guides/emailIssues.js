// STATE
window.emailIssuesGuide = {
  title: "Email Issues",
  startNode: "checkInternet",
  nodes: {
    checkInternet: {
      title: "Check internet connection",
      body: [
        "Confirm internet is working."
      ],
      successLabel: "Working",
      failLabel: "Not Working",
      successNext: "checkWebmail",
      failNext: "internetGuideNote"
    },
    internetGuideNote: {
      title: "Use Internet Issues guide first",
      body: [
        "Use the Internet Issues guide first, then return to this guide once the internet connection is working."
      ],
      successNext: null,
      failNext: null
    },
    checkWebmail: {
      title: "Check webmail",
      body: [
        "Try logging into webmail in a browser."
      ],
      successLabel: "Can Log In",
      failLabel: "Cannot Log In",
      successNext: "checkEmailApp",
      failNext: "checkPassword"
    },
    checkPassword: {
      title: "Check email address and password",
      body: [
        "Confirm email address and password.",
        "Reset password if needed."
      ],
      successLabel: "Fixed",
      failLabel: "Still Broken",
      successNext: "checkEmailApp",
      failNext: "contactProvider"
    },
    checkEmailApp: {
      title: "Check email app",
      body: [
        "Check Outlook/Mail app settings.",
        "Restart the app."
      ],
      successLabel: "Fixed",
      failLabel: "Still Broken",
      successNext: "resolved",
      failNext: "checkStorage"
    },
    checkStorage: {
      title: "Check mailbox storage",
      body: [
        "Check mailbox storage/quota.",
        "Delete or archive old mail if full."
      ],
      successLabel: "Fixed",
      failLabel: "Still Broken",
      successNext: "resolved",
      failNext: "contactProvider"
    },
    contactProvider: {
      title: "Contact provider or IT support",
      body: [
        "Contact email provider or IT support."
      ],
      successNext: null,
      failNext: null
    },
    resolved: {
      title: "Resolved",
      body: [
        "Email issue resolved."
      ],
      successNext: null,
      failNext: null
    }
  }
};
