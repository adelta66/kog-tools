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
    element.classList.toggle("th-sort-asc", asc)
    element.classList.toggle("th-sort-desc", !asc)

    function sortFunction(colIndex, asc) {
        return function (a, b) {
            if((a.children[colIndex]==undefined)&&(b.children[colIndex]==undefined)) return 0
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


            if(tableHeaders[colIndex].innerHTML=="Difficulty"){
                function catToNumber(category){
                    if(category=="Easy")    return 10
                    if(category=="Main")    return 20
                    if(category=="Hard")    return 30
                    if(category=="Insane")  return 40
                    if(category=="Mod")     return 50
                }
                a=catToNumber(a.split(' ')[0])+a.split(' ')[1]
                b=catToNumber(b.split(' ')[0])+b.split(' ')[1]
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
        const n = new XMLHttpRequest
        n.open("POST", "api.php", !0),
            n.onreadystatechange = function () {
                if (4 === n.readyState && 200 === n.status) {
                    const t = JSON.parse(this.responseText)
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
    var hours   = Math.floor(sec_num / 3600)
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60)
    var seconds = sec_num - (hours * 3600) - (minutes * 60)

    if (hours   < 10) {hours   = "0"+hours}
    if (minutes < 10) {minutes = "0"+minutes}
    if (seconds < 10) {seconds = "0"+seconds}
    return hours+':'+minutes+':'+seconds
}
function addColToTable(table, text){
    const tableHeadRow = table.tHead.children[0]
    const newCell = document.createElement("th")
    newCell.innerHTML=text
    newCell.addEventListener("click", sortTable)
    tableHeadRow.appendChild(newCell)
}
function addCellInRow(row, text){
    const newCell = document.createElement('td')
    newCell.innerHTML=text
    row.appendChild(newCell)
}
async function getMapsData(){
    try {
        const mapsUrl = "https://kog.tw/get.php?p=maps&p=maps"
        const resp = await fetch(mapsUrl)
        const parser = new DOMParser()
        const doc = parser.parseFromString(await resp.text(), "text/html")
        const mapCards = Array.from(doc.querySelectorAll("div.col > div > div"))
        const maps={}
        mapCards.forEach(e=>{
            const releaseDate=e.querySelector("div.text-muted.card-footer").innerHTML.trim().split(' ')[2]
            let mapInfo={
                category: e.querySelector("div.card-body > ul > li:nth-child(2)").innerHTML,
                stars: e.querySelectorAll("i.bi-star-fill").length,
                points: e.querySelector("div.card-body > ul > li:nth-child(3)").innerHTML.split(" ")[0],
                author: e.querySelector("div.card-body > ul > li:nth-child(4)").innerHTML,
                releaseDate:  releaseDate=="a" ? "?" : releaseDate
            }
            maps[e.querySelector("a > div > h4").innerHTML]=mapInfo
        })
        return maps        
    } catch (error) {
        console.log("fetch failed", error)
    }
}
function addEventHandlerToTableAfterContentIsLoaded(m) {
    const tables = Array.from(document.querySelectorAll("table"))
    tables.forEach(table=>{
        if(!table.classList.contains("sortable")&&table.tHead){
            const tableHeaders = Array.from(table.tHead.children[0].children)
            tableHeaders.forEach(element => {
                element.addEventListener("click", sortTable)
            })
            table.classList.add("sortable")
        }
    })
}
function addMapInfoOnPlayerPageAfterContentIsLoaded(m){
    const unfinishedMapsTable = document.querySelector("div#pills-unfinished > table")
    if(!unfinishedMapsTable) return
    const finishedMapsTable = document.querySelector("div#pills-finished > table")
    if(!finishedMapsTable) return

    getMapsData().then(maps=>{
        //unfinished Maps
        addColToTable(unfinishedMapsTable, "Difficulty")
        addColToTable(unfinishedMapsTable, "Author")
        addColToTable(unfinishedMapsTable, "Points")
        addColToTable(unfinishedMapsTable, "Release date")

        const unfinishedMapsRows = Array.from(unfinishedMapsTable.tBodies[0].children)
        unfinishedMapsRows.forEach(row=>{
            const mapName = row.children[0].children[0].innerHTML

            const starString=(()=>{
                const stars = maps[mapName].stars
                let string=""+stars
                    string += ' <i class="bi bi-star-fill" style="color: orange;"></i>'
                
                return string
            })()
            addCellInRow(row, maps[mapName].category+" "+starString)
            addCellInRow(row, maps[mapName].author)
            addCellInRow(row, maps[mapName].points)
            addCellInRow(row, maps[mapName].releaseDate)
        })
        //finished maps
        addColToTable(finishedMapsTable, "Difficulty")
        addColToTable(finishedMapsTable, "Author")
        addColToTable(finishedMapsTable, "Points")
        addColToTable(finishedMapsTable, "Release date")

        const finishedMapsRows = Array.from(finishedMapsTable.tBodies[0].children)
        finishedMapsRows.forEach(row=>{
            const mapName = row.children[0].children[0].innerHTML

            const starString=(()=>{
                const stars = maps[mapName].stars
                let string=""+stars
                    string += ' <i class="bi bi-star-fill" style="color: orange;"></i>'
                
                return string
            })()
            addCellInRow(row, maps[mapName].category+" "+starString)
            addCellInRow(row, maps[mapName].author)
            addCellInRow(row, maps[mapName].points)
            addCellInRow(row, maps[mapName].releaseDate)
        })


    })



    //add data to unfinishedMapsTable
}
function addSearchbarOnHomeSubpage(){
    const playerSearchBarString = '<form class="form-inline" action="javascript:void(0);" id="searchFormCustom" ><div class="input-group mb-3"><input type="hidden" name="p" value="players"><input type="text" name="player" id="playerCustom" class="form-control" placeholder="Search player" aria-label="Search player" aria-describedby="basic-addon2"><div class="input-group-append"><button class="btn btn-success" type="submit">Search</button></div></div></form>'

        const playerSearchBarDiv = document.createElement("div")
        playerSearchBarDiv.id = "homeSearchBar"
        playerSearchBarDiv.classList.add("container")
        const contentDiv = document.querySelector("#content")
        document.body.insertBefore(playerSearchBarDiv, contentDiv)
        playerSearchBarDiv.innerHTML = playerSearchBarString


        
        const form = document.querySelector("#searchFormCustom")
        form.addEventListener("submit", () => {
            const form = document.getElementById('searchFormCustom')
            const data = Object.fromEntries(new FormData(form).entries())
            window.location.hash = `#p=${data.p}&player=${data.player}`
        })
        window.addEventListener("hashchange", hideShowSearchBar)
        hideShowSearchBar()
}
function addCompareSearchBarOnPlayerPage(){
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

            //this is bad:
            const indexOfACellbeforeWhichNewCellShouldBeInserted=Array.from(tHeadRow.children).indexOf(Array.from(tHeadRow.children).find(cell=>{
                return cell.innerHTML=="Finishes"
            }))

            tHeadRow.insertBefore(comparedPlayerTh, tHeadRow.children[indexOfACellbeforeWhichNewCellShouldBeInserted])

            //add times
            Array.from(table.tBodies[0].children).forEach(row => {
                const mapName = row.children[0].children[0].innerHTML.trim()
                const found = finishedMaps.find(e => e.Map == mapName)
                let cell = document.createElement("td")

                //Player has finished this map
                if (found) cell.innerHTML=found.T.toHHMMSS()
                //Player hasn't finished this map
                else cell.innerHTML=""
                
                row.insertBefore(cell, row.children[indexOfACellbeforeWhichNewCellShouldBeInserted])

            })
            form.querySelector("button").disabled=false
        }, err => {
            form.querySelector("button").disabled=false
            console.log(err)
        })


    })
    window.addEventListener("hashchange", hideShowPlayerCompareBar);
    hideShowPlayerCompareBar()
}

const websiteIsLoadedObserver = new MutationObserver(()=>{
    if(document.querySelector("#pills-finished")){
        document.querySelector("#comparePlayerDiv").style.display = 'block'
        websiteIsLoadedObserver.disconnect()
    }
})

//stores the names of player user has search for to compare with
let playersSearched=[]
window.addEventListener("hashchange", ()=>{
    playersSearched=[]
})

window.onload = () => {

    //adds search bar on home subpage
    addSearchbarOnHomeSubpage()
    //add compare search bar
    addCompareSearchBarOnPlayerPage()

    

    //make tables sortable
    const contentDivObserver = new MutationObserver(addEventHandlerToTableAfterContentIsLoaded)
    contentDivObserver.observe(document.querySelector("#content"), { childList: true })

    //add mapinfo
    const mapInfoObserver = new MutationObserver(addMapInfoOnPlayerPageAfterContentIsLoaded)
    mapInfoObserver.observe(document.querySelector("#content"), { childList: true })






}

