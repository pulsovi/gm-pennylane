import { openTabService } from './GM/openTabService.js';

const code = ';(function IIFE() {'+evalContent+'})();';
try {
  unsafeWindow.eval(code);
  openTabService();
  console.log('GM SUCCESS');
} catch (error) {
  console.log('GM ERROR');
  console.log({error, line: code.split('\n')[error.lineNumber-1]});
}

declare global {
  const evalContent: string;
  interface Window {
    eval(code: string): any;
  }
}
