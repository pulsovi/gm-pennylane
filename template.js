// ==UserScript==
// @name     Pennylane
// @version  0.1.4
// @grant    unsafeWindow
// @grant    GM.openInTab
// @match    https://app.pennylane.com/companies/*
// @icon     https://app.pennylane.com/favicon.ico
// ==/UserScript==

const code = ';(function IIFE() {'+/*main*/+'})();';
try {
  setInterval(() => {
    const data = document.querySelector('.open_tab');
    if (!data) return;
    const url = unescape(data.dataset.url);
    console.log('GM_openInTab', {data, url});
    data.remove();
    GM.openInTab(url, { active: false, insert: true });
  }, 2000);
  unsafeWindow.eval(code);
  console.log('GM SUCCESS');
} catch (error) {
  console.log('GM ERROR');
  console.log({error, line: code.split('\n')[error.lineNumber-1]});
}
