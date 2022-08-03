# google-minesweeper-replica
google minesweeper replica with js canvas 2d api

<img src='https://github.com/teumal/google-minesweeper-replica/blob/main/gameover1.PNG?raw=true' height='500' width='500'>
<img src='https://github.com/teumal/google-minesweeper-replica/blob/main/gameover2.PNG?raw=true' height='500' width='500'>

구글에서 검색하면 할 수 있는 웹 지뢰찾기의 레플리카입니다. 기본적으로는 원본과 똑같지만, 추가된 것이 하나 있습니다:<br>
<img src='https://github.com/teumal/google-minesweeper-replica/blob/main/case1.PNG?raw=true' height='100' width='100'><br>
위 그림처럼, 열린 타일에 적혀있는 숫자의 갯수만큼 주변에 플래그를 세웠다면 숫자 타일을 누르는 것으로 주변의 타일들을 한 번에 열 수 있습니다.
플래그가 제대로 세워졌다면, 빈 타일들이 한꺼번에 열릴 것이고 아니였다면 게임 오버가 됩니다.

원본과 달리, 승리나 패배시 나오는 창이 없으며 새로운 게임을 시작하려면 원하는 난이도를 누르면 됩니다. 모든 지뢰를 찾았을 경우, 세웠던 깃발이 빠지며 그곳에서 꽃이 피어납니다(두번째 이미지) 패배 시, 모든 지뢰가 터지는 애니메이션이 나오게 됩니다(첫번째 이미지)

애니메이션 효과의 경우, paintAnimation 함수를 requestAnimationFrame 으로 전달하는 것으로 콜백호출되고 있습니다. 
paintAnimation 함수는 animationTasks 에 태스크가 있을 때에만 layer5 를 초기화시킵니다. 다른 layer0 ~ layer4 의 경우, 애니메이션에 따라 초기화될 수도 있고 아닐 수도 있지만,
기본적으로 실시간으로 계속 그리고 있지는 않습니다.

각 애니메이션 효과들은 animationTasks 배열에 push 하는 것으로 등록을 합니다. 각 애니메이션 태스크들은 type 이라는 property 를 가지고 있으며
paintAnimation은 각 태스크에 대해서 등록된 순서대로, type 에 맞는 함수를 호출하고 taskId 를 건네줍니다. 각 애니메이션이 끝나게되면 animationTasks 에서 taskId를 가진 태스크를 제거합니다.

animationTasks에 태스크를 넣고, 제거하는 과정이 마치 thread-safe 하지 않아 보인다는 것이 구현하는 데 있어서 걸림돌이었습니다. 다만, 자바스크립트의 경우 태생적으로 싱글 스레드이고, requestAnimationFrame 의 경우 다음 repaint 준비가 됬을 때 호출되는 콜백함수이기에..  호출 타이밍만 비동기라는 것이라 생각되어  각 함수의 실행 과정은 atomic 하다는 가정하에 작성하였습니다. 버그가 있다면 제보부탁드립니다.


todo list
- [ ] 효과음 넣기.
- [ ] 커스텀 모드 넣기
- [ ] bomb generator 개선
- [ ] 모바일 환경에서 작동가능하게 하기.
