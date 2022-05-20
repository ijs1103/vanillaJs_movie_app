## ◉ 필수 요구사항

- [x] 검색어를 입력해 영화를 검색할 수 있어야 합니다.
- [x] 검색된 결과(영화 목록)을 출력해야 합니다.
- [x] 프론트엔드 프레임워크 없이 바닐라 자바스크립트만으로 개발해야 합니다.
- [x] 실제 서비스로 배포하고 접근 가능한 링크를 추가해야 합니다.

## ◉ 선택 요구사항

- [x] Webpack 프로젝트로 구성해보세요.
- [x] 클라이언트에서 API Key가 노출되지 않도록 만들어보세요.
- [x] 무한 스크롤을 위한 'Intersection Observer'를 활용해보세요.
- [x] 최초 API 요청(Request)에 대한 로딩 애니메이션을 추가해보세요.
- [x] SCSS, Bootstrap 등을 구성해 프로젝트를 최대한 예쁘게(?) 만들어보세요.
- [x] 영화 포스터 주소에 포함된 `SX300`를 `SX700`과 같이 더 큰 숫자로 수정해 요청하세요.
- [ ] 실시간으로 이미지의 크기를 다르게 요청하는 것이 어떤 원리로 가능한지 조사해보세요.
- [x] 요청 주소에 HTTP가 아닌 HTTPS 프로토콜을 사용해야 하는 이유를 조사해보세요.

## ◉ 선택 요구사항에 대하여 .. 

### ✅ 클라이언트에서 API Key가 노출되지 않도록 만들어보세요.

vue 강의에서 배운대로 `.env` 파일에 API KEY를 저장하고 `.gitignore`에 `.env`를 추가 하였습니다. 추가적으로 netlify serverless functions도 적용할 예정입니다.

### ✅ 무한 스크롤을 위한 'Intersection Observer'를 활용해보세요

`doradora523`님의 지난 과제 코드 중 `Intersection Observer Api`를 이미 구현 하신 부분이 있길래 이를 벤치마킹 하였습니다.`requestAnimationFrame`도 어설프지만 따라 해봤습니다. 많이 배웠습니다. 

### ✅ 최초 API 요청(Request)에 대한 로딩 애니메이션을 추가해보세요.

최초 요청과 무한스크롤시 로딩 애니메이션을 적용하였습니다. 

### ✅ 영화 포스터 주소에 포함된 `SX300`를 `SX700`과 같이 더 큰 숫자로 수정해 요청하세요.

검색한 영화 포스터를 클릭하면 더 큰 이미지를 가지는 모달창이 열리는데, 이 때 `SX300` 사이즈를 `SX700` 사이즈로 변경하였습니다.

### ✅ 요청 주소에 HTTP가 아닌 HTTPS 프로토콜을 사용해야 하는 이유를 조사해보세요.

HTTPS 프로토콜은 HTTP에 SSL과 같은 암호화/복호화 과정이 추가되어 데이터 교류에 있어서 완벽하진 않지만 좀 더 신뢰성이 보장된다고 합니다.

## ◉ 특징
### ✅ Intersection Observer Api 무한스크롤 적용

`observer`가 관찰하는 영역에 루트 요소의 교차가 일어나면 `setTimeout`을 의도적으로 발생시키고 `spinner`를 화면에 보여주고 `fetchMore`가 끝나면 `spinner`를 화면에서 사라지는 방식으로 구현 했습니다.  

### ✅ 디테일 페이지 모달창

처음 api를 fetch하면 각 영화의 id 값인 imdbId를 받아오는데 이를 `dataset`에 저장한 뒤 더보기 버튼을 클릭하면 id 값으로 다시 fetch한 데이터를 디테일 페이지에 뿌려주는 방식으로 구현 했습니다.
### ✅ submit 이벤트 예외 처리 

빈칸, 한글, api가 error를 발생하는 단어 `ex) sfsfsdsfds, sa`를 예외 처리 해주었습니다.

### ✅ select box

select box에서 api 파라미터인 `type`과 `year`를 선택하여 검색 할 수 있습니다. 

### ✅ 인트로 애니메이션

`video` 요소가 재생 되고 끝난 시점에 애니메이션을 시작하도록 구현 하였습니다.


## ◉ 새로 알게 된 점

### ✅ insertAdjacentHTML

`innerHtml`은 값이 할당이 될 때마다 dom 트리를 초기화 합니다. `innerHtml += newElement`와 같은 코드는 사실 dom 트리를 여러번 초기화 하여 비용이 많이 드는 코드였던 것입니다.

반면에, `insertAdjacentHTML`은 추가하고자 하는 노드를 기존의 dom 트리에 추가만 할 뿐 dom 트리를 초기화 하지 않습니다.

`createDocumentFragment()`로 돔프래그먼트를 생성해서 `appendChild()`로 기존 돔에 추가 하는 과정을 하나의 메소드로 축약한 것과 같습니다. 

하지만, 기존의 노드들을 수정, 삭제 해야만 하는 상황에서는 `innerHtml`을 사용해야 하고 새로운 노드를 추가만 하는 상황에서는 `insertAdjacentHTML`이 좋습니다.

더 자세한 내용은 아래 글을 참고하시면 좋습니다.
[참고 링크](https://velog.io/@1106laura/insertAdjacentHTML)

### ✅ data.Poster가 정상적인 url 값임에도 이미지가 깨지는 경우

`img` 요소의 `onerror`속성으로 이미지가 깨질 때 에러 핸들링을 할 수 있습니다.

### ✅ gitignore 적용하기

gitignore를 초기에 생성 안하고 나중에 생성 했을 때, 적용 하려면 아래와 같이 작성합니다. 

``` 
// 현재 레포의 캐시를 모두 삭제
git rm -r --cached . 
add commit push 하기 
```

### ✅ netlify,heoroku 등의 CI/CD에 환경 변수 등록시 webpack 설정

`webpack.config.js`에서 아래 코드를 작성 해줘야 CI/CD에서 환경변수를 인식합니다. `dotenv-webpack` 플러그인도 설치 해줘야 합니다.
```
const Dotenv = require('dotenv-webpack')

plugins: [
	new Dotenv({systemvars: true})
]
```

### ✅ video 요소

video 요소는 여러 이벤트가 있는데 이 중 비디오가 끝난 시점, 정지한 시점에 발생하는 `ended`와 `pause`이벤트를 활용하였고 `document.querySelector('video').pause()`로 비디오를 정지 할 수 있습니다. 

## ◉ 링크

https://gregarious-manatee-16eb78.netlify.app/