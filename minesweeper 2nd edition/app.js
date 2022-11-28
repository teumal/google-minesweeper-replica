
const game        = document.querySelector(".game"),
      cvs         = document.querySelectorAll(".layerCont canvas"),
      layerCont   = document.querySelector(".layerCont"),
      timer       = document.querySelector(".timer span"),
      flag        = document.querySelector(".flag span"),
      levelSelect = document.querySelector(".levelSelect span"),
      levelCont   = document.querySelector(".levelCont"),
      modeSelect  = document.querySelector(".modeSelect")

const layer          = [],
      levelCheck     = [],
      incorrectImage = new Image(),
      flagImage      = new Image(),
      flagAnimation  = new Image(),
      level          = { r:8, c:10, b:10, rc:80, lv:'초급' },
      oneRad         = (Math.PI/180.0)

const COVERED                       = 0,
      PLANTING_FLAG                 = 1,
      PLANTED_FLAG                  = 2,
      OPENED_WITH_SURROUND_BOMBS    = 3,
      OPENED_WITH_NO_SURROUND_BOMBS = 4

const LONG_PRESS  = 0,
      SHORT_PRESS = 1  

const MIN_GAME_SIZE = 500
    
const numColor = [
  '#FFFFFF','#2452DA','#289A30','#742E0B','#0E175B',
  '#3D1A07','#056287','#000000','#838383'
];

const bombColor = [
  {bg:'rgb(153, 0, 255)', arc:'rgb(113, 0, 188)'},
  {bg:'rgb(255,0,0)',     arc:'rgb(196, 1, 1)'  },
  {bg:'rgb(255, 205, 3)', arc:'rgb(203, 163, 1)'},
  {bg:'rgb(16, 122, 94)', arc:'rgb(10, 81, 62)' },

  {bg:'rgb(255, 132, 0)', arc:'rgb(192, 99, 0)' },
  {bg:'rgb(0, 238, 255)', arc:'rgb(0, 162, 174)'},
  {bg:'rgb(217, 0, 255)', arc:'rgb(158, 0, 186)'},
]

let timerId        = null,
    timeoutId      = null,
    tiles          = null,
    animationTasks = null,
    flagNum        = 0,
    flagMode       = false, 
    openNum        = 0,
    isGameover     = false,
    isMobile       = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

incorrectImage.src = './image/incorrect_flag.png'
flagAnimation.src  = './image/flag_plant.png'
flagImage.src      = `./image/flag_icon.png`


// add the event listeners.
window.addEventListener("resize", onResize)
levelCont.style.display = 'none'
levelSelect.parentElement.addEventListener("click", showLevelCont)
modeSelect.addEventListener("click", toggleFlagMode)
game.addEventListener("resize", onResize)
game.addEventListener("contextmenu", (e)=>{ e.preventDefault() })
cvs[cvs.length-1].addEventListener("mousemove", selectTile)
cvs[cvs.length-1].addEventListener("mouseleave", ()=>{  layer[3].clearRect(0,0,cvs[3].width, cvs[3].height) })



for(let i=0; i<cvs.length; ++i) {
    layer.push(cvs[i].getContext('2d') )
}

levelCheck['초급']   = levelCont.querySelectorAll("img")[0]
levelCheck['중급']   = levelCont.querySelectorAll("img")[1]
levelCheck['고급']   = levelCont.querySelectorAll("img")[2]
levelCheck['커스텀'] = levelCont.querySelectorAll("img")[3]
window.requestAnimationFrame(paintAnimation)
init(8,10,10,'초급')




/********************
 * functions for game
 ********************/


// init the game.
function init(r,c,b,lv) {    
  let color1 = 'rgb(146, 199, 93)',
      color2 = 'rgb(138, 188, 89)'
  
  levelSelect.innerHTML   = lv
  levelCont.style.display = 'none'
  animationTasks          = []
  isGameover              = false

  if(timerId!=null) {
    stopTimer() 
  }

  if(timeoutId!=null) {
    clearTimeout(timeoutId)
    timeoutId = null
  }

  if(lv!='커스텀') {
    level.r  = r
    level.c  = c
    level.b  = b
    level.rc = r * c 
  }

  levelCheck[level.lv].style.opacity = 0
  levelCheck[lv].style.opacity       = 1

  level.lv        = lv
  flag.innerHTML  = level.b
  flagNum         = level.b
  openNum         = 0
  timer.innerHTML = "000"
  tiles           = []
  genBombs()

  for(let i=0; i<cvs.length; ++i) {
    cvs[i].height = 30 * level.r 
    cvs[i].width  = 30 * level.c
  }

  for(let i=0; i<level.r; ++i) {
    for(let j=0; j<level.c; j+=2) {
      layer[2].fillStyle = color1
      layer[2].fillRect( (30*j),(30*i),30,30)

      layer[2].fillStyle = color2
      layer[2].fillRect( (30*j+30),(30*i),30,30)

      tiles[i][j].color   = color1
      tiles[i][j+1].color = color2
    }
    const temp = color1
    color1     = color2
    color2     = temp
  }

  onResize()
  setTimer()
  enableCanvasClick()
}


