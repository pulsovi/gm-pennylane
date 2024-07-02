// ==UserScript==
// @name     Pennylane
// @version  0.1.2
// @grant    unsafeWindow
// @match    https://app.pennylane.com/companies/*
// @icon     https://app.pennylane.com/favicon.ico
// ==/UserScript==

const code = ';(function IIFE() {'+/*main*/+'})();';
try {
  unsafeWindow.eval(code);
  console.log('GM SUCCESS');
} catch (error) {
  console.log('GM ERROR');
  console.log({error, line: code.split('\n')[error.lineNumber-1]});
}
