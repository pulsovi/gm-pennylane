import { openTabService } from './GM/openTabService.js';

const code = ';(function IIFE() {'+/*eval*/+'})();';
try {
  unsafeWindow.eval(code);
  openTabService();
  console.log('GM SUCCESS');
} catch (error) {
  console.log('GM ERROR');
  console.log({error, line: code.split('\n')[error.lineNumber-1]});
}