// the mousemove in cvs event handler.
function selectTile(e) {
  const tileWidth  = cvs[0].offsetWidth / level.c,
        tileHeight = cvs[0].offsetHeight / level.r,
        xpos       = 30 * Math.floor((e.clientX-game.offsetLeft) / tileWidth),
        ypos       = 30 * Math.floor((e.clientY-game.offsetTop-60) / tileHeight)
        
  layer[3].fillStyle = `rgba(255,255,255,0.4)`
  layer[3].clearRect(0,0, cvs[2].width, cvs[2].height)
  layer[3].fillRect(xpos, ypos, 30,30)
}



// the click on levelCont event handler.
function showLevelCont() {
   onResize()

   if(levelCont.style.display=='flex') {
    levelCont.style.display = 'none'
   }
   else {
    levelCont.style.display = 'flex'
   }
}


// the resize event handler
function onResize() {
  const offsetX = (game.clientWidth - document.querySelector(".topCont").clientWidth) / 2,
        offsetY = -cvs[0].offsetHeight-20

  levelCont.style.transform = `translate(
    ${offsetX}px, ${offsetY}px
  )` 

  if(isMobile) {
    game.style.width  = '100%'
    game.style.height = '100%'
  }

  else {
    const requiredWidth  = level.c * 30,
          requiredHeight = level.r * 30
    const gameSize = Math.max( 
      Math.max(requiredHeight,requiredWidth),
      MIN_GAME_SIZE
    )
    game.style.width  = `${Math.min(gameSize, document.body.offsetWidth)}px`
    game.style.height = `${Math.min(gameSize, document.body.offsetHeight)}px`
  }
}

// change the flagMode
function toggleFlagMode() {
  const modeImage = modeSelect.querySelector("img")
  
  if(flagMode) {
    modeImage.src = './image/mine.png'  
  } 
  else {
    modeImage.src = './image/flag_icon.png'
  }
  flagMode = !flagMode
}



// set the timer.
function setTimer() {
  timerId = setInterval(()=>{
    const tm = parseInt(timer.innerHTML)
    if(tm<999) {
      timer.innerHTML = String(tm+1).padStart(3,'0')
    }
  }, 1000)
}


// stop the timer.
function stopTimer() {
  clearInterval(timerId)
  timerId = null
}


// generate the bombs.
function genBombs() {
  const raffleBox = []
  let   gencnt    = 0 

  for(let i=0; i<level.r; ++i) {
    tiles.push(new Array(level.c+1) )

    for(let j=0; j<level.c; ++j) {
      raffleBox.push({x:j, y:i}) // initialize the raffleBox
      tiles[i][j] = {
        bomb         : false,   // whether it is bomb
        flag         : COVERED, // tile flag status
        surroundBombs: 0,       // number of the surrond bombs.
        color        :'',       // tile color.
      }
    }
  }
 
  while(gencnt < level.b) {
    const randIndex = Math.floor(Math.random() * raffleBox.length),
          randTile  = raffleBox[randIndex]
    tiles[randTile.y][randTile.x].bomb = true
    raffleBox.splice(randIndex,1)
    gencnt++
  }
}


// enable the canvas click event.
function enableCanvasClick() {
  if(isMobile) {
    cvs[cvs.length-1].addEventListener("pointerdown",onPointerdownTile)
  }
  else {
    cvs[cvs.length-1].addEventListener("mousedown", onClickTile)
  }
}


// disable the canvas click event.
function disableCanvasClick() {
  if(isMobile) {
    cvs[cvs.length-1].removeEventListener("pointerdown",onPointerdownTile)
  }
  else {
    cvs[cvs.length-1].removeEventListener("mousedown", onClickTile)
  }
}


// the mousedown event for mobile device 
function onPointerdownTile(e) {
  const touch     = { type: LONG_PRESS }
  const timeoutId = setTimeout(()=>{
    cvs[cvs.length-1].removeEventListener("touchend", foo)
    cvs[cvs.length-1].removeEventListener("touchmove", goo)
    onClickTile(e,touch)
  }, 300) 

  // detect short press.
  const foo = ()=>{ 
    touch.type = SHORT_PRESS
    clearTimeout(timeoutId)
    cvs[cvs.length-1].removeEventListener("touchend", foo)
    cvs[cvs.length-1].removeEventListener("touchmove", goo)
    onClickTile(e,touch)
  }

  // detect touch cancel.
  const goo = ()=>{
    clearTimeout(timeoutId)
    cvs[cvs.length-1].removeEventListener("touchend", foo)
    cvs[cvs.length-1].removeEventListener("touchmove", goo)
  }

  cvs[cvs.length-1].addEventListener("touchend", foo)
  cvs[cvs.length-1].addEventListener("touchmove", goo)
}



// the click canvas event handler.
function onClickTile(e, t) {
  const tileWidth   = cvs[0].offsetWidth / level.c,
        tileHeight  = cvs[0].offsetHeight / level.r,
        xpos        = Math.floor((e.clientX-game.offsetLeft) / tileWidth),
        ypos        = Math.floor((e.clientY-game.offsetTop-60) / tileHeight)
  let   clicktype   = (isMobile && t.type==SHORT_PRESS) || (!isMobile && e.buttons==1) // true: short_press, false: long_press
  
  if(isOutOfBounds(ypos, xpos) ) {
    return
  }

  if(flagMode) {
    clicktype = !clicktype
  }

  // set or unset the flag.
  if(clicktype==LONG_PRESS && !isOpened(ypos, xpos) ) {

    if(isCovered(ypos,xpos) ) {
      flagNum--
      tiles[ypos][xpos].flag = PLANTING_FLAG

      animationTasks.push({
        x       : xpos, 
        y       : ypos,
        curFrame: 0, 
        type    :'plant'
      })
    }

    else if(isFlagPlanted(ypos, xpos) ) {
      flagNum++
      layer[5].clearRect(xpos*30,ypos*30,30,30)
      tiles[ypos][xpos].flag = COVERED

      animationTasks.push({
        x        : xpos * 30, 
        y        : ypos * 30, 
        rad      : 0, 
        rot      : 0,
        yMax     : 20 + Math.random() * 20,
        direction: [-1,1][Math.round(Math.random() )],
        cur      : ypos * 30, 
        size     : 30, 
        type     :'remove'
      })
    }

    flag.innerHTML = flagNum
  }


  // uncover tile.
  else {
    if(isCovered(ypos,xpos) ) {

      if(isBomb(ypos, xpos) ) {
        isGameover = true
        shakeCanvas(1,2)
        disableCanvasClick()
        setTimeout(popAllBombs,1000, ypos, xpos)
      }
      else {
        shakeCanvas(0.5, 2)
        openTileNotBomb(ypos,xpos)
      }
    }

    // uncover the surround tiles.
    else if(hasSurroundBombs(ypos,xpos) ) {
      const test          = flagTest(ypos,xpos),
            surroundBombs = tiles[ypos][xpos].surroundBombs

      if(test.nFlags==surroundBombs) {
        if(test.isCorrect) {

          // when the tile have not uncovered tiles, which is not bomb.
          if(test.empty.length==0) {
            tiles[ypos][xpos].flag = OPENED_WITH_NO_SURROUND_BOMBS
            return
          }
          test.empty.forEach((e)=>{
            openTileNotBomb(e.y, e.x)
          })
          shakeCanvas(1, 2)
          tiles[ypos][xpos].flag = OPENED_WITH_NO_SURROUND_BOMBS
        }
  
        else {
          isGameover = true
          shakeCanvas(0.5,2)
          disableCanvasClick()
          setTimeout(popAllBombs,1000, ypos, xpos)
        }
      }
    }
  }


  // when the number of the flags is zero, and 
  // of tiles opened is exactly the number of (r*c-b),
  // game is over, and you win.
  if(flagNum==0 && level.rc-openNum == level.b) {
    isGameover = true
    disableCanvasClick()
    bloomAllBombs(ypos, xpos)
  }
}





// open tiles which is not bomb.
function openTileNotBomb(r,c) {
  let surroundBombs = 0,
      top, right, bottom, left,
      leftTop, rightTop, 
      rightBottom, leftBottom

  if(isOutOfBounds(r,c) ) {
    return
  }

  if(isOpened(r,c) ) {
    return
  }

  animationTasks.push({
    x        : c*30, 
    y        : r*30, 
    rad      : 0, 
    rot      : 0, 
    color    : tiles[r][c].color,
    yMax     : 20 + Math.random() * 20,
    direction: [-1,1][Math.round(Math.random() )],
    cur      : r*30, 
    size     : 15 + Math.random() * 15, 
    type     : 'open'
  })

  layer[0].fillStyle = (tiles[r][c].color=='rgb(146, 199, 93)')
                     ?  'rgb(211, 189, 156)' 
                     : 'rgb(201, 175, 137)'
  layer[0].fillRect(30*c, 30*r, 30,30)
  layer[2].clearRect(30*c, 30*r, 30,30)
  layer[4].clearRect(30*c, 30*r, 30,30)
  layer[5].clearRect(30*c, 30*r, 30,30)
  openNum++

  if(!isOutOfBounds(r-1,c)   ) surroundBombs += top         = getTileInfo(r-1,c)   // ↑
  if(!isOutOfBounds(r,c+1)   ) surroundBombs += right       = getTileInfo(r,c+1)   // → 
  if(!isOutOfBounds(r+1,c)   ) surroundBombs += bottom      = getTileInfo(r+1,c)   // ↓
  if(!isOutOfBounds(r,c-1)   ) surroundBombs += left        = getTileInfo(r,c-1)   // ←
  if(!isOutOfBounds(r-1,c-1) ) surroundBombs += leftTop     = tiles[r-1][c-1].bomb // ↖
  if(!isOutOfBounds(r-1,c+1) ) surroundBombs += rightTop    = tiles[r-1][c+1].bomb // ↗
  if(!isOutOfBounds(r+1,c+1) ) surroundBombs += rightBottom = tiles[r+1][c+1].bomb // ↘
  if(!isOutOfBounds(r+1,c-1) ) surroundBombs += leftBottom  = tiles[r+1][c-1].bomb // ↙

  if(surroundBombs==0) {
    tiles[r][c].flag = OPENED_WITH_NO_SURROUND_BOMBS
    openTileNotBomb(r-1,c)   // ↑
    openTileNotBomb(r,c+1)   // →
    openTileNotBomb(r+1,c)   // ↓
    openTileNotBomb(r,c-1)   // ←
    openTileNotBomb(r-1,c-1) // ↖
    openTileNotBomb(r-1,c+1) // ↗
    openTileNotBomb(r+1,c+1) // ↘
    openTileNotBomb(r+1,c-1) // ↙
    return
  }

  tiles[r][c].flag = OPENED_WITH_SURROUND_BOMBS

  if(top==null)    top    = 1
  if(right==null)  right  = 1
  if(bottom==null) bottom = 1
  if(left==null)   left   = 1


  // paint the tile's borders.
  layer[5].textAlign = 'center'
  layer[5].font      = 'bold 20px Franklin Gothic Medium'
  layer[5].fillStyle = numColor[surroundBombs]
  layer[5].fillText(String(surroundBombs), 15+30*c, 22+30*r)
  layer[5].fill()
  tiles[r][c].surroundBombs = surroundBombs

  layer[4].fillStyle = 'rgb(58, 98, 33)'

  if(right) layer[4].fillRect(30*c+30,30*r, 2,30)
  if(left)  layer[4].fillRect(30*c-2, 30*r,2,30 )
    
  if(top) {
    layer[4].fillRect(30*c, 30*r-2, 30,2)

    if(left && (leftTop || (!isOutOfBounds(r-1,c-1) && !isOpened(r-1,c-1) ))) {
      layer[4].fillRect(30*c-2, 30*r-2, 2,2)
    }
    if(right && (rightTop || (!isOutOfBounds(r-1,c+1) && !isOpened(r-1,c+1) ))) {
      layer[4].fillRect(30*c+30, 30*r-2, 2,2)
    }
  }

  if(bottom) {
    layer[4].fillRect(30*c, 30*r+30, 30,2)

    if(left && (leftBottom || (!isOutOfBounds(r+1,c-1) && !isOpened(r+1,c-1) ))) {
      layer[4].fillRect(30*c-2, 30*r+30, 2,2)
    }
    if(right && (rightBottom || (!isOutOfBounds(r+1,c+1) && !isOpened(r+1,c+1) ))) {
      layer[4].fillRect(30*c+30, 30*r+30, 2,2)
    }
  }   
}


// pop the all bombs.
function popAllBombs(r,c) {
  const bombList = [],
        flagList = [],
        start    = {x:c, y:r}

  stopTimer()

  for(let i=0; i<level.r; ++i) {
    for(let j=0; j<level.c; ++j) {

      if(isFlagPlanted(i,j) && !isBomb(i,j) ) {
        flagList.push({x: j, y: i})
      }

      else if(isBomb(i,j) && isCovered(i,j) ) {
        bombList.push({ 
          x:j, y:i, 
          dist: Math.abs(j-start.x) +
                Math.abs(i-start.y)
        })
      }
    }
  }
  bombList.sort((a,b)=>{
    return (a.dist)-(b.dist)
  })

  setPopAnimation(bombList[0].y,
                  bombList[0].x,
                  bombList, 
                  flagList,0)
}


// bloom the all bombs
function bloomAllBombs(r,c) {
  const bombList = [],
        numList  = []

  stopTimer()
  for(let i=0; i<level.r; ++i) {
    for(let j=0; j<level.c; ++j) {
      if(isBomb(i,j) ) {
        bombList.push({y:i,x:j})
      }

      else if(tiles[i][j].surroundBombs ) {
        numList.push({y:i, x:j})
      }
    }
  }

  setTimeout(()=>{
    animationTasks.push({
      type  :'shine',
      lst   :bombList,
      lst2  :numList,
      alpha : 0.8
    })
  }, 1000)
}


// check the tile's Integrity
function flagTest(r,c) {
  const result = {nFlags:0, isCorrect:true,
                  empty:[] }
  const surround = [
    {y:r-1,x:c},{y:r,x:c+1},{y:r+1,x:c},{y:r,x:c-1},
    {y:r-1,x:c-1},{y:r-1,x:c+1},{y:r+1,x:c+1},{y:r+1,x:c-1}
  ]
  
  for(let i=0; i<8; ++i) {
    if(isOutOfBounds(surround[i].y, surround[i].x) ) {
      continue
    }

    const x = surround[i].x,
          y = surround[i].y
   
    // flag is planted on the tile, but actually it's not bomb
    if(isFlagPlanted(y,x) ) { 
      result.nFlags++

      if(!isBomb(y,x) ) {
        result.isCorrect = false
      }
    }

    // not opened yet, It's not bomb.
    else if(!isOpened(y,x) ) { 
      if(!isBomb(y,x) ) {
        result.empty.push({
          x:surround[i].x,
          y:surround[i].y
        })
      }
    }
  } 
  return result
}



/**************************
 * Helper functions
 *************************/


// check if the position is out of the bounds
function isOutOfBounds(r,c) {
  return (r<0) || (level.r <= r) ||
         (c<0) || (level.c <= c)
}


// check if the tile is opened.
function isOpened(r,c) {
  return (tiles[r][c].flag > PLANTED_FLAG)
}


// check if the tile is bomb.
function isBomb(r,c) {
  return tiles[r][c].bomb
}


// check if flag is planted on the tile.
function isFlagPlanted(r,c) {
  return tiles[r][c].flag == PLANTED_FLAG
}


// check if the tile is covered.
function isCovered(r,c) {
  return tiles[r][c].flag==COVERED
}


// check if the tile's opened and have the surrounded bombs.
function hasSurroundBombs(r,c) {
  return tiles[r][c].flag==OPENED_WITH_SURROUND_BOMBS
}


// check if the tile's opened and have not the surrounded bombs.
function hasNotSurroundBombs(r,c) {
  return tiles[r][c].flag==OPENED_WITH_NO_SURROUND_BOMBS
}



// get the tile(r,c)'s information.
function getTileInfo(r,c) {
  if(isBomb(r,c) ) {
    return 1
  }

  if(!isOpened(r,c) ) {
    return null
  }
  return 0
}



/************************
 * animation functions
 ***********************/


// paint a animation
function paintAnimation(t) {
  if(animationTasks.length) {
    layer[6].clearRect(0,0,cvs[6].width, cvs[6].height)

    for(let i=0; i<animationTasks.length; ++i) {
      switch(animationTasks[i].type) {
        case'plant': plantFlag(i)
                     break
        case'remove': removeFlag(i)
                      break
        case'open': openTile(i)
                    break
        case'pop': popTile(i)
                   break
        case'leaf': flyLeaf(i)
                    break
        case'bloom': bloomTile(i)
                     break
        case'shine': shineTile(i)
                     break
        case'disappear': disappearNumber(i)
                         break
        case'wave': putWave(i)
                    break
      }
    }
  }
  window.requestAnimationFrame(paintAnimation)
}



// animation1: plant a flag.
function plantFlag(taskId) {
  const task = animationTasks[taskId]

  if(task.curFrame==10) {
    animationTasks.splice(taskId,1)
    tiles[task.y][task.x].flag = PLANTED_FLAG
    layer[5].drawImage(flagImage, (task.x*30),(task.y*30),30,30)
    return
  }
  const sy = 81 * (task.curFrame++),
        dx = task.x * 30,
        dy = task.y * 30
  layer[6].drawImage(flagAnimation, 0,sy,80,81,
                                    dx,dy,30,30)
}


// animation2: remove a flag.
function removeFlag(taskId) {
  const task = animationTasks[taskId]

  if(task.rad >= (oneRad * 270) ) {
    animationTasks.splice(taskId,1)
    return
  }

  const centerX = task.x + task.size * 0.5,
        centerY = task.cur + task.size * 0.5,
        flagSize = Math.round(task.size)

  layer[6].translate(centerX, centerY)
  layer[6].rotate(task.rot * task.direction)
  layer[6].translate(-centerX, -centerY)

  layer[6].drawImage(flagImage, task.x, task.cur,
                                flagSize, flagSize)
  layer[6].resetTransform()

  if(task.rad<=(oneRad*180) ) {
    task.rad += 0.1
    task.rot += 0.015
    task.x += task.direction
    task.cur = task.y + -Math.sin(task.rad) * task.yMax
  }

  else {
    task.rad += 0.04
    task.rot += 0.05
    task.size = (task.size<0) ? (0) : (task.size-1)
    task.cur = task.y + -Math.sin(task.rad) * (task.yMax*2)
  }
}


// animation3: open the tile
function openTile(taskId) {
  const task = animationTasks[taskId]

  if(task.rad >= (oneRad * 200) ) {
    animationTasks.splice(taskId,1)
    return
  }

  const centerX = task.x + task.size * 0.5,
        centerY = task.cur + task.size * 0.5

  layer[6].translate(centerX, centerY)
  layer[6].rotate(task.rot * task.direction)
  layer[6].translate(-centerX, -centerY)

  layer[6].fillStyle = task.color
  layer[6].fillRect(task.x, task.cur, task.size, task.size*0.6)
  layer[6].resetTransform()
  task.rot += 0.01

  if(task.rad<=(oneRad*180) ) {
    task.rad += 0.06
    task.x += task.direction
    task.cur = task.y + -Math.sin(task.rad) * task.yMax
  }

  else {
    task.rad += 0.04
    task.size = (task.size<0) ? (0) : (task.size-2)
    task.cur = task.y + -Math.sin(task.rad) * (task.yMax*2)
  }
}



// animation4: pop tile which have the bomb.
function popTile(taskId) {
  const task = animationTasks[taskId]
 
  if(task.alpha <= 0.0) {
    animationTasks.splice(taskId,1)

    if(task.lst.length>task.cur) {
      const l = task.lst[task.cur]
      timeoutId = 
      setTimeout(setPopAnimation, 
                 Math.round(Math.random() * 20),
                 l.y, l.x, task.lst, task.lst2, task.cur)
    }
    else {
      const l2          = task.lst2
      const shakeAmount = (l2.length>3) ? (3) : (0.5*l2.length)
      shakeCanvas(shakeAmount,3)

      for(let i=0; i<l2.length; ++i) {
        animationTasks.push({
          x        : l2[i].x*30,
          y        : l2[i].y*30, 
          rad      : 0, 
          rot      : 0,
          yMax     : 60 + Math.random() * 20,
          direction: [-1,1][Math.round(Math.random() )],
          cur      : l2[i].y*30, 
          size     :30, 
          type     :'remove'
        })
        layer[5].clearRect(30*l2[i].x, 30*l2[i].y, 30,30)
        layer[2].drawImage(incorrectImage, 30*l2[i].x, 30*l2[i].y,30,30)
        layer[2].fill()
      }
    }
    
    flag.innerHTML = String(--flagNum)
    return
  }
  layer[5].clearRect(task.x, task.y, 30,30)
  layer[5].fillStyle = 'white'
  layer[5].globalAlpha = task.alpha
  layer[5].fillRect(task.x, task.y,30,30)
  layer[5].globalAlpha = 1.0
  task.alpha -= 0.05
}


// animation5: fly the leaves.
function flyLeaf(taskId) {
  const task = animationTasks[taskId]
  layer[6].fillStyle = task.color

  if(!task.leaf.length) {
    animationTasks.splice(taskId,1)
    return
  }
  
  for(let i=0; i<task.leaf.length; ++i) {
    const leaf = task.leaf[i]
    const centerX = leaf.x + leaf.size * 0.5,
          centerY = leaf.y + leaf.size * 0.5,
          size    = Math.round(leaf.size)

    if(leaf.size<=0) {
      task.leaf.splice(i--,1)
      continue
    }

    layer[6].translate(centerX, centerY)
    layer[6].rotate(leaf.rot * leaf.direction)
    layer[6].translate(-centerX, -centerY)
    layer[6].fillRect(leaf.curX, leaf.curY,
                      size, (size * 0.6) )
    layer[6].resetTransform()

    if(leaf.radY<=(oneRad*120) ) {
      leaf.curY = leaf.y -Math.sin(leaf.radY) * leaf.yMax
      leaf.radY += 0.03
      leaf.rot += 0.001
      leaf.x += leaf.direction * leaf.xSpeed
      leaf.curX = leaf.x
    }

    else if(leaf.radY<=(oneRad*135) ) {
      leaf.curY = leaf.y -Math.sin(leaf.radY) * leaf.yMax
      leaf.radY += 0.01
      leaf.x += leaf.direction * leaf.xSpeed
      leaf.curX = leaf.x
    }

    else {
      leaf.size-= 0.05
      leaf.curY += leaf.ySpeed
      leaf.curX = leaf.x + leaf.direction * Math.sin(leaf.radX) * 30
      leaf.radX += 0.05
    }
  }
}


// animation6: bloom on tiles.
function bloomTile(taskId) {
  const task = animationTasks[taskId],
        flowers = task.flowers

  if(!flowers.length) {
    animationTasks.splice(taskId,1)
    return
  }

  for(let i=0; i<flowers.length; ++i) {
    const flower = flowers[i]
    
    if(flower.curSize >= flower.maxSize ) {
      drawFlower(flower, layer[5])
      flowers.splice(i--,1)
      continue
    }
    drawFlower(flower, layer[6])
    flower.rot += 0.02
    flower.curSize += 0.1
  }
}


// animation7: shine the tiles.
function shineTile(taskId) {
  const task = animationTasks[taskId]

  if(task.alpha<=0) {
    setTimeout(()=>{
      for(let i=0; i<task.lst.length; ++i) {
        const b = task.lst[i]

        animationTasks.push({
          x        : b.x*30, 
          y        : b.y*30, 
          rad      : 0, 
          rot      : 0,
          yMax     : 40 + Math.random() * 20,
          direction: [-1,1][Math.round(Math.random() )],
          cur      : b.y*30, 
          size     : 30, 
          type     :'remove'
        })
        layer[5].clearRect(b.x*30, b.y*30, 30,30)
      }

      animationTasks.push({
        type :'disappear',
        lst  : task.lst2,
        alpha: 0.8
      })

      timeoutId = 
      setTimeout(setBloomAnimation, 3500, task.lst)

    }, 1300)
    animationTasks.splice(taskId,1)
    return
  }
  
  layer[6].globalAlpha = task.alpha
  task.alpha -= 0.02

  for(let i=0; i<task.lst.length; ++i) {
    const b = task.lst[i]
    layer[6].clearRect(b.x*30, b.y*30, 30,30)
    layer[6].fillStyle = 'white'
    layer[6].fillRect(b.x*30, b.y*30, 30,30)
  }
  layer[6].globalAlpha = 1
}


// animation8: disappear the number.
function disappearNumber(taskId) {
  const task = animationTasks[taskId]

  if(task.alpha<=0) {
    animationTasks.splice(taskId)

    animationTasks.push({
      type :'wave',
      range:0,
      alpha:0
    })
    return
  }

  layer[5].globalAlpha = task.alpha
  layer[5].clearRect(0,0, cvs[5].width, cvs[5].height)

  for(let i=0; i<task.lst.length; ++i) {
    const b = task.lst[i]
    const surroundBombs = tiles[b.y][b.x].surroundBombs

    layer[5].textAlign = 'center'
    layer[5].font = 'bold 20px Franklin Gothic Medium' 
    layer[5].fillStyle = numColor[surroundBombs]
    layer[5].fillText(String(surroundBombs), 15+30*b.x, 22+30*b.y)
    layer[5].fill()
  }
  task.alpha -= 0.02
  layer[5].globalAlpha = 1
}


// animation9: put wave.
function putWave(taskId) {
  const task = animationTasks[taskId]

  if(task.range==2.0) {
    animationTasks.splice(taskId)
    return
  }

  const gradient = layer[1].createRadialGradient(
    (cvs[1].width*0.5), -80, 10,
    (cvs[1].width*0.5), -80, (task.range * cvs[1].height*4.5),
  )

  gradient.addColorStop(0, `rgb(113, 235, 251,${task.alpha})`)
  gradient.addColorStop(1, `rgb(113, 235, 251,0)`)

  layer[1].fillStyle = gradient
  layer[1].clearRect(0,0,cvs[1].width, cvs[1].height)
  layer[1].fillRect(0,0,cvs[1].width, cvs[1].height)
  task.alpha += 0.01
  task.range += 0.0028

  if(task.alpha > 0.8) {
    task.alpha = 0.8
  }

  if(task.range > 2.0) {
    task.range = 2.0
  }
}



// register animation, leaf, pop and open.
function setPopAnimation(r,c, bombList, 
                         flagList, curIndex) {
  const colorIndex = Math.round(Math.random()*6),
        leafCont   = [], 
        to         = 4 + Math.round(Math.random() * 5)

  // create a leaf container.
  for(let i=0; i<to; ++i) {
    leafCont.push({
      ySpeed   : 0.2 + Math.random() * 2,
      xSpeed   : 0.05 + Math.random() * 0.5,
      yMax     : 100 + Math.random() * 30, 
      size     : 5 + Math.random() * 10,
      radY     : 0, 
      radX     : 0, 
      rot      : 0, 
      x        : 30*c, 
      y        : 30*r, 
      curX     : 30*c,
      curY     : 30*r,
      direction: [-1,1][Math.round(Math.random() )],
    })
  }

  // register leaf animation.
  animationTasks.push({
    type : 'leaf', 
    leaf : leafCont, 
    color: bombColor[colorIndex].bg
  })

  // register pop animation
  animationTasks.push({
    type : 'pop', 
    lst  : bombList, 
    cur  : curIndex+1,
    alpha: 0.6, 
    rad  : 0, 
    x    : c*30,
    y    : r*30, 
    lst2 : flagList
  })

  // register open animation.
  animationTasks.push({
    x        : c*30, 
    y        : r*30, 
    curX     : c*30, 
    curY     : r*30, 
    rad      : 0, 
    rot      : 0, 
    color    : tiles[r][c].color,
    yMax     : 40 + Math.random() * 40,
    direction: [-1,1][Math.round(Math.random() )],
    size     : 15 + Math.random() * 15, 
    type     : 'open'
  })

  shakeCanvas(1,1)
  layer[2].fillStyle = bombColor[colorIndex].bg
  layer[2].fillRect(30*c, 30*r, 30,30)

  layer[2].fillStyle = bombColor[colorIndex].arc
  layer[2].beginPath()
  layer[2].arc(30*c+15, 30*r+15, 10, 0, Math.PI*2)
  layer[2].fill()
}




// draw a flower.
function drawFlower(flower, layer) {
  switch(flower.kind) {
    case 0: drawFlower1(flower, layer)
            break
    case 1: drawFlower2(flower, layer)
            break
    case 2: drawFlower3(flower, layer)
            break
  }
}


// draw the flower type 1.
function drawFlower1(flower, layer) {
  const size = flower.curSize,
        s2   = Math.floor(size/2),
        s3   = size-s2,
        cx   = flower.x,
        cy   = flower.y
  
  layer.resetTransform()
  layer.translate(cx, cy)
  layer.rotate(flower.rot * flower.direction)
  layer.translate(-cx,-cy)

  layer.fillStyle = bombColor[flower.colorIndex].bg
  layer.beginPath()
    layer.moveTo( (cx-s3), cy )
    layer.quadraticCurveTo( (cx-size), (cy-size),  cx,    (cy-s3) )
    layer.quadraticCurveTo( (cx+size), (cy-size), (cx+s3), cy )
    layer.quadraticCurveTo( (cx+size), (cy+size),  cx,    (cy+s3) )
    layer.quadraticCurveTo( (cx-size), (cy+size), (cx-s3), cy )
  layer.closePath()
  layer.fill()

  layer.fillStyle = bombColor[flower.colorIndex].arc
  layer.beginPath()
  layer.arc(cx, cy, size/2, 0, Math.PI * 2)
  layer.closePath()
  layer.fill()
}


