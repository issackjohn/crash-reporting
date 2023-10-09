const popup = window.open('https://localhost:8443', 'popup', 'width=600,height=400');

console.log(popup);
setTimeout(() => {
    popup.postMessage("test", "*");
}, 3000);

// Deprecation
const webkitStorageInfo = window.webkitStorageInfo;
console.log(navigator.userAgent);

// Document policy violation
try {
  document.write("<h1>Hey!</h1>");
} catch (e) {
  console.log(e);
}

// Browser intervention
window.navigator.vibrate(1);

// Experimental: permissions policy violation
navigator.mediaDevices.getUserMedia({ audio: true }).catch(e => {});