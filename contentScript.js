function hideShowSearchBar() {
    const searchBarDiv = document.querySelector("#homeSearchBar")
    if (window.location.hash == "" || window.location.hash == "#p=index") {
        searchBarDiv.style.display = 'block'
    }
    else {
        searchBarDiv.style.display = 'none'
    }
}
function hideShowPlayerCompareBar() {
    const playerCompareBar = document.querySelector("#comparePlayerDiv")
    playerCompareBar.style.display = 'none'
    if (window.location.hash.substring(0, 10) == "#p=players") {
        websiteIsLoadedObserver.observe(document.querySelector("#content"), { childList: true })
    }
}
function sortTable() {
    element=this
    const table = this.closest('table')
    const tableHeaders = Array.from(table.tHead.children[0].children)
    const tBody = table.tBodies[0]
    const tableRowsArray = Array.from(tBody.children)
    const colIndex = Array.from(element.parentNode.children).indexOf(element)
    const asc = (!element.classList.contains("th-sort-asc") && !element.classList.contains("th-sort-desc") ? true : !element.classList.contains("th-sort-asc"))

    tableHeaders.forEach(header => {
        header.classList.remove("th-sort-asc", "th-sort-desc")
    })
    element.classList.toggle("th-sort-asc", asc);
    element.classList.toggle("th-sort-desc", !asc);

    function sortFunction(colIndex, asc) {
        return function (a, b) {
            if((a.children[colIndex]==undefined)&&(b.children[colIndex]==undefined)) return 0;
            if(a.children[colIndex]==undefined) return asc ? 1 : -1
            if(b.children[colIndex]==undefined) return asc ? -1 : 1

            if (a.children[colIndex].firstChild=='a') {
                a = a.children[colIndex].children[0].innerHTML
                b = b.children[colIndex].children[0].innerHTML
            }
            else {
                a = a.children[colIndex].innerHTML
                b = b.children[colIndex].innerHTML
            }

            const localeCompareOptions = { sensitivity: "accent", numeric: true }
            if(asc){
                if(( a && !b ) || ( !a && b )){
                    return (a=="") ? 1 : -1
                }
                return a.localeCompare(b, "en", localeCompareOptions)
            }
            else{
                if(( a && !b ) || ( !a && b )){
                    return (b=="") ? 1 : -1
                }
                return b.localeCompare(a, "en", localeCompareOptions)
            }
            
        }
    }
    tableRowsArray.sort(sortFunction(colIndex, asc))
    tBody.replaceChildren(...tableRowsArray)

}
async function getPlayerData(playerName) {
    t = {
        type: 'players',
        player: playerName
    }

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
Number.prototype.toHHMMSS = function () {
    var sec_num = Math.floor(this)
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

const websiteIsLoadedObserver = new MutationObserver(()=>{
    if(document.querySelector("#pills-finished")){
        document.querySelector("#comparePlayerDiv").style.display = 'block'
        websiteIsLoadedObserver.disconnect()
    }
})

const playersSearched=[]

window.onload = () => {

    //adds search bar on home subpage
    (() => {
        const playerSearchBarString = '<form class="form-inline" action="javascript:void(0);" id="searchFormCustom" ><div class="input-group mb-3"><input type="hidden" name="p" value="players"><input type="text" name="player" id="playerCustom" class="form-control" placeholder="Search player" aria-label="Search player" aria-describedby="basic-addon2"><div class="input-group-append"><button class="btn btn-success" type="submit">Search</button></div></div></form>'

        const playerSearchBarDiv = document.createElement("div")
        playerSearchBarDiv.id = "homeSearchBar"
        playerSearchBarDiv.classList.add("container")
        const contentDiv = document.querySelector("#content")
        document.body.insertBefore(playerSearchBarDiv, contentDiv)
        playerSearchBarDiv.innerHTML = playerSearchBarString


        
        const form = document.querySelector("#searchFormCustom")
        form.addEventListener("submit", () => {
            const form = document.getElementById('searchFormCustom');
            const data = Object.fromEntries(new FormData(form).entries());
            window.location.hash = `#p=${data.p}&player=${data.player}`;
        })
        window.addEventListener("hashchange", hideShowSearchBar);
        hideShowSearchBar()

    })()

    //make tables sortable
    const contentDivObserver = new MutationObserver(addEventHandlerToTableAfterContentIsLoaded)
    contentDivObserver.observe(document.querySelector("#content"), { childList: true });

    
    
    
    //add compare search bar
    (() => {
        const playerSearchBarString = '<form class="form-inline" action="javascript:void(0);" id="comparePlayerForm" ><div class="input-group mb-3"><input type="hidden" name="p" value="players"><input type="text" id="comparePlayerInput"  class="form-control" placeholder="Compare with player" aria-label="Compare with player" aria-describedby="basic-addon2"><div class="input-group-append"><button class="btn btn-success" type="submit">Search</button></div></div></form>'

        const playerSearchBarDiv = document.createElement("div")
        playerSearchBarDiv.id = "comparePlayerDiv"
        playerSearchBarDiv.classList.add("container")
        const contentDiv = document.querySelector("#content")
        document.body.insertBefore(playerSearchBarDiv, contentDiv)
        playerSearchBarDiv.innerHTML = playerSearchBarString


        const form = document.querySelector("#comparePlayerForm")
        form.addEventListener("submit", () => {
            const userInput = document.querySelector("#comparePlayerInput").value.trim()
            if(playersSearched.find(e=>e==userInput)) return
            playersSearched.push(userInput)
            form.querySelector("button").disabled=true

            getPlayerData(userInput).then(resp => {
                resp = JSON.parse(resp.data)
                const finishedMaps = resp.mapsFinished
                const table = document.querySelector("#pills-finished").children[0]

                //add th
                const comparedPlayerTh = document.createElement("th")
                comparedPlayerTh.innerHTML = userInput + "'s time"
                comparedPlayerTh.addEventListener("click", sortTable)
                const tHeadRow = table.tHead.children[0]
                tHeadRow.insertBefore(comparedPlayerTh, tHeadRow.children[tHeadRow.children.length - 2])

                //add times
                Array.from(table.tBodies[0].children).forEach(row => {
                    const mapName = row.children[0].children[0].innerHTML.trim()
                    const found = finishedMaps.find(e => e.Map == mapName)
                    let cell = document.createElement("td")

                    //Player has finished this map
                    if (found) cell.innerHTML=found.T.toHHMMSS()
                    //Player hasn't finished this map
                    else cell.innerHTML=""
                    
                    row.insertBefore(cell, row.children[row.children.length-2])

                })
                form.querySelector("button").disabled=false
            }, err => {
                form.querySelector("button").disabled=false
                console.log(err);
            })


        })
        window.addEventListener("hashchange", hideShowPlayerCompareBar);
        hideShowPlayerCompareBar()
    })()




}

function addEventHandlerToTableAfterContentIsLoaded(m) {
    const tables = Array.from(document.querySelectorAll("table"))
    tables.forEach(table=>{
        if(!table.classList.contains("sortable")&&table.tHead){
            const tableHeaders = Array.from(table.tHead.children[0].children)
            tableHeaders.forEach(element => {
                element.addEventListener("click", sortTable)
            });
            table.classList.add("sortable")
        }
    })
    
    
    
    
    
}