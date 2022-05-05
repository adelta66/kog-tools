// Initialize butotn with users's prefered color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: setPageBackgroundColor,
  });
});


function setPageBackgroundColor() {
  function doPostRequest(t) {
    return new Promise(e => {
      const n = new XMLHttpRequest;
      n.open("POST", "api.php", !0),
        n.onreadystatechange = function () {
          if (4 === n.readyState && 200 === n.status) {
            const t = JSON.parse(this.responseText);
            e(t)
          }
        }
        ,
        n.setRequestHeader("Content-Type", "application/json;charset=UTF-8"),
        n.send(JSON.stringify(t))
    }
    )
  }

  doPostRequest({
    type: 'players',
    player: "Alion"
  }).then((resp) => {
    const data = JSON.parse(resp.data)
    console.log(data);
  });






}
