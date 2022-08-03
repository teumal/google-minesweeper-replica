
const gameMenu = document.querySelector("#minesweeper div.game-menu"),
      levelSelect = document.querySelector("#minesweeper .game .level-select"),
      game = document.querySelector("#minesweeper .game"),
      timer = document.querySelector("#minesweeper .game .time span"),
      flag = document.querySelector("#minesweeper .game .center .set-flag span"),
      layerCont = document.querySelector("#minesweeper .game .layers")

const cvs0 = document.querySelector(".game .layer0"),
      cvs1 = document.querySelector(".game .layer1"),
      cvs2 = document.querySelector(".game .layer2"),
      cvs3 = document.querySelector(".game .layer3"),
      cvs4 = document.querySelector(".game .layer4"),
      cvs5 = document.querySelector(".game .layer5"),

      layer0 = cvs0.getContext('2d'),
      layer1 = cvs1.getContext("2d"),  
      layer2 = cvs2.getContext("2d"),
      layer3 = cvs3.getContext('2d'),
      layer4 = cvs4.getContext('2d'),
      layer5 = cvs5.getContext('2d'),

      flagImage      = new Image(),
      incorrectImage = new Image(), 
      flagAnimation  = new Image()

let   bombs, lv, flagNum, isGameOver = false,
      animationTasks, timerId, timeoutId,
      oneRad = (Math.PI/180.0), openNum

const option = {
  '초급': {r:8,c:10, rc:80,b:10,w:'425px',h:'450px'},
  '중급': {r:14,c:18,rc:252,b:40,w:'500px',h:'480px'},
  '고급': {r:20,c:24,rc:480,b:99,w:'700px',h:'680px'}
}

const numberColoring = [
  '#FFFFFF','#2452DA','#289A30','#742E0B','#0E175B',
  '#3D1A07','#056287','#000000','#838383'
];


const popColoring = [
  {bg:'rgb(153, 0, 255)', arc:'rgb(113, 0, 188)'},
  {bg:'rgb(255,0,0)',     arc:'rgb(196, 1, 1)'},
  {bg:'rgb(255, 205, 3)', arc:'rgb(203, 163, 1)'},
  {bg:'rgb(16, 122, 94)', arc:'rgb(10, 81, 62)'},

  {bg:'rgb(255, 132, 0)', arc:'rgb(192, 99, 0)'},
  {bg:'rgb(0, 238, 255)', arc:'rgb(0, 162, 174)'},
  {bg:'rgb(217, 0, 255)', arc:'rgb(158, 0, 186)'},
]


incorrectImage.src = './image/incorrect_flag.png'
flagAnimation.src = './image/flag_plant.png'
flagImage.src = `./image/flag_icon.png`

game.style.display = 'none';
game.addEventListener("contextmenu", (e)=>{ e.preventDefault() })

gameMenu.addEventListener("mousedown", onMouseDownGamemenu)
levelSelect.addEventListener("click", onClickLevelSelect);
cvs5.addEventListener("mousemove", onMousemoveCvs)
cvs5.addEventListener("mouseleave", onMouseLeaveCvs)
addCanvasEvent()




// 캔버스 내에서 커서를 움직인 경우.
function onMousemoveCvs(e) {
  const ms = document.querySelector("#minesweeper")
  const bombWidth = cvs2.offsetWidth / option[lv].c
  const bombHeight = cvs2.offsetHeight / option[lv].r

  const x = Math.floor( (e.clientX-ms.offsetLeft) / bombWidth )
  const y = Math.floor( (e.clientY-ms.offsetTop-60) / bombHeight )

  layer3.clearRect(0,0, cvs2.width, cvs2.height)
  layer3.fillStyle = 'rgba(255,255,255,0.4)'
  layer3.fillRect(x*30, y*30,30,30)
}


// 캔버스에서 커서가 나간 경우.
function onMouseLeaveCvs(e) {
  layer3.clearRect(0,0, cvs2.width, cvs2.height)
}



// 캔버스 상호작용을 비활성화 한다.
function removeCanvasEvent() {
  cvs5.removeEventListener("mousedown", onMouseDownCvs,true)
}



// 캔버스 상호작용을 활성화 한다.
function addCanvasEvent() {
  cvs5.addEventListener("mousedown", onMouseDownCvs,true)
}



// 캔버스 내에서 마우스 클릭을 한 경우.
function onMouseDownCvs(e) {
  const ms = document.querySelector("#minesweeper")
  const bombWidth = cvs2.offsetWidth / option[lv].c
  const bombHeight = cvs2.offsetHeight / option[lv].r

  const col = Math.floor( (e.clientX-ms.offsetLeft) / bombWidth )
  const row = Math.floor( (e.clientY-ms.offsetTop-60) / bombHeight )

  // left-mouse
  if(e.buttons == 1) { 
    if(bombs[row][col].flag==2) { // 플래그가 설치되어있을 때는, 타일열기 불가.
      return
    }

    else if(bombs[row][col].flag==3) { // 타일 근처의 지뢰 만큼, 주변에 플래그 존재.
      const testResult = flagTest(row,col)

      if(testResult.nFlags==bombs[row][col].surroundBombs) {
        if(testResult.isCorrect) {
          testResult.empty.forEach((e)=>{
            openTileNotBomb(e.y, e.x)
          })
          shakeCanvas(1,1)
        }
        else {
          shakeCanvas(3, 2)
          removeCanvasEvent()
          setTimeout(popAllBombs,1000, row,col)
        }
      }
    }

    else if(bombs[row][col].bomb) { // 지뢰타일을 열음.
      shakeCanvas(3, 2)
      removeCanvasEvent()
      setTimeout(popAllBombs,1000, row,col)
    } 

    else {  // 빈 타일을 열음.
      openTileNotBomb(row,col)
      shakeCanvas(1,1)
    }
  }

  
  // right-mouse
  else if(bombs[row][col].flag < 3) { 
    if(bombs[row][col].flag==0) { 
      flagNum--
      bombs[row][col].flag = 1

      animationTasks.push({
        x       : col, 
        y       : row,
        curFrame: 0, 
        type    :'plant'
      })
    }

    else if(bombs[row][col].flag==2) {
      flagNum++
      layer4.clearRect(col*30, row*30, 30,30)
      bombs[row][col].flag = 0

      animationTasks.push({
        x        : col*30, 
        y        : row*30, 
        rad      : 0, 
        rot      : 0,
        yMax     : 20 + Math.random() * 20,
        direction: [-1,1][Math.round(Math.random() )],
        cur      : row*30, 
        size     : 30, 
        type     :'remove'
      })
    } 

    flag.innerHTML = String(flagNum)
  }


  // 열린 타일과 세운 플래그 수가 맞아 떨어지면 게임 종료.
  if(flagNum==0 && option[lv].rc-openNum == option[lv].b) {
    isGameOver = true
    removeCanvasEvent()
    getResult(row,col)
  }
}



// 난이도 선택을 누른 경우.
function onClickLevelSelect(e) {
    const lst = document.querySelector("#minesweeper .game .level-lst");

    if(lst.style.display=='flex')
      lst.style.display = 'none';
    else 
      lst.style.display = 'flex';
}


// 게임의 타이머를 갱신한다.
function updateTimer() {
  const int = parseInt(timer.innerHTML)
  timer.innerHTML = (int>=999) ? ('999') : (String(int+ 1).padStart(3,'0') )
}



// 게임 플레이를 누른 경우.
function onMouseDownGamemenu(e) {
  gameMenu.style.display = 'none'
  game.style.display = 'flex'

  initGame(levelSelect.childNodes[1].innerHTML)
  timerId = setInterval(updateTimer, 1000)
  window.requestAnimationFrame(paintAnimation)
}


// 게임을 초기화한다.
function initGame(level) {
  const lst = document.querySelector("#minesweeper .game .level-lst")   
  const divs = document.querySelectorAll(".level-lst div")
   
  if(isGameOver) {
    cvs5.addEventListener("mousemove", onMousemoveCvs)
    cvs5.addEventListener("mousedown", onMouseDownCvs,true)
    cvs5.addEventListener("mouseleave", onMouseLeaveCvs)
    clearTimeout(timeoutId)
    timerId = setInterval(updateTimer, 1000)
    isGameOver = false
  }

  lv = level
  openNum = 0
  flagNum = option[lv].b
  timer.innerHTML = '000'
  animationTasks = []

  lst.style.display = 'none';
  levelSelect.childNodes[1].innerHTML = level
  document.querySelector(".game .center .set-flag span")
  .innerHTML = String(option[level].b)

  cvs1.style.zIndex = 2
  cvs2.style.zIndex = 3
  cvs3.style.zIndex = 4
  cvs4.style.zIndex = 5

  layer0.clearRect(0,0,cvs1.width, cvs1.height)
  layer2.clearRect(0,0,cvs1.width, cvs1.height)
  layer3.clearRect(0,0,cvs1.width, cvs1.height)
  layer4.clearRect(0,0,cvs1.width, cvs1.height)
  layer5.clearRect(0,0,cvs1.width, cvs1.height)

  divs.forEach((div)=>{ 
      if(div.querySelector("span").innerHTML != level)
       div.querySelector("img").style.opacity = 0
      else
        div.querySelector("img").style.opacity = 1
  })

  generateBombs(option[level].r, 
                option[level].c,
                option[level].b)

  cvs1.width = 30 * option[level].c
  cvs1.height = 30 * option[level].r

  cvs0.width = cvs2.width = cvs3.width = cvs4.width = cvs5.width = cvs1.width
  cvs0.height = cvs2.height = cvs3.height = cvs4.height = cvs5.height = cvs1.height

  game.style.width = option[level].w
  game.style.height = option[level].h

  let color1 = 'rgb(146, 199, 93)',
      color2 = 'rgb(138, 188, 89)'
  
  for(let j=0; j<option[level].r; j++) {
    for(let i=0; i<option[level].c; i+=2) {
      layer1.fillStyle = color1
      layer1.fillRect(30*i,30*j, 30,30);
  
      layer1.fillStyle = color2
      layer1.fillRect(30*(i+1),30*j, 30,30);

      bombs[j][i].color = color1
      bombs[j][i+1].color = color2
     }
     const temp = color1;
     color1 = color2;
     color2 = temp;
  }
}



// 지뢰를 배열한다.
function generateBombs(r,c,nBombs) {  
  // bomb: false | true
  // flag: 0 | 1 | 2 | 3 | 4

  // false: no a bomb
  // true : there is a bomb
  // 0: none
  // 1: planting a flag
  // 2: planted a flag
  // 3: opened but have surrouned bombs
  // 4: opened and have no surround bombs
  bombs = [] 
  gen = []

  for(let i=0; i<r; ++i) {
    bombs.push(new Array(c) )
    gen.push(new Array(c) )

    for(let j=0; j<c; ++j) {
      bombs[i][j] = {bomb:false, flag:0, 
                     color:'',surroundBombs:0 }
      gen[i][j] = {y:i, x:j}
    }
  }

  while(nBombs){
    let   randB = 1 + Math.round(Math.random() * 3)
    const randY = Math.round(Math.random() * (gen.length-1) ),
          randX = Math.round(Math.random() * (gen[randY].length-1) )
    
    const surronds = [
      {x:0,y:-1},{x:1,y:-1},{x:1,y:0},{x:1,y:1},
      {x:0,y:1},{x:-1,y:1},{x:-1,y:0},{x:-1,y:-1}
    ]
    
    while(nBombs && surronds.length && randB) {
      const index = Math.round(Math.random() * (surronds.length-1) ),
            row   = randY+surronds[index].y,
            col   = randX+surronds[index].x

      if(!isOutOfBounds(row,col) && !bombs[row][col].bomb) {
        nBombs--
        randB--
        bombs[row][col].bomb = true
      }
      surronds.splice(index,1)
    }

    gen[randY].splice(randX,1)
    if(!gen[randY].length) {
       gen.splice(randY,1)
    }
  }
}


// 타일의 경계를 검사한다.
function isOutOfBounds(r,c) {
  return (r<0) || (r>=option[lv].r) || 
         (c<0) || (c>=option[lv].c)
}


// 타일을 터트리는 애니메이션을 등록한다.
function setPopAnimation(r,c, bombList, 
                        flagList, curIndex) {
  const colorIndex = Math.round(Math.random()*6),
        leafCont = [], 
        to       = 4 + Math.round(Math.random() * 5)

  for(let i=0; i<to; ++i) {
      leafCont.push({
        ySpeed   : 0.2 + Math.random() * 2,
        xSpeed   : 0.05 + Math.random() * 0.5,
        yMax     : 40 + Math.random() * 30, 
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

  // 잎 날리기
  animationTasks.push({
    type : 'leaf', 
    leaf : leafCont, 
    color: popColoring[colorIndex].bg
  })

  // 터트리기
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

  // 타일 열기
  animationTasks.push({
    x        : c*30, 
    y        : r*30, 
    curX     : c*30, 
    curY     : r*30, 
    rad      : 0, 
    rot      : 0, 
    color    : bombs[r][c].color,
    yMax     : 40 + Math.random() * 40,
    direction: [-1,1][Math.round(Math.random() )],
    size     : 15 + Math.random() * 15, 
    type     : 'open'
  })

  shakeCanvas(1,1)
  layer1.fillStyle = popColoring[colorIndex].bg
  layer1.fillRect(30*c, 30*r, 30,30)

  layer1.fillStyle = popColoring[colorIndex].arc
  layer1.beginPath()
  layer1.arc(30*c+15, 30*r+15, 10, 0, Math.PI*2)
  layer1.fill()
}



// 밟은 지뢰부터, 가까운 순으로 모든 지뢰를 터트린다.
function popAllBombs(r,c) {
  const bombList = [],
        flagList = [],
        start    = {x:c, y:r}

  isGameOver = true
  clearInterval(timerId)

  for(let i=0; i<option[lv].r; ++i) {
    for(let j=0; j<option[lv].c; ++j) {
      const tile = bombs[i][j]

      if(tile.flag==2 && !tile.bomb) {
        flagList.push({x: j, y: i})
      }

      else if(tile.bomb && tile.flag==0) {
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
                  bombList, flagList,0)
}


// 타일 주변의 플래그들의 무결성을 검사한다.
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
    const bomb = bombs[surround[i].y][surround[i].x]
    
    if(bomb.flag==2) { // 플래그를 세웠는데, 실제로는 폭탄이 아닌 경우.
      result.nFlags++

      if(!bomb.bomb) {
        result.isCorrect = false
      }
    }
    else if(bomb.flag<2) { // 아직 열지 않은 타일, 폭탄이 아님.
      if(!bomb.bomb) {
        result.empty.push({
          x:surround[i].x,
          y:surround[i].y
        })
      }
    }
  } 
  return result
}


// 주변에 지뢰가 아닌 타일들을 전부 연다.
function openTileNotBomb(r,c) {
  let   surroundBombs = 0,
        top, right, bottom, left,
        leftTop, rightTop, 
        rightBottom, leftBottom 

  if(isOutOfBounds(r,c) ) { // 배열 경계를 벗어남
    return 0
  }

  if(bombs[r][c].bomb) { // 지뢰가 있는 타일.
    return 1
  }

  if(bombs[r][c].flag>2) { // 열린 타일.
    return 0
  }

  if(bombs[r][c].flag==2) { // 플래그가 있는 타일.
    return null
  }

  animationTasks.push({
    x        : c*30, 
    y        : r*30, 
    rad      : 0, 
    rot      : 0, 
    color    : bombs[r][c].color,
    yMax     : 20 + Math.random() * 20,
    direction: [-1,1][Math.round(Math.random() )],
    cur      : r*30, 
    size     : 15 + Math.random() * 15, 
    type     : 'open'
  })

  layer0.fillStyle = (bombs[r][c].color=='rgb(146, 199, 93)')
                   ?  'rgb(211, 189, 156)' 
                   : 'rgb(201, 175, 137)'
  layer0.fillRect(30*c, 30*r, 30,30)
  layer1.clearRect(30*c, 30*r, 30,30)
  layer2.clearRect(30*c, 30*r, 30,30)

  bombs[r][c].flag = 3
  openNum++

  surroundBombs += top    = openTileNotBomb(r-1,c)   // ↑
  surroundBombs += right  = openTileNotBomb(r,c+1)   // →
  surroundBombs += bottom = openTileNotBomb(r+1,c)   // ↓
  surroundBombs += left   = openTileNotBomb(r,c-1)   // ←
  if(!isOutOfBounds(r-1,c-1) ) surroundBombs += leftTop     = bombs[r-1][c-1].bomb // ↖
  if(!isOutOfBounds(r-1,c+1) ) surroundBombs += rightTop    = bombs[r-1][c+1].bomb // ↗
  if(!isOutOfBounds(r+1,c+1) ) surroundBombs += rightBottom = bombs[r+1][c+1].bomb // ↘
  if(!isOutOfBounds(r+1,c-1) ) surroundBombs += leftBottom  = bombs[r+1][c-1].bomb // ↙
 
  if(top==null) top = 1
  if(right==null) right = 1
  if(bottom==null) bottom = 1
  if(left==null) left = 1

  if(surroundBombs || (top+right+bottom+left) ) {

    if(surroundBombs) {
      layer4.textAlign = 'center'
      layer4.font = 'bold 20px Franklin Gothic Medium' 
      layer4.fillStyle = numberColoring[surroundBombs]
      layer4.fillText(String(surroundBombs), 15+30*c, 22+30*r)
      layer4.fill()
      bombs[r][c].surroundBombs = surroundBombs
    }

    layer2.fillStyle = 'rgb(58, 98, 33)'
    if(top) layer2.fillRect(30*c, 30*r-2, 30,2)
    if(right) layer2.fillRect(30*c+30,30*r, 2,30)
    if(bottom) layer2.fillRect(30*c, 30*r+30, 30,2)
    if(left) layer2.fillRect(30*c-2, 30*r,2,30 )

    if(top) {
      if(left) {
        if(leftTop || (!isOutOfBounds(r-1,c-1) && bombs[r-1][c-1].flag<3) ) 
          layer2.fillRect(30*c-2, 30*r-2, 2,2)
      } 
      if(right || right==null) {
        if(rightTop || (!isOutOfBounds(r-1,c+1) && bombs[r-1][c+1].flag<3) ) 
        layer2.fillRect(30*c+30, 30*r-2, 2,2)
      } 
    }

    if(bottom) {
      if(left) {
        if(leftBottom || (!isOutOfBounds(r+1,c-1) && bombs[r+1][c-1].flag<3)  ) 
          layer2.fillRect(30*c-2, 30*r+30, 2,2)
      }
      if(right) {
        if(rightBottom || (!isOutOfBounds(r+1,c+1) && bombs[r+1][c+1].flag<3) ) 
          layer2.fillRect(30*c+30, 30*r+30, 2,2)
      } 
    }
  }

  else {
    bombs[r][c].flag = 4
  }
  return 0
}

// 애니메이션을 그린다.
function paintAnimation(t) {
  if(animationTasks.length) {
    layer5.clearRect(0,0,cvs5.width, cvs5.height)
    
    for(let i=0; i<animationTasks.length; ++i) {
      switch(animationTasks[i].type) {
        case'plant': plantFlag(i)
                     break
        case'remove': removeFlag(i)
                      break
        case'open': openTile(i)
                    break
        case'bloom': bloomTile(i)
                     break
        case'leaf':flyLeaf(i)
                   break
        case'pop': popTile(i)
                   break
        case'shine':shineTile(i)
                    break
        case'disapear':disapearNumber(i)
                       break
        case'wave':putWave(i)
                   break
      }
    }
  }
  window.requestAnimationFrame(paintAnimation)
}


// 깃발을 세우는 애니메이션 효과를 넣는다.
function plantFlag(taskId) {
  const task = animationTasks[taskId]

  if(task.curFrame==10 || isGameOver) {
    animationTasks.splice(taskId,1)
    bombs[task.y][task.x].flag = 2
    layer4.drawImage(flagImage, (task.x*30),(task.y*30),30,30)
    return
  }
  const sy = 81 * (task.curFrame++),
        dx = task.x * 30,
        dy = task.y * 30
  layer5.drawImage(flagAnimation, 0,sy,80,81,
                                  dx,dy,30,30)
}


// 깃발을 제거하는 애니메이션 효과를 넣는다.
function removeFlag(taskId) {
  const task = animationTasks[taskId]

  if(task.rad >= (oneRad * 270) ) {
    animationTasks.splice(taskId,1)
    return
  }

  const centerX = task.x + task.size * 0.5,
        centerY = task.cur + task.size * 0.5,
        flagSize = Math.round(task.size)

  layer5.translate(centerX, centerY)
  layer5.rotate(task.rot * task.direction)
  layer5.translate(-centerX, -centerY)

  layer5.drawImage(flagImage, task.x, task.cur,
                              flagSize, flagSize)
  layer5.resetTransform()

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


// 타일을 벗기는 애니메이션 효과를 넣는다.
function openTile(taskId) {
  const task = animationTasks[taskId]

  if(task.rad >= (oneRad * 200) ) {
    animationTasks.splice(taskId,1)
    return
  }

  const centerX = task.x + task.size * 0.5,
        centerY = task.cur + task.size * 0.5

  layer5.translate(centerX, centerY)
  layer5.rotate(task.rot * task.direction)
  layer5.translate(-centerX, -centerY)

  layer5.fillStyle = task.color
  layer5.fillRect(task.x, task.cur, task.size, task.size*0.6)
  layer5.resetTransform()
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

// 타일에 꽃을 피우는 애니메이션 효과를 넣는다.
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
      drawFlower(flower, layer2)
      flowers.splice(i--,1)
      continue
    }
    drawFlower(flower, layer5)
    flower.rot += 0.02
    flower.curSize += 0.1
  }
}

// 꽃 하나를 그린다.
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


// 네잎 클로버를 그린다.
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

  layer.fillStyle = popColoring[flower.colorIndex].bg
  layer.beginPath()
    layer.moveTo( (cx-s3), cy )
    layer.quadraticCurveTo( (cx-size), (cy-size),  cx,    (cy-s3) )
    layer.quadraticCurveTo( (cx+size), (cy-size), (cx+s3), cy )
    layer.quadraticCurveTo( (cx+size), (cy+size),  cx,    (cy+s3) )
    layer.quadraticCurveTo( (cx-size), (cy+size), (cx-s3), cy )
  layer.closePath()
  layer.fill()

  layer.fillStyle = popColoring[flower.colorIndex].arc
  layer.beginPath()
  layer.arc(cx, cy, size/2, 0, Math.PI * 2)
  layer.closePath()
  layer.fill()
}


// 둥근 꽃을 그린다.
function drawFlower2(flower, layer) {
  const size = flower.curSize, 
        cx   = flower.x,
        cy   = flower.y

  layer.resetTransform()
  layer.fillStyle = popColoring[flower.colorIndex].bg
  layer.beginPath()
  layer.arc(cx,cy, size, 0, Math.PI * 2)
  layer.closePath()
  layer.fill()

  layer.fillStyle = popColoring[flower.colorIndex].arc
  layer.beginPath()
  layer.arc(cx,cy, size/2, 0, Math.PI*2)
  layer.closePath()
  layer.fill()
}


// 뾰족한 꽃을 그린다.
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
  layer.fillStyle = popColoring[flower.colorIndex].bg
        
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
        
  layer.fillStyle = popColoring[flower.colorIndex].arc
  layer.beginPath()
  layer.arc(cx, cy, size/2, 0, Math.PI * 2)
  layer.closePath()
  layer.fill()
}



// 타일을 터투리는 애니메이션 효과를 넣는다.
function popTile(taskId) {
  const task = animationTasks[taskId]
 
  if(task.alpha <= 0.0) {
    animationTasks.splice(taskId,1)

    if(task.lst.length>task.cur) {
      const l = task.lst[task.cur]
      timeoutId = 
      setTimeout(setPopAnimation, 
                 Math.round(Math.random() * 250),
                 l.y, l.x, task.lst, task.lst2, task.cur)
    }
    else {
      const l2 = task.lst2
      shakeCanvas(0.5*l2.length,3)

      for(let i=0; i<l2.length; ++i) {
        animationTasks.push({
          x        : l2[i].x*30,
          y        : l2[i].y*30, 
          rad      : 0, 
          rot      : 0,
          yMax     : 40 + Math.random() * 20,
          direction: [-1,1][Math.round(Math.random() )],
          cur      : l2[i].y*30, 
          size     :30, 
          type     :'remove'
        })
        layer4.clearRect(30*l2[i].x, 30*l2[i].y, 30,30)
        layer1.drawImage(incorrectImage, 30*l2[i].x, 30*l2[i].y,30,30)
        layer4.fill()
      }
    }
    
    flagNum--
    flag.innerHTML = String(flagNum)
    return
  }
  layer4.clearRect(task.x, task.y, 30,30)
  layer4.fillStyle = 'white'
  layer4.globalAlpha = task.alpha
  layer4.fillRect(task.x, task.y,30,30)
  layer4.globalAlpha = 1.0
  task.alpha -= 0.05
}


// 잎을 날리는 애니메이션 효과를 넣는다.
function flyLeaf(taskId) {
  const task = animationTasks[taskId]
  layer5.fillStyle = task.color

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

    layer5.translate(centerX, centerY)
    layer5.rotate(leaf.rot * leaf.direction)
    layer5.translate(-centerX, -centerY)
    layer5.fillRect(leaf.curX, leaf.curY,
                    size, (size * 0.6) )
    layer5.resetTransform()

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

// 흔들림 효과를 넣는다.
function shakeCanvas(shakeAmount, nLoop) {
  if(shakeAmount > 1) {
    shakeAmount = 1
  }

  const shakeTransform = [
    `translate(${-shakeAmount}px,0px)`,
    `translate(${-shakeAmount}px,${shakeAmount}px)`,
    `translate(${shakeAmount}px,${shakeAmount}px)`,
    `translate(${shakeAmount}px,${-shakeAmount}px)`,
    ``,
  ]

  for(let i=0; i<nLoop; ++i) {
    setTimeout(setShakeEffect, i*250, shakeTransform, 0)
    setTimeout(setShakeEffect, 50 + i*250, shakeTransform, 1)
    setTimeout(setShakeEffect, 100 + i*250, shakeTransform, 2)
    setTimeout(setShakeEffect, 150 + i*250, shakeTransform, 3)
    setTimeout(setShakeEffect, 200 + i*250, shakeTransform, 4)
  }
}

// 흔들림 효과를 세팅한다.
function setShakeEffect(shakeTransform, direction) {
  layerCont.style.transform = shakeTransform[direction]
}


// 게임 결과를 얻는다.
function getResult(r,c) {
  const bombList = [],
        numList  = []
  clearInterval(timerId)
  for(let i=0; i<option[lv].r; ++i) {
    for(let j=0; j<option[lv].c; ++j) {
      if(bombs[i][j].bomb) {
        bombList.push({y:i,x:j})
      }

      else if(bombs[i][j].flag==3) {
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


// 지뢰타일에 반짝이는 애니메이션을 넣는다.
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
        layer4.clearRect(b.x*30, b.y*30, 30,30)
      }

      animationTasks.push({
        type :'disapear',
        lst  : task.lst2,
        alpha:0.8
      })

      setTimeout(setBloomAnimation, 3500, task.lst)

    }, 1300)
    animationTasks.splice(taskId,1)
    return
  }
  
  layer3.globalAlpha = task.alpha
  task.alpha -= 0.02

  for(let i=0; i<task.lst.length; ++i) {
    const b = task.lst[i]
    layer3.clearRect(b.x*30, b.y*30, 30,30)
    layer3.fillStyle = 'white'
    layer3.fillRect(b.x*30, b.y*30, 30,30)
  }
  layer3.globalAlpha = 1
}


// 숫자를 없앤다.
function disapearNumber(taskId) {
  const task = animationTasks[taskId]

  if(task.alpha<=0) {
    animationTasks.splice(taskId)
    cvs1.style.zIndex = 3
    cvs2.style.zIndex = 4
    cvs3.style.zIndex = 5
    cvs4.style.zIndex = 2

    animationTasks.push({
      type :'wave',
      range:0.8,
      alpha:0
    })
    return
  }

  layer4.globalAlpha = task.alpha

  for(let i=0; i<task.lst.length; ++i) {
    const b = task.lst[i]
    const surroundBombs = bombs[b.y][b.x].surroundBombs

    layer4.clearRect(b.x*30, b.y*30, 30,30)
    layer4.textAlign = 'center'
    layer4.font = 'bold 20px Franklin Gothic Medium' 
    layer4.fillStyle = numberColoring[surroundBombs]
    layer4.fillText(String(surroundBombs), 15+30*b.x, 22+30*b.y)
    layer4.fill()
  }
  task.alpha -= 0.02
  layer4.globalAlpha = 1
}


// 뒷배경에 파도를 넣는다.
function putWave(taskId) {
  const task = animationTasks[taskId]

  layer4.globalCompositeOperation = 'ligthen'
  layer4.clearRect(0,0, cvs4.width ,cvs4.height)
  const gradient = layer4.createLinearGradient(cvs4.width*0.5, 0,
                                               cvs4.width*0.5, cvs4.height)
  gradient.addColorStop(task.range,`rgba(255, 255, 255,0.2)`)

  if(task.alpha==0.5 && task.range==1.0) {
    layer4.fillStyle = `rgba(73, 182, 255,0.5)`
    layer4.fillRect(0,0, cvs4.width ,cvs4.height)
    layer4.fillRect(0,0, cvs4.width ,cvs4.height)
    animationTasks.splice(taskId,1)
    return
  }

  layer4.fillStyle = gradient
  layer4.fillRect(0,0, cvs4.width ,cvs4.height)

  layer4.fillStyle = `rgba(73, 182, 255,${task.alpha})`
  layer4.fillRect(0,0, cvs4.width ,cvs4.height)
  layer4.fillRect(0,0, cvs4.width ,cvs4.height)
  task.alpha += 0.005
  task.range += 0.002

  if(task.range >= 1.0) {
    task.range = 1.0
  }

  if(task.alpha >= 0.5) {
    task.alpha = 0.5
  }
}



// 꽃을 피우는 애니메이션을 등록한다.
function setBloomAnimation(bombList) {
  for(let i=0; i<bombList.length; ++i) {
    const r = 30 * bombList[i].y,
          c = 30 * bombList[i].x  

    const flowerCont = [],  // 꽃 컨테이너
          nFlowers   = 1 + Math.round(Math.random() * 3),  // 생성할 꽃 갯수
          quadrant   = [ 
            { x:c, y:r }, { x:c+15, y:r },  // 1~4 사분면
            { x:c, y:r+15 },{ x:c+15, y:r+15 } 
          ]  

    for(let i=0; i<nFlowers; ++i) {
      const quadIndex  = Math.round(Math.random() * (quadrant.length-1) ), // 사분면 1택.
            quad       = quadrant[quadIndex],
            flowerSize = 4 + Math.round(Math.random() * 3),                // 꽃의 크기(4~7)
            free       = 15 - (flowerSize*2),                              // 꽃의 중심을 둘 수 있는 공간
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












