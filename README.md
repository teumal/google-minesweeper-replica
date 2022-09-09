# google-minesweeper-replica (2nd edition)
google minesweeper replica with js canvas 2d api

이전에 문제가 많았던 초기 버전을 처음부터 뜯어 고쳐서, 소리기능을 제외한 나머지 기능들을 모두 추가한 버전입니다. 일부 부분은 코드 리팩토링을 통해, 알고리즘은 기존과 비슷하게 유지하되 더 간결하고 단순하게 바꾸었습니다. 추가된 기능을 정리하면 다음과 같습니다:

#### Updated features:
- [x] 모바일 환경에서 플레이 가능 (자세한 것은 후술)
- [x] bomb generator 개선 (가장 심각했던 오류로, bomb generator 가 아닌 핵심 알고리즘에 치명적인 문제가 있음을 발견 후 해결)
- [x] putWave 함수 개선. 전보다 자연스럽게 느껴짐
- [x] flag mode 추가. 모바일 환경에서는 이 기능을 통해 더 빠르고 쾌적하게 게임을 즐길 수 있음.
- [x] level select 개선. 모바일 환경에서 더 이상 형태가 망가지지 않음.
- [x] resize window. 창의 크기가 변해도 너무 작지 않는 한, 게임은 현재 창에 맞춰서 크기를 재조정하도록 변경.

#### Todo lists:
- [ ] 커스텀 모드 추가. (지금은 level 선택만 가능).
- [ ] 소리 기능 추가.
- [ ] 더 선명한 랜더링. (게임의 top 부분은 선명하나, 타일들이 흐리게 랜더링됨).

## In mobile devices
<div>
  <img src='https://github.com/teumal/google-minesweeper-replica/blob/2022-09-09/Screenshot_20220909-202650_QuickEdit.jpg?raw=true' width=400 height=600>
  <img src='https://github.com/teumal/google-minesweeper-replica/blob/2022-09-09/Screenshot_20220909-210705_QuickEdit.jpg?raw=true' width=400 height=600>
</div>
모바일 

## Implementation
### animations
