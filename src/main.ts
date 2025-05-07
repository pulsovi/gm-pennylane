import { openTabService } from './GM/openTabService.js';
import { XmlHttpRequest } from './GM/xmlHttpRequest.js';

const code = ';(function IIFE() {'+evalContent+'})();';
try {
  // inject eval.ts
  const blob = new Blob([code], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const script = document.createElement('script');
  script.src = url;
  script.onload = () => { URL.revokeObjectURL(url); };
  unsafeWindow.document.body.appendChild(script);

  // start services
  openTabService();
  XmlHttpRequest.start();
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
