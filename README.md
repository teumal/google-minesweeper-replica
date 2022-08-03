# google-minesweeper-replica
google minesweeper replica with js canvas 2d api

<img src='https://github.com/teumal/google-minesweeper-replica/blob/main/gameover1.PNG?raw=true' height='500' width='500'>
<img src='https://github.com/teumal/google-minesweeper-replica/blob/main/gameover2.PNG?raw=true' height='500' width='500'>

구글에서 검색하면 할 수 있는 웹 지뢰찾기의 레플리카입니다. 기본적으로는 원본과 똑같지만, 추가된 것이 하나 있습니다:
<img src='https://github.com/teumal/google-minesweeper-replica/blob/main/case1.PNG?raw=true' height='500' width='500'>
위 그림처럼, 열린 타일에 적혀있는 숫자의 갯수만큼 주변에 플래그를 세웠다면 그 타일을 누르는 것으로 주변의 타일들을 한 번에 열 수 있습니다.
플래그가 제대로 세워졌다면, 빈 타일들이 한꺼번에 열릴 것이고 아니였다면 게임 오버가 됩니다.

현재 버전에서는 '효과음' 이나 '커스텀' 모드를 구현하지 않았으며, bomb generator에 하자가 있어 질 좋은 지뢰를 구현하지 못한다는 문제가 있습니다.

todo list
- [] 효과음 넣기.
- [] 커스텀 모드 넣기
- [] bomb generator 개선

