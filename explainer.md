# Call stacks in crash reports from unresponsive web pages

## Authors:

- Seth Brenith
- Issack John

## Participate
- [Issue tracker](https://issues.chromium.org/issues/40268201)
- [Discussion forum]

# Introduction
When a web page becomes unresponsive, it's often because of JavaScript code which is busy running an infinite loop or other very long computation. When a developer receives a report from the crash reporting API, and the reason is unresponsive, it would be very helpful to include the JS call stack from when the page was deemed unresponsive. This would let the website developer more easily find the find and fix the problem.

The following sections are my attempt to make this idea a bit more concrete, but I'd be fine with other options that satisfy the same overall goal.

## Goals [or Motivating Use Cases, or Scenarios] (TODO)

[What is the **end-user need** which this project aims to address?]

## Non-goals (TODO)

[If there are "adjacent" goals which may appear to be in scope but aren't,
enumerate them here. This section may be fleshed out as your design progresses and you encounter necessary technical and other trade-offs.]

# A more detailed proposal
Crash reports uploaded by the Crash Reporting API may include the JavaScript call stack, in a new property on CrashReportBody:

```
readonly attribute DOMString? stack;
```

Website owners may opt in using the document policy. 
```
include-js-call-stacks-in-crash-reports
```
This configuration point allows the website owners to control whether JavaScript call stacks should be included in the crash reports or not. The default value is false, meaning that call stacks are not included unless you explicitly opt-in. Call stacks can be enabled by simply specifying the value.

Example.
```
Document-policy: include-js-call-stacks-in-crash-reports
```

## How is the stack represented?
Exactly the same format as `Error.prototype.stack`, including limiting the number of reported frames to the value specified in `Error.stackTraceLimit`. This format allows sites to reuse any logic they may have built for reading stacks uploaded by `window.onerror` handlers.

## When should the stack be captured?
Any time after the browser has determined that the page or iframe is unresponsive. This leaves room for implementations to do whatever is most convenient, whether that be inspecting the stack of the process as it's terminated or interrupting the JS execution thread sometime earlier to collect the data.

## What if a stack can't be captured?
That's fine. The browser should make a reasonable effort to collect call stack data, but such data is not guaranteed. For example, an implementation that relies on interrupting the JS thread may never have a chance to do so if that thread is waiting on a lock or executing a very long loop in browser-internal code.

## What about workers?
An infinite loop in a worker doesn't cause the page or iframe to become unresponsive. This API reports only about script on the main thread.

## When there are frames from multiple origins in a renderer, how do we ensure that stacks are attributed to the correct frame?
To ensure that stacks are attributed to the correct frame, we need to send back the serialized frame token from the renderer to the browser along with the call stack. This way, the browser can verify that the call stack belongs to the same frame which the crash report is being generated for before attaching it to the report.

## If there is an extension executing scripts in the main world, how will you prevent the endpoint from knowing about the agent’s execution environment such as what extensions they have installed?
Extension code injected into the main world may be visible.

## How do wasm call stacks work with this proposal?
Wasm stack frames will not be supported in this first implementation of the API. The current StackFrameInfo objects do not have enough information to support these types of frames. Typically the format is `${url}:wasm-function[${funcIndex}]:${pcOffset}` as found [here](https://webassembly.github.io/spec/web-api/index.html#conventions). funcIndex and pcOffset are not available to us just yet but this is something that we can evaluate to support in follow-up work. That information is currently available on CallSiteInfo objects. `CallSiteInfo::GetWasmFunctionIndex()`.

## Privacy
This is a new mechanism that could allow a website to collect data about its users. However, websites already have a great deal of power to collect data if they choose (including much more detailed data than is exposed by this proposal), and websites are responsible for respecting their users' privacy. As described in the Reporting API, browsers must provide an opt-out mechanism for reporting, which would block these reports entirely.

## Security
Just like `Error.prototype.stack`, information must be omitted about any cross-domain scripts that were not loaded with CORS.