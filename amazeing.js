import { LEVEL_1, LEVEL_2, LEVEL_3 } from "./mazes.js"

const main = document.querySelector('main')
const LEVELS = [ LEVEL_1, LEVEL_2, LEVEL_3 ]

const player = localStorage.getItem('playerProgression') ? 
    JSON.parse(localStorage.getItem('playerProgression')) : 
    {
        x:1,
        y:1,
        tile: '',
        currentLevel: 1,
        facing: 'right', // hero facing right or left
        direction: '', // depending on the move: up, down, left or right
        pace: 'normal' // 'slow', 'normal' or 'fast' ==> see moveTiming
    }
let initTime = Date.now()
let lastMovedAgo = Date.now() - initTime
let animateIdle // initiate variable for an interval used across functions later

const moveTiming = player.pace === 'normal' ? 400 : player.pace === 'fast' ? 100 : 600


// =============== GENERIC FUNCTIONS ===============

function getElapsedTime(){
    return Date.now() - initTime
}

function addBackground(element, backgroundImg, times = 1) {
    for (let i = 0; i < times; i++) {
        if (!element.style.backgroundImage) {
            element.style.backgroundImage = backgroundImg
        } else {
            element.style.backgroundImage = backgroundImg + ', ' + element.style.backgroundImage
        }
    }
}

// function removeBackground(element, backgroundRegex) {
//     element.style.backgroundImage = element.style.backgroundImage.replace(backgroundRegex, '')
// }

function addImage(element, image, className) {
    const imgElement = document.createElement('img')
    imgElement.style.gridColumn = '1 / 2'
    imgElement.style.gridRow = '1 / 2'
    imgElement.classList.add(className)
    imgElement.src = image
    if (player.facing === 'left') {
        imgElement.style.transform = 'scaleX(-1)'
    }
    element.append(imgElement)
}

function removeImage(element, className, imageRegex) {
    if (element.children.length > 0) {
        for (let child of element.children) {
            if (child.nodeName === 'IMG' && child.className === className && child.src.search(imageRegex) !== -1) {
                child.remove()
            }
        }
    }
}

// =============== ANIMATIONS =================

function animateHero() {
    let hero = document.querySelector('.hero')

    const idleImages = [ './assets/wizzard_f_idle_anim_f0.png', './assets/wizzard_f_idle_anim_f1.png', './assets/wizzard_f_idle_anim_f2.png', './assets/wizzard_f_idle_anim_f3.png' ]
    const interval = 110
    let idleImagesIndex = 0
    
    animateIdle = setInterval(function() {
        idleImagesIndex = idleImagesIndex % 4
        hero.src = idleImages[idleImagesIndex]
        idleImagesIndex++
    }, interval)
}

function heroRun() {
    const hero = document.querySelector('.hero')
    if (player.facing === 'left') {
        hero.style.transform = 'scaleX(-1)'
    } else {
        hero.style.transform = ''
    }
    document.body.offsetHeight // dummy line to create a separation between the modification in style before and after, so that the facing position isn't animated, but the move in itself is
    hero.style.transition = `transform ${moveTiming}ms linear`
    if (player.direction === 'left' || player.direction === 'right') hero.style.transform += ' translateX(100%)'
    else if (player.direction === 'down') hero.style.transform += ' translateY(100%)'
    else hero.style.transform += ' translateY(-100%)'

    const runningImages = [ './assets/wizzard_f_run_anim_f0.png', './assets/wizzard_f_run_anim_f1.png', './assets/wizzard_f_run_anim_f2.png', './assets/wizzard_f_run_anim_f3.png' ]
    const interval = player.pace === 'fast' ? 50 : 110
    for (let i = 0, timing = 0; timing < moveTiming; i++, timing += interval) {
        setTimeout(function() {
            let runningImagesIndex = i % 4
            hero.src = runningImages[runningImagesIndex]
        }, timing)
    }
}


function openTreasure() {
    const treasureChest = document.querySelector('.treasure-item')
    const treasureAnimationFrames = [ './assets/chest_full_open_anim_f0.png', './assets/chest_full_open_anim_f1.png', './assets/chest_full_open_anim_f2.png' ]

    for (let i = 0, delay = 0; i < treasureAnimationFrames.length; i++, delay += 150) {
        setTimeout(function() {
            treasureChest.src = treasureAnimationFrames[i]
        }, delay)
    }
}

// =============== PLAYER =================

function changePlayerTile() {
    const previousPlayerPosition = document.querySelector('.player')
    previousPlayerPosition.classList.remove('player')
    clearInterval(animateIdle)
    heroRun()
    setTimeout(function() {
        removeImage(previousPlayerPosition, 'hero', /\/assets\/wizzard.+?\.png/g)
    }, moveTiming)
}