// draw the flower type 2.
function drawFlower2(flower, layer) {
  const size = flower.curSize, 
        cx   = flower.x,
        cy   = flower.y

  layer.resetTransform()
  layer.fillStyle = bombColor[flower.colorIndex].bg
  layer.beginPath()
  layer.arc(cx,cy, size, 0, Math.PI * 2)
  layer.closePath()
  layer.fill()

  layer.fillStyle = bombColor[flower.colorIndex].arc
  layer.beginPath()
  layer.arc(cx,cy, size/2, 0, Math.PI*2)
  layer.closePath()
  layer.fill()
}


// draw the flower type 3.
function drawFlower3(flower, layer) {
  const size = flower.curSize,
        s2   = Math.floor(size/2),
        s3   = size-s2,
        cx   = flower.x,
        cy   = flower.y

  layer.resetTransform()
  layer.translate(cx, cy)
  layer.rotate(flower.rot * flower.direction)
  layer.translate(-cx,-cy)
  layer.fillStyle = bombColor[flower.colorIndex].bg
        
  layer.beginPath() 
    layer.moveTo((cx-s3), (cy-size) )
    layer.quadraticCurveTo(  cx,    (cy-s3), (cx+s3),   (cy-size) )
    layer.quadraticCurveTo( (cx+s3), cy,     (cx+size),  cy       )
    layer.quadraticCurveTo( (cx+s3), cy,     (cx+s3),   (cy+size) )
    layer.quadraticCurveTo(  cx,    (cy+s3), (cx-s3),   (cy+size) )
    layer.quadraticCurveTo( (cx-s3), cy,     (cx-size),  cy       )
    layer.quadraticCurveTo( (cx-s3), cy,     (cx-s3),   (cy-size) )
  layer.closePath()
  layer.fill()
        
  layer.fillStyle = bombColor[flower.colorIndex].arc
  layer.beginPath()
  layer.arc(cx, cy, size/2, 0, Math.PI * 2)
  layer.closePath()
  layer.fill()
}


// shake layerContainer.
function shakeCanvas(shakeAmount, nLoop) {

  const shakeTransform = [
    `translate(${-shakeAmount}px,0px)`,
    `translate(${-shakeAmount}px,${shakeAmount}px)`,
    `translate(${shakeAmount}px,${shakeAmount}px)`,
    `translate(${shakeAmount}px,${-shakeAmount}px)`,
    ``,
  ]

  for(let i=0; i<nLoop; ++i) {
    setTimeout(setShakeEffect, i*250,       shakeTransform, 0)
    setTimeout(setShakeEffect, 50 + i*250,  shakeTransform, 1)
    setTimeout(setShakeEffect, 100 + i*250, shakeTransform, 2)
    setTimeout(setShakeEffect, 150 + i*250, shakeTransform, 3)
    setTimeout(setShakeEffect, 200 + i*250, shakeTransform, 4)
  }
}


// set shake effect.
function setShakeEffect(shakeTransform, direction) {
  layerCont.style.transform = shakeTransform[direction]
}


// set bloom animation.
function setBloomAnimation(bombList) {
  for(let i=0; i<bombList.length; ++i) {
    const r = 30 * bombList[i].y,
          c = 30 * bombList[i].x  

    const flowerCont = [],  // flower Container.
          nFlowers   = 1 + Math.round(Math.random() * 3),  // number of flower created
          quadrant   = [ 
            { x:c, y:r }, { x:c+15, y:r },  // 1~4 quadrant
            { x:c, y:r+15 },{ x:c+15, y:r+15 } 
          ]  

    for(let i=0; i<nFlowers; ++i) {
      const quadIndex  = Math.round(Math.random() * (quadrant.length-1) ), // select one of the quadrant
            quad       = quadrant[quadIndex],
            flowerSize = 4 + Math.round(Math.random() * 3),                // the size of flower (4~7)
            free       = 15 - (flowerSize*2),                              // the position where can put a center of flower
            offsetX    = flowerSize + Math.round(Math.random() * free),           
            offsetY    = flowerSize + Math.round(Math.random() * free)

      flowerCont.push({
        colorIndex: Math.round(Math.random() * 6),
        rot       : 0.0,
        maxSize   : flowerSize,
        curSize   : 0,
        kind      : Math.round(Math.random() * 2), 
        x         : quad.x + offsetX,
        y         : quad.y + offsetY,
        direction : [-1,1][Math.round(Math.random() )]
      })
      quadrant.splice(quadIndex,1)
    }

    animationTasks.push({
      type   :'bloom',
      flowers:flowerCont,
    })
  }
}
