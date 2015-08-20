chrome.extension.onMessage.addListener(function(request, sender) {
  if (request.action == "getSource") {
    message.innerHTML = request.source;
  }
});

function onWindowLoad() {

  var message = document.querySelector('#message');

  chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
  }, function() {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.extension.lastError) {
      message.innerText = 'There was an error injecting script : \n' + chrome.extension.lastError.message;
    }
  });

}

window.onload = onWindowLoad;



function click(e) {
  chrome.tabs.executeScript(null,
      {
      file: "getPageWidgs.js"
      }, function() {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.extension.lastError) {
          message.innerText = 'There was an error injecting script : \n' + chrome.extension.lastError.message;
        }
      });
}

document.addEventListener('DOMContentLoaded', function () {
  var divs = document.querySelectorAll('.button');
  for (var i = 0; i < divs.length; i++) {
    console.log(divs[i]);
    divs[i].addEventListener('click', click);
  }
});