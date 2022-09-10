# google-minesweeper-replica
google minesweeper replica with js canvas 2d api <br> <br>
<img src='https://github.com/teumal/google-minesweeper-replica/blob/main/gameover1.PNG?raw=true' width=500 height=500>
## overview
구글에 "지뢰찾기"를 검색하면 나오는 웹게임의 레플리카입니다. 게임의 디자인과 이미지의 출처는 [Google Minesweeper](https://g.co/kgs/vHWCDL) 입니다. 만들게 된 계기는 3가지가 있습니다:

1. **원본 게임의 아트 스타일을 한번 구현해보고 싶었습니다**. 단순한 지뢰찾기임에도 불구하고, 화려한 연출을 보여주죠. 

2. **게임 플레이가 불편하다는 점입니다**. 다른 지뢰찾기 구현에서는 숫자 타일을 눌러서 한번에 여러개의 타일을 열 수 있기 해놓아서 아주 스피디하게 게임을 진행할 수 있었지만, 여기는 하나하나 직접 열어줘야 되기에 플레이가 아주 지루해진다는 단점이 있었습니다. 

3. **모바일 환경에서 조작감이 번거롭고 불편합니다**. 모바일 환경에서 플레이 가능한 것은 좋았습니다. 다만, 타일을 누를 때마다 "플래그", "타일 열기" 중 하나를 선택하라고 나오는 것이 몰입을 방해했습니다. 대신 터치를 짧게하거나 길게 하는 것으로 이를 구분하였으면 더 좋았을 것이라는 생각이 들었습니다.

#### New features:
- [x] 모바일 환경에서의 조작감 향상(아래에 후술).
- [x] 숫자 타일을 클릭해 타일을 여는 기능을 추가.
- [x] flag mode 추가. 모바일 환경에서는 이 기능을 통해 더 빠르고 쾌적하게 게임을 즐길 수 있음.
- [x] resize window. 창의 크기가 변해도 너무 작지 않는 한, 게임은 현재 창에 맞춰서 크기를 재조정하도록 변경.

#### Todo lists:
- [ ] 커스텀 모드 추가. (지금은 level 선택만 가능).
- [ ] 소리 기능 추가.
- [ ] 더 선명한 랜더링. (게임의 top 부분은 선명하나, 타일들이 흐리게 랜더링됨).
- [ ] 더 자연스러운 애니메이션 (일단은 구현하기는 했지만, 어색한 부분이 있습니다).

## Descriptions
여기서는 원본과 달라진 점과, 새로 추가된 기능들을 기술합니다:<br>
<img src='https://github.com/teumal/google-minesweeper-replica/blob/main/case1.PNG?raw=true'><br>
1. 원본 google minesweeper 와는 달리, 숫자가 적힌 타일을 눌렀을 때  설치한 플래그의 갯수와 누른 타일 주변에 실제로 존재하는 지뢰의 수가 동일하다면, 타일을 열 수 있습니다. 하지만, 잘못됬다면 게임오버로 간주됩니다. 게임을 스피디하게 진행할 수 있도록 도와줍니다.

<div>
  <img src='https://github.com/teumal/google-minesweeper-replica/blob/main/Screenshot_20220909-202650_QuickEdit.jpg?raw=true' width=400 height=600>
  <img src='https://github.com/teumal/google-minesweeper-replica/blob/main/Screenshot_20220909-210705_QuickEdit.jpg?raw=true' width=400 height=600>
</div>

2. 모바일 환경에서는 게임은 항상 전체화면의 비율을 가지게 됩니다('100%'). 타일을 짧게 누르는 것으로 타일을 열 수 있으며, 길게 눌렀다면 플래그를 세울 수 있습니다. 모바일 환경에서는 이 과정조차도 매우 번거로울 수 있기에, flag mode 기능을 새로 도입하였습니다. <br> <img src='https://github.com/teumal/google-minesweeper-replica/blob/main/flagmode.PNG?raw=true'> <br> 우측 상단에는 이와 같은 버튼이 하나 있으며, flag mode 와 mine mode 를 번갈아가면서 사용하는게 가능합니다. 

## Implementation.
게임에서 중요한 기능들을 어떻게 구현했는지에 대해서 기술합니다:
### animations

애니메이션은 총 7개의 캔버스로 이루어져 있으며, 모든 레이어들은 cvs[i].getContext('2d') 의 별칭입니다. 모든 레이어들은 layer 를 indexing 하는 것으로 접근할 수 있으며 크기는 game 의 크기에 100% 비율을 따릅니다. 기본적으로 모든 애니메이션들을 그리기 위해서는 animationTasks 에다가 그릴 애니메이션을 등록해야 합니다. 
``` javascript
 window.requestAnimationFrame(paintAnimation)  // 0. 최초에 paintAnimation 함수를 콜백으로 등록하고
 const animationTasks = []                     //    처리할 애니메이션을 담을 배열을 선언.
 
 animationTasks.push({   // 1. 어떤 함수가 animation task 를 등록함.
  x       : xpos,        //    task 에는 type 과, 애니메이션에 필요한 property 들이 있어야함.
  y       : ypos,
  curFrame: 0, 
  type    :'plant'
})

function paintAnimaion(t) {    // 2. 콜백 호출된 paintAnimation 함수가 태스크에 명시된 type 의 애니메이션을 그림.
     switch(animationTasks[i].type) {
      case'plant': /* do something */
           ...
}

animationTasks.splice(taskId,1)  // 3. 애니메이션이 끝났다면, 목록에서 삭제함. 다시 1 로 돌아감.

```
paintAnimation 함수는 repaint 할 타이밍이 되면, layer6 의 내용을 모두 지우고  animationTasks 에 등록된 태스크부터 layer6 에다가 차례대로 그려 나갑니다. 물론, animation 의 type 에 따라, 그릴 레이어가 다를 수 있습니다. 애니메이션이 종료되면, animationTasks 에서 해당 taskId를 가진 태스크를 삭제합니다. 이 과정이 callback 을 통해 비동기로 사용하기 때문에, animationTasks 가 thread-safe 하지 않을 것 같은게 문제지만, javascript 는 태생적으로 싱글 스레드이고  비동기라는 것이, 호출 타이밍만 비동기라는 의미이고  모든 호출된 함수들은 atomic 하게 실행된다고 생각하였습니다. 즉, animationTasks에서 태스크를 추가하는 과정은 항상 atomic 하다고 작성한 코드입니다.

### detect a long press
```javascript
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
```
isMobile = true 이면, 타일 클릭을 처리하는 onClickTile 함수가 cvs 에 등록되지 않고  대신 onPointerdownTile 함수가 등록되게 됩니다, 이는 enableCanvasClick 함수에서 확인할 수 있습니다. onPointerdownTile 함수는 모바일 환경의 터치를 감지하기 위해서 쓰이며, touchcancel 과 touchmove 이벤트를 추가로 등록하여  터치를 취소하고 short press 와 long press 를 구분합니다. foo, goo 함수의 경우, 각각의 onpointerdown 이벤트를 구분하기 위해서 쓰입니다. 간단히 요약하면 아래와 같습니다:

- onpointerdown 이벤트가 발생하고, 300 ms 동안 타일을 누른채 그대로 있으면  LONG_PRESS 를 감지합니다.

- onpointerdown 이벤트가 발생하고, 300 ms 이내에 타일에서 손을 떼게 되면(touchend)  SHORT_PRESS 를 감지합니다. 이때, 기다리지 않고 바로 onClickTile 을 실행합니다.

- onpointerdown 이벤트가 밸상해고, 300 ms 이내에 타일에서 다른 곳으로 이동하면(touchmove) 터치가 끊긴 것으로 간주합니다. 이때, onClickTile 은 실행되지 않습니다.

모바일 환경에서는 확대를 할 일이 많은데, touchmove 덕분에 이를 감지하고 확대 시에 타일이 열리는 것을 방지할 수 있습니다.








