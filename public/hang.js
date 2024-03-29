// https://github.com/torch2424/wasm-by-example/blob/master/demo-util/
// export const wasmBrowserInstantiate = async (wasmModuleUrl, importObject) => {
//   let response = undefined;

//   if (!importObject) {
//     importObject = {
//       imports : {
//         imported_func: (arg) => {while (true) {}},
//       },
//       env: {
//         abort: () => console.log("Abort!"),
//       },
//     };
//   }

//   // Check if the browser supports streaming instantiation
//   if (WebAssembly.instantiateStreaming) {
//     // Fetch the module, and instantiate it as it is downloading
//     response = await WebAssembly.instantiateStreaming(
//       fetch(wasmModuleUrl),
//       importObject
//     );
//   } else {
//     // Fallback to using fetch to download the entire module
//     // And then instantiate the module
//     const fetchAndInstantiateTask = async () => {
//       const wasmArrayBuffer = await fetch(wasmModuleUrl).then((response) =>
//         response.arrayBuffer()
//       );
//       return WebAssembly.instantiate(wasmArrayBuffer, importObject);
//     };
//     response = await fetchAndInstantiateTask();
//   }

//   return response;
// };

// const wasmexample = document.querySelector("#wasmexample");
// wasmexample.onclick = async (event) => {
//   const runWasmAdd = async () => {
//     // Instantiate our wasm module
//     const wasmModule = await wasmBrowserInstantiate("./test.wasm", {
//       imports : {
//         imported_func: (arg) => {while (true) {}},
//       },
//       env: { abort: () => console.log("Abort!") },
//     });

//     function hangWithWasm() {
//       // Call the Add function export from wasm, save the result
//       wasmModule.instance.exports.exported_func();
//     }

//     hangWithWasm();
//   };
//   runWasmAdd();
// };

// Get reference to counter button
const counterBtn = document.querySelector("#counterBtn");
// Function to increment counter on the html page
function incrementCounter() {
  const counterElem = document.getElementById("counter");
  counterElem.textContent = parseInt(counterElem.textContent) + 1;
}
// bind function to onclick method
counterBtn.onclick = (event) => incrementCounter();

function fooWithException() {
  try {
    var script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/gh/issackjohn/issackjohn.github.io@latest/external-exception.js";
    // script.crossOrigin = "anonymous";
    document.body.appendChild(script);
  } catch (error) {
    console.log("Caught the error on localhost");
    console.log(error.stack);
  }
}

function fooWithLocalException() {
  try {
    var script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/gh/issackjohn/issackjohn.github.io@latest/middle-function.js";
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
  } catch (error) {
    console.log("Caught the error on localhost");
    console.log(error.stack);
  }
}

function fooWithLocalHang() {
  var script = document.createElement("script");
  script.src =
    "https://86a7b515-9c60-4eb6-a7ff-2f7eae43e047.mock.pstmn.io/middle-function-hang";
  script.crossOrigin = "anonymous";
  document.body.appendChild(script);
}

function foo() {
  console.log("Foo");
  bar();
}

function bar() {
  console.log("Bar");
  baz();
}

function baz() {
  console.log("Baz");
  // var script = document.createElement("script");
  // script.src =
  //   "https://cdn.jsdelivr.net/gh/issackjohn/issackjohn.github.io@latest/my-script.js";
  // script.crossOrigin = "anonymous";
  // document.body.appendChild(script);
  // sleep for 5 seconds
  // setTimeout(() => {
  //   yikes();
  // }, 3000);
  yikes();
}

function startExternalHang() {
  var script = document.createElement("script");
  script.src =
    "https://localhost:8443/fake-external.js";
  script.crossOrigin = "anonymous";
  document.body.appendChild(script);
}

function yikes() {
  hang();
}

// create a function that causes the browser to hang for 5 seconds
function hang() {
  console.log("Hang");
  while (true) {}
}

const hangBtn = document.querySelector("#hangBtn");
hangBtn.onclick = (event) => foo();

// const externalHangBtn = document.querySelector("#externalHangBtn");
// externalHangBtn.onclick = (event) => {
//   startExternalHang();
// };

// const exceptionBtn = document.querySelector("#externalExceptionBtn");
// exceptionBtn.onclick = (event) => {
//   try {
//     fooWithException();
//   } catch (error) {
//     console.log("Caught the error thrown by the external script");
//     console.log(error.stack);
//   }
// };

// const localCdnLocalExceptionBtn = document.querySelector(
//   "#localCdnLocalExceptionBtn"
// );
// localCdnLocalExceptionBtn.onclick = (event) => {
//   try {
//     fooWithLocalException();
//   } catch (error) {
//     console.log("Caught the error thrown by the external script");
//     console.log(error.stack);
//   }
// };

const localCdnLocalhangBtn = document.querySelector("#localCdnLocalhangBtn");
localCdnLocalhangBtn.onclick = (event) => {
  fooWithLocalHang();
};

console.log("self.crossOriginIsolate: ", self.crossOriginIsolated);