function checkVictory() {
    const treasure = document.querySelector('.treasure')
    if (treasure.classList.contains('player')) {
        if (player.currentLevel === LEVELS.length) {
            openTreasure()
        }
        alert('You won!')
        player.currentLevel += 1
        if (player.currentLevel > LEVELS.length) {
            player.currentLevel = 1
        }
        runLevel(LEVELS[player.currentLevel - 1])
    }
}

function displayPlayer() {
    const shownPlayer = document.querySelector(`.tile-x-${player.x}.tile-y-${player.y}`)
    shownPlayer.classList.add('player')
    addImage(shownPlayer, './assets/wizzard_f_idle_anim_f0.png', 'hero')
    animateHero()
    player.tile = document.querySelector('.player')
    
    checkVictory()
}

function movePlayer(e) {
    lastMovedAgo = getElapsedTime()

    if (lastMovedAgo >= moveTiming) {

        if (e.key === 'ArrowRight') {
            let targetTile = document.querySelector(`.tile-x-${player.x + 1}.tile-y-${player.y}.path`)
            if (targetTile) {
                initTime = Date.now()
                player.x += 1
                player.facing = 'right'
                player.direction = 'right'
                changePlayerTile()
                setTimeout(displayPlayer, moveTiming)
            }
        }
        if (e.key === 'ArrowLeft') {
            let targetTile = document.querySelector(`.tile-x-${player.x - 1}.tile-y-${player.y}.path`)
            if (targetTile) {
                initTime = Date.now()
                player.x -= 1
                player.direction = 'left'
                player.facing = 'left'
                changePlayerTile()
                setTimeout(displayPlayer, moveTiming)
            }
        }
        if (e.key === 'ArrowUp') {
            let targetTile = document.querySelector(`.tile-x-${player.x}.tile-y-${player.y - 1}.path`)
            if (targetTile) {
                initTime = Date.now()
                player.y -= 1
                player.direction = 'up'
                changePlayerTile()
                setTimeout(displayPlayer, moveTiming)
            }
        }
        if (e.key === 'ArrowDown') {
            let targetTile = document.querySelector(`.tile-x-${player.x}.tile-y-${player.y + 1}.path`)
            if (targetTile) {
                initTime = Date.now()
                player.y += 1
                player.direction = 'down'
                changePlayerTile()
                setTimeout(displayPlayer, moveTiming)
            }
        }
    }
}

// =============== DECOR ===============

function drawWall(level, tile, i, j) {
    const row = level[i]

    const tileTop = level[i-1] ? level[i-1][j] : undefined
    const tileBottom = level[i+1] ? level[i+1][j] : undefined
    const tileLeft = row[j-1] ? row[j-1] : undefined
    const tileRight = row[j+1] ? row[j+1] : undefined
    const tileTopLeft = tileTop && level[i-1][j-1] ? level[i-1][j-1] : undefined
    const tileTopRight = tileTop && level[i-1][j+1] ? level[i-1][j+1] : undefined
    const tileBottomLeft = tileBottom && level[i+1][j-1] ? level[i+1][j-1] : undefined
    const tileBottomRight = tileBottom && level[i+1][j+1] ? level[i+1][j+1] : undefined

    tile.classList.add('tile', 'wall')
    
    let pathRegex = /^[.ST]$/

    tile.style.backgroundSize = "50%"
    tile.style.backgroundRepeat = "no-repeat"

    if (tileTop && tileTop.search(pathRegex) !== -1) {
        addBackground(tile, 'url("./assets/wall_top.png")', 2)
        tile.style.backgroundPosition = "0 top, 100% top"
    }
    if (tileBottom && tileBottom.search(pathRegex) !== -1) {
        addBackground(tile, 'url("./assets/wall_' + Math.ceil(Math.random() * 3) + '.png")')
        addBackground(tile, 'url("./assets/wall_' + Math.ceil(Math.random() * 3) + '.png")')
        addBackground(tile, 'url("./assets/wall_' + Math.ceil(Math.random() * 3) + '.png")')
        addBackground(tile, 'url("./assets/wall_' + Math.ceil(Math.random() * 3) + '.png")')
        addBackground(tile, 'url("./assets/wall_top.png")', 2)
    
        tile.style.backgroundPosition = "0 top, 100% top, 0 0, 0 100%, 100% 0, 100% 100%"
    }
    if ((tileRight && tileRight.search(pathRegex) !== -1 && (!tileBottom || tileBottom.search(pathRegex) === -1))
    || (tileBottom && tileBottom.search(pathRegex) === -1 && tileBottomRight && tileBottomRight.search(pathRegex) !== -1)) {
        addBackground(tile, 'url("./assets/wall_left.png")', 2)
        tile.style.backgroundPosition = tile.style.backgroundPosition ? "right 0, right 100%, " + tile.style.backgroundPosition : "right 0, right 100%"
    }
    if ((tileLeft && tileLeft.search(pathRegex) !== -1 && (!tileBottom || tileBottom.search(pathRegex) === -1))
    || (tileBottom && tileBottom.search(pathRegex) === -1 && tileBottomLeft && tileBottomLeft.search(pathRegex) !== -1)) {
        addBackground(tile, 'url("./assets/wall_right.png")', 2)
        tile.style.backgroundPosition = tile.style.backgroundPosition ? "left 0, left 100%, " + tile.style.backgroundPosition : "left 0, left 100%"
    }

    if ((tileTopRight && tileTopRight.search(pathRegex) !== -1) && (tileTop && tileTop.search(pathRegex) === -1) && (tileRight && tileRight.search(pathRegex) === -1)) {
        addBackground(tile, 'url("./assets/wall_side_top_right.png")')
        tile.style.backgroundPosition = tile.style.backgroundPosition ? "top right, " + tile.style.backgroundPosition : "top right"
    }
    if ((tileTopLeft && tileTopLeft.search(pathRegex) !== -1) && (tileTop && tileTop.search(pathRegex) === -1) && (tileLeft && tileLeft.search(pathRegex) === -1)) {
        addBackground(tile, 'url("./assets/wall_side_top_left.png")')
        tile.style.backgroundPosition = tile.style.backgroundPosition ? "top left, " + tile.style.backgroundPosition : "top left"
    }
}

function drawPath(tile) {
    tile.classList.add('tile', 'path')
    const randomPathNumbers = []
    for (let i = 0; i < 4; i++) {
        let randomNumber
        while (randomPathNumbers.includes(randomNumber)) {
            randomNumber = Math.ceil(Math.random() * 8)
        }
        randomPathNumbers.push(Math.ceil(Math.random() * 8))
    }
    for (let i = 0; i < randomPathNumbers.length; i++) {
        addBackground(tile, 'url("./assets/floor_' + randomPathNumbers[i] + '.png")')
    }

    addBackground(tile, 'linear-gradient(to bottom, rgba(0 0 0 / .3), rgba(0 0 0 / .3))')
    tile.style.backgroundSize = "100%, 50%, 50%, 50%, 50%"
    tile.style.backgroundPosition = "0 0, 0 0, 0 100%, 100% 0, 100% 100%"
    tile.style.backgroundRepeat = "no-repeat"
}

function drawTreasure(tile) {
    tile.classList.add('tile', 'path', 'treasure')
    drawPath(tile)
    if (player.currentLevel !== LEVELS.length) {
        addImage(tile, './assets/floor_ladder.png', 'ladder')
    } else {
        addImage(tile, './assets/chest_full_open_anim_f0.png', 'treasure-item')
    }
}

// =================== CREATE LEVEL ====================

function runLevel(level) {
    localStorage.setItem('playerProgression', JSON.stringify(player));

    main.innerHTML = ''

    const mazeContainer = document.createElement('div')
    mazeContainer.classList.add('maze-container')

    mazeContainer.style.gridTemplateRows = 'repeat(' + level.length + ', 1fr)'
    mazeContainer.style.gridTemplateColumns = 'repeat(' + level[0].length + ', 1fr)'
    
    for (let i = 0; i < level.length; i++) {
        const row = level[i]

        for (let j = 0; j < level[i].length; j++) {
            const element = row[j]

            const tile = document.createElement('div')
            if ((document.body.offsetHeight / level.length) > (document.body.offsetWidth / level[0].length)) {
                tile.style.width = 100 / level[0].length + 'vw'
            } else {
                tile.style.height = 100 / level.length + 'vh'
            }
            tile.classList.add('tile-x-' + j)
            tile.classList.add('tile-y-' + i)

            switch (element) {
                case '*':
                    drawWall(level, tile, i, j)
                    break
                case '.':
                    drawPath(tile)
                    break
                case 'S':
                    drawPath(tile)
                    player.x = j
                    player.y = i
                    break
                case 'T':
                    drawTreasure(tile)
                    break
                default:
                    console.log("Uuh, there's a problem Houston: " + element)
            }

            mazeContainer.appendChild(tile)
        }
    }
    main.appendChild(mazeContainer)
    displayPlayer()
}


runLevel(LEVELS[player.currentLevel - 1])
document.body.addEventListener('keydown', movePlayer)