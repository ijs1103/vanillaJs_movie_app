import numberAnimation from './numberAnimation';
import renderOption from './renderOption';
import drawCircle from './drawCircle';
import {
	fetchData,
	fetchDataById
} from './api';

numberAnimation();
renderOption();

/* selectbox 관련 */
const searchSecEl = document.querySelector("#search");
const formEl = searchSecEl.querySelector(".form");
let selectedBox;

formEl.addEventListener("click", (event) => {
	event.stopPropagation();
	openOptions(event);
	handleLabels(event);
});
document.body.addEventListener("click", () => {
	if (!selectedBox) return;
	// 열린 option 창이 2개 이상이면 한꺼번에 닫아 주기 
	if (formEl.querySelectorAll('.selectbox--active').length > 1) {
		formEl.querySelectorAll('.selectbox').forEach(elem =>
			elem.classList.remove("selectbox--active")
		);
	}
	selectedBox.classList.remove("selectbox--active");
});

function openOptions(e) {
	if (e.target.className !== "selectbox__displayWord") return;
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

/* fetch 관련 */
const selectBoxEls = document.querySelectorAll(".selectbox");
const searchInputEl = formEl.querySelector('.search-input');
const resultsSecEl = document.querySelector('#results');
let gridConEl = resultsSecEl.querySelector('.grid-container');
const messageEl = resultsSecEl.querySelector('.message');
const loaderEl = resultsSecEl.querySelector('.loader');
const NO_POSTER_IMAGE = "./images/noPoster.png";
let title, type, year, pageLength;
let currentPage = 1;
formEl.addEventListener('submit', (e) => {
	e.preventDefault();
	loadingStart();
	initApiParams();
	renderMovies();
	loadingEnd();
});
const loadingStart = () => loaderEl.classList.add('active');
const loadingEnd = () => loaderEl.classList.remove('active');
function initApiParams() {
	title = searchInputEl.value;
	type = selectBoxEls[0].getAttribute("data-option") || "";
	currentPage = 1;
	year = selectBoxEls[1].getAttribute("data-option") || "";
}

function renderMovies() {
	searchInputEl.value = ""; // 검색창 초기화 
	gridConEl.innerHTML = ""; // 그리드 영역 초기화
	fetchData(title, type, year, currentPage).then(res => parseData(res.data));
}

function parseData(resData) {
	/* 에러처리 */
	if (resData.Error) {
		handleError(resData.Error);
		return;
	}
	/* 페이지 길이 업데이트 */
	pageLength = Math.ceil(+resData.totalResults / 10);
	/* 렌더링 */
	renderSearchResults(resData);
	updateGridHandler();
}

function renderSearchResults(data) {
	messageEl.innerHTML = `"${title}" 검색 결과가 <span>${data.totalResults.toLocaleString()}</span>개 있습니다.`
	const newItems = data.Search.reduce((movies, movie) => movies + movieToGridItem(movie), "");
	gridConEl.innerHTML += newItems;
}
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
	</div>`;

function handleError(error) {
	const NOT_FOUND = "Movie not found!";
	const MANY_RESULT = "Too many results.";
	let errorMessage = "";
	if (error === NOT_FOUND) {
		errorMessage = `"${title}" 검색 결과가 없습니다.`;
	} else if (error === MANY_RESULT) {
		errorMessage = "검색 결과가 너무 많습니다.";
	}
	messageEl.textContent = errorMessage;
}

const io = new IntersectionObserver(async ([{intersectionRatio}]) => {
		if (intersectionRatio > 0 && pageLength > 1 && pageLength > currentPage) {
			loadingStart();
			await new Promise(resolve => setTimeout(resolve, 1000));
			fetchData(title, type, year, ++currentPage).then(res => parseData(res.data));
			loadingEnd();
		}
});

const targetEl = resultsSecEl.querySelector('.target-area');
io.observe(targetEl);

/* 모달창 관련 */
function updateGridHandler() {
	// 기존에 할당된 click 이벤트 핸들러 제거
	gridConEl.removeEventListener('click', handleGridClick);
	// .grid-container 요소 새로 받기 
	gridConEl = document.querySelector('.grid-container');
	// 새로 받은 .grid-container 요소에 click 이벤트 핸들러 할당
	gridConEl.addEventListener('click', handleGridClick);
}

function handleGridClick(e) {
	if (e.target.parentNode.className !== "contents-more") return;
	const movieId = e.target.closest(".contents-more").getAttribute('data-value');
	renderModal(movieId);
	/* 모달창을 제외한 배경 요소 스크롤 방지 */
	document.body.style.overflow = "hidden";
	hiddenModalEl.classList.add('active');
}

const hiddenModalEl = document.querySelector('.hidden-modal');
const modalCloseEl = hiddenModalEl.querySelector('.modal-close');
const modalCurtainEl = hiddenModalEl.querySelector('.modal-curtain');
modalCloseEl.addEventListener('click', handleModalClick);
modalCurtainEl.addEventListener('click', handleModalClick);

function handleModalClick(e) {
	/* 모달창을 제외한 배경 요소 스크롤 방지 해제 */
	document.body.style.overflow = "scroll";
	hiddenModalEl.classList.remove('active');
}

function renderModal(id) {
	fetchDataById(id).then(res => parseModalData(res.data));
}

function parseModalData(data) {
	const {
		Plot,
		Title,
		Director,
		Actors,
		Genre,
		imdbRating
	} = data;
	const imageEl = hiddenModalEl.querySelector('.modal-image');
	const plotEl = hiddenModalEl.querySelector('.modal-plot');
	const titleEl = hiddenModalEl.querySelector('.modal-title');
	const directorsEl = hiddenModalEl.querySelector('.modal-directors');
	const actorsEl = hiddenModalEl.querySelector('.modal-actors');
	const genresEl = hiddenModalEl.querySelector('.modal-genres');
	imageEl.src = data.Poster !== 'N/A' ? data.Poster.replace('SX300', 'SX700') : NO_POSTER_IMAGE;
	plotEl.textContent = Plot;
	titleEl.textContent = Title;
	directorsEl.textContent = Director;
	actorsEl.textContent = Actors;
	genresEl.textContent = Genre;
	drawCircle(imdbRating);
}
