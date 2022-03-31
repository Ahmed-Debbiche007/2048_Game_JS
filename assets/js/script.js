import Grid from "./Grid.js"
import Tile from "./Tile.js"

const body = document.getElementsByTagName("body")[0]

function start() {
  body.innerHTML = ""
  const game = document.createElement("div")
  game.id = "game"
  body.appendChild(game)

  const sc = document.createElement("div")
  sc.innerHTML = "Score:0"
  sc.className = "score"
  game.appendChild(sc)
  var won = false

  const gameBoard = document.createElement("div")
  gameBoard.className = "game-board"
  game.appendChild(gameBoard)

  const grid = new Grid(gameBoard)
  grid.randomEmptyCell().tile = new Tile(gameBoard)
  grid.randomEmptyCell().tile = new Tile(gameBoard)
  setupInput()

  function setupInput() {
    window.addEventListener("keydown", handleInput, {
      once: true
    })
  }


  async function handleInput(e) {
    switch (e.key) {
      case "ArrowUp":
        if (!canMoveUp()) {
          setupInput()
          return
        }
        await moveUp()
        break
      case "ArrowDown":
        if (!canMoveDown()) {
          setupInput()
          return
        }
        await moveDown()
        break
      case "ArrowLeft":
        if (!canMoveLeft()) {
          setupInput()
          return
        }
        await moveLeft()
        break
      case "ArrowRight":
        if (!canMoveRight()) {
          setupInput()
          return
        }
        await moveRight()
        break
      default:
        setupInput()
        return
    }

    grid.cells.forEach(cell => cell.mergeTiles())

    const newTile = new Tile(gameBoard)
    grid.randomEmptyCell().tile = newTile

    if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
      newTile.waitForTransition(true).then(() => {
        const loose = lost()
        body.innerHTML = ""
        body.appendChild(loose[0])
        setTimeout(function () {
          body.innerHTML = "";
          sc.className = "lose"
          body.appendChild(sc)
        }, 2000)
        setTimeout(function () {
          body.innerHTML = "";
          body.appendChild(loose[1])
        }, 4000)

      })
      return
    }

    setupInput()
  }

  function moveUp() {
    return slideTiles(grid.cellsByColumn)
  }

  function moveDown() {
    return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
  }

  function moveLeft() {
    return slideTiles(grid.cellsByRow)
  }

  function moveRight() {
    return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
  }

  function slideTiles(cells) {
    return Promise.all(
      cells.flatMap(group => {
        const promises = []
        for (let i = 1; i < group.length; i++) {
          const cell = group[i]
          if (cell.tile == null) continue
          let lastValidCell
          for (let j = i - 1; j >= 0; j--) {
            const moveToCell = group[j]
            if (!moveToCell.canAccept(cell.tile)) break
            lastValidCell = moveToCell
          }

          if (lastValidCell != null) {
            promises.push(cell.tile.waitForTransition())
            if (lastValidCell.tile != null) {
              lastValidCell.mergeTile = cell.tile
            } else {
              lastValidCell.tile = cell.tile
            }
            cell.tile = null
          }
        }
        return promises
      })
    )
  }

  function canMoveUp() {
    return canMove(grid.cellsByColumn)
  }

  function canMoveDown() {
    return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
  }

  function canMoveLeft() {
    return canMove(grid.cellsByRow)
  }

  function canMoveRight() {
    return canMove(grid.cellsByRow.map(row => [...row].reverse()))
  }

  function canMove(cells) {
    addScore()
    ifwin()
    return cells.some(group => {
      return group.some((cell, index) => {
        if (index === 0) return false
        if (cell.tile == null) return false
        const moveToCell = group[index - 1]
        return moveToCell.canAccept(cell.tile)
      })
    })
  }

  function addScore(cells) {
    
    let score = 0
    grid.cells.forEach(cell => score = score + cell.score)
    sc.innerHTML = "Score:" + score
    return score
  }

  function ifwin() { if (!won){
    const win = document.getElementsByClassName("tile")
    for (let i = 0; i < win.length; i++) {
      if (win[i].innerHTML == "2048") {
        won = true
        setupInput()
        body.innerHTML=""
        const div = document.createElement("div")
        div.innerHTML = "You won <br> Continue? <br>"
        div.className = "confirm"
        const div2 = document.createElement("div")
        const continu = document.createElement("button")
        continu.innerHTML="Yes!"
        continu.className = "bubbly-button"
        continu.addEventListener("click",()=>{
          body.innerHTML =""
          body.appendChild(game)
        })
        const rpbtn = document.createElement("button")
        rpbtn.innerHTML="Restart!"
        rpbtn.className = "bubbly-button"
        rpbtn.style.setProperty("background-color", "hsl(255, 80%, 70%)")
        rpbtn.addEventListener("click",()=>{
          body.innerHTML =""
          start()
        })
        div2.appendChild(continu)
        div2.appendChild(rpbtn)
        div.appendChild(div2)
        body.appendChild(div)
        
      }
    }
  }
}
}

function lost() {
  const lose = document.createElement("div")
  lose.innerHTML = "YOU LOST!"
  lose.className = "lose"
  const rp = document.createElement("button")
  rp.innerHTML = "Play Again!"
  rp.className = "bubbly-button"
  rp.style.setProperty("font-size", "1em")
  rp.addEventListener("click", () => {
    body.innerHTML = ""
    start()

  })
  const loose = [lose, rp]
  return loose
}

start()