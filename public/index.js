// Function to increment counter on the html page
function incrementCounter() {
    const counterElem = document.querySelector(".counter");
    counterElem.textContent = parseInt(counterElem.textContent) + 1;
}

function startExternalHang() {
    var script = document.createElement("script");
    script.src = "https://localhost:8443/fake-external.js";
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
}

function fooWithLocalHang() {
    var script = document.createElement("script");
    script.src =
        "https://31ca5d15-2d2e-47aa-ac12-45266fdf54d3.mock.pstmn.io/middle-function-hang";
    script.crossOrigin = "anonymous";
    document.body.appendChild(script);
}

function somehang() {
    console.log("Some local Hang");
    // print error.stack
    console.log(new Error().stack);
    while (true) { }
}

function hang() {
    hang2();
}
function hang2() {
    hang3();
}
function hang3() {
    while (true) { }
}

// https://github.com/torch2424/wasm-by-example/blob/master/demo-util/
const wasmBrowserInstantiate = async (wasmModuleUrl, importObject) => {
  let response = undefined;

  if (!importObject) {
    importObject = {
      imports : {
        imported_func: (arg) => {while (true) {}},
      },
      env: {
        abort: () => console.log("Abort!"),
      },
    };
  }

  // Check if the browser supports streaming instantiation
  if (WebAssembly.instantiateStreaming) {
    // Fetch the module, and instantiate it as it is downloading
    response = await WebAssembly.instantiateStreaming(
      fetch(wasmModuleUrl),
      importObject
    );
  } else {
    // Fallback to using fetch to download the entire module
    // And then instantiate the module
    const fetchAndInstantiateTask = async () => {
      const wasmArrayBuffer = await fetch(wasmModuleUrl).then((response) =>
        response.arrayBuffer()
      );
      return WebAssembly.instantiate(wasmArrayBuffer, importObject);
    };
    response = await fetchAndInstantiateTask();
  }

  return response;
};