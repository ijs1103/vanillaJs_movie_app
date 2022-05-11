import axios from 'axios';
/* 숫자 애니메이션 */
const countEl = document.querySelector(".count");
let speed = 100;
const animate = () => { 
	const data = +countEl.getAttribute('data'); 
	const value = +countEl.innerText; 
	const time = data / speed; 
	if (value < data) { 
		countEl.innerText = Math.ceil(value + time);  
		requestAnimationFrame(animate); 
	}
	if (value === data) countEl.innerText = data.toLocaleString();
};
animate();
/* option 출시년도 렌더링 관련 */
const optionConEl = document.querySelectorAll('.option-container')[1]; // 출시년도 option-container
function makeYears() {
	const arr = [];
	const thisYear = new Date().getFullYear();
	for (let i = thisYear; i >= 1985; i -= 1) {
		arr.push(i)
	}
	return arr;
}
const yearToOption = year => `<div class="option-container__option">
<input type="radio" class="option__radio" id="${year}" name="year">
<label class="option__label" for="${year}" data-value="${year}">${year}</label>
</div>`;
const years = makeYears();
const newOptions = years.reduce((years,year)=>years+yearToOption(year), "");
optionConEl.innerHTML = newOptions;

/* form 관련 */
const formEl = document.querySelector(".form");
const searchSecEl = document.querySelector("#search");

let selectedBox;
formEl.addEventListener("click", (event) => {
	event.stopPropagation();
	openOptions(event);
	handleLabels(event);
});
searchSecEl.addEventListener("click", () => {
	selectedBox?.classList.remove("selectbox--active");
});

function openOptions(e) {
	if (e.target.className !== "selectbox__displayWord") return;
	if (selectedBox) {
		if (selectedBox.classList.contains('selectbox--active') && selectedBox === e.target.parentNode) {
			selectedBox?.classList.remove('selectbox--active');
			return;
		}
		selectedBox.classList.remove('selectbox--active');
	}
	selectedBox = e.target.parentNode;
	selectedBox.classList.add('selectbox--active');
}

function handleLabels(e) {
	if (e.target.className !== "option-container__option") return;
	const option = e.target;
	const label = option.querySelector("label");
	const selectBox = option.parentNode.parentNode;
	const selectBoxDisplay = selectBox.querySelector(".selectbox__displayWord");
	selectBoxDisplay.innerHTML = label.innerHTML;
	selectBox.setAttribute("data-option", label.getAttribute("data-value"));
	selectBox.classList.remove("selectbox--active", "selectbox--unselect");
}

/* api fetch 관련 */
const selectBoxEls = document.querySelectorAll(".selectbox");
const gridConEl = document.querySelector('.grid-container');
const searchInputEl = document.querySelector('.search-input');
const NO_POSTER_IMAGE = "./images/noPoster.png";
const messageEl = document.querySelector('.message');
const loaderEl = document.querySelector('.loader');
let title, type, year, pageLength;
let currentPage = 1;
formEl.addEventListener('submit', (e) => {
	e.preventDefault();
	title = searchInputEl.value;
	type = selectBoxEls[0].getAttribute("data-option") || "";
	currentPage = 1; 
	year = selectBoxEls[1].getAttribute("data-option") || "";

	gridConEl.innerHTML = ""; // 그리드 영역 초기화
	loaderEl.classList.add('active'); // 로딩 시작
	fetchData(title, type, year, currentPage).then(res => parsing(res.data));
	searchInputEl.value = ""; // 검색창 초기화 
});
async function fetchData(title, type, year, currentPage) {
	const URL = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&s=${title}&type=${type}&y=${year}&page=${currentPage}`;
	return await axios.get(URL);
}
function parsing(data) {
	/* 에러처리 */
	if (data.Error) {
		messageEl.textContent = data.Error; 
		loaderEl.classList.remove('active'); // 로딩 종료
		return;
	}
	/* 렌더링 관련 */
	const newItems = data.Search.reduce((movies,movie) => movies+movieToGridItem(movie), "");
	gridConEl.innerHTML += newItems;
	loaderEl.classList.remove('active'); // 로딩 종료
	pageLength = Math.ceil(+data.totalResults / 10);
	messageEl.innerHTML = `"${title}" 검색 결과가 <span>${data.totalResults.toLocaleString()}</span>개 있습니다.`
	viewModal();
}

/* IntersectionObserver API */
const io = new IntersectionObserver(entries => {
  entries.forEach(async entry => {
    // 관찰 대상이 viewport 안에 들어온 경우 
    if (entry.intersectionRatio > 0 && pageLength > 1 && pageLength > currentPage) {
      loaderEl.classList.add('active');
			await new Promise(resolve => setTimeout(resolve, 1500));
			currentPage++;
			fetchData(title, type, year, currentPage).then(res => parsing(res.data));
    }
  })
})

const targetEl = document.querySelector('.target-area');
io.observe(targetEl);

const movieToGridItem = movie =>
	`<div class="grid-item">
		<div class="contents-poster">
			<img src=${movie.Poster!=='N/A' ? movie.Poster : NO_POSTER_IMAGE} alt="poster">
		</div>
		<div class="hover-contents">
			<div class="hover-inner">
				<div class="contents-title">${movie.Title}</div>
				<div class="contents-more" data-value=${movie.imdbID}>
					<span class="material-icons">expand_more</span>
				</div>
			</div>
		</div>
	</div>`
;



/* 영화 detail page 모달창 관련 */
function viewModal() {
	const gridEl = document.querySelector('.grid-container');
	const hiddenModalEl = document.querySelector('.hidden-modal');
	const modalCloseEl = document.querySelector('.modal-close');
	const modalCurtainEl = document.querySelector('.modal-curtain');
	gridEl.addEventListener('click', (e) => {
		if(e.target.parentNode.className!=="contents-more") return;
		const movieId = e.target.closest(".contents-more").getAttribute('data-value');
		renderModal(movieId);
		/* 모달창을 제외한 배경 요소 스크롤 방지 */
		document.body.style.overflow = "hidden";
		hiddenModalEl.classList.add('active');
	});
	modalCloseEl.addEventListener('click', (e) => {
		/* 스크롤 방지 해제 */
		document.body.style.overflow = "scroll";
		hiddenModalEl.classList.remove('active');
	});
	modalCurtainEl.addEventListener('click', (e) => {
		/* 스크롤 방지 해제 */
		document.body.style.overflow = "scroll";
		hiddenModalEl.classList.remove('active');
	});
}

async function fetchDataById(id) {
	const URL = `https://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${id}`;
	return await axios.get(URL);
}
function renderModal(id) {
	const imageEl = document.querySelector('.modal-image');
	const plotEl = document.querySelector('.modal-plot');
	const titleEl = document.querySelector('.modal-title');
	const directorsEl = document.querySelector('.modal-directors');
	const actorsEl = document.querySelector('.modal-actors');
	const genresEl = document.querySelector('.modal-genres');
	fetchDataById(id).then(res => {
		const { Plot, Title, Director, Actors, Genre, imdbRating} = res.data;
		imageEl.src = res.data.Poster!=='N/A' ? res.data.Poster.replace('SX300', 'SX700') : NO_POSTER_IMAGE;
		plotEl.textContent = Plot;
		titleEl.textContent = Title;
		directorsEl.textContent = Director;
		actorsEl.textContent = Actors;
		genresEl.textContent = Genre;
		drawCircle(imdbRating);
	});
}
viewModal();

/* svg */
const barEl = document.querySelector('.circle-bar');
const vauleEl = document.querySelector('.circle-value');
const RADIUS = 27;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
function drawCircle(score) {
  let progress = +score / 10;
  let dashoffset = CIRCUMFERENCE * (1 - progress);
  vauleEl.innerHTML=score;
  barEl.style.strokeDashoffset = dashoffset;
}
barEl.style.strokeDasharray = CIRCUMFERENCE;








