import numberAnimation from './numberAnimation';
import renderOption from './renderOption';
import drawCircle from './drawCircle';
import {
	fetchData,
	fetchDataById
} from './api';
const get = target => document.querySelector(target);
const searchSecEl = get("#search");
const formEl = searchSecEl.querySelector(".form");
const selectboxConEl = formEl.querySelector(".selectbox-container");
const selectBoxEls = document.querySelectorAll(".selectbox");
const searchInputEl = formEl.querySelector('.search-input');
const resultsSecEl = get('#results');
const messageEl = resultsSecEl.querySelector('.message');
const loaderEl = resultsSecEl.querySelector('.loader');
const targetEl = resultsSecEl.querySelector('.target-area');
const NO_POSTER_IMAGE = "./images/noPoster.png";
const hiddenModalEl = get('.hidden-modal');
const modalCloseEl = hiddenModalEl.querySelector('.modal-close');
const modalCurtainEl = hiddenModalEl.querySelector('.modal-curtain');
const KOREAN = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
const bodyLoaderConEl = get('.body-loader-container');
let gridConEl = resultsSecEl.querySelector('.grid-container');
let selectedBox, title, type, year, pageLength, currentPage;

const openOptions = e => {
	if (e.target.className !== "selectbox__displayWord") return;
	selectedBox = e.target.closest('.selectbox');
	selectedBox.classList.add('selectbox--active');
}
const handleLabels = e => {
	if (e.target.className !== "option-container__option") return;
	const option = e.target;
	const label = option.querySelector("label");
	const selectBox = option.parentNode.parentNode;
	const selectBoxDisplay = selectBox.querySelector(".selectbox__displayWord");
	selectBoxDisplay.innerHTML = label.innerHTML;
	selectBox.dataset.option = label.dataset.value;
	selectBox.classList.remove("selectbox--active", "selectbox--unselect");
}
const loadingStart = () => loaderEl.classList.add('active');
const loadingStop = () => loaderEl.classList.remove('active');
const bodyLoadingStart = () => bodyLoaderConEl.classList.add('active');
const bodyLoadingStop = () => bodyLoaderConEl.classList.remove('active');
const timer = () => new Promise(resolve => setTimeout(resolve, 1000));

const initApiParams = () => {
	title = searchInputEl.value;
	type = selectBoxEls[0].dataset.option || "";
	currentPage = 1;
	year = selectBoxEls[1].dataset.option || "";
}
const renderMovies = () => {
	initApiParams();
	searchInputEl.value = ""; // 검색창 초기화 
	gridConEl.innerHTML = ""; // 그리드 영역 초기화
	fetchData(title, type, year, currentPage).then(res => parseData(res.data)).catch(error => alert(error));
}
const parseData = resData => {
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
const renderSearchResults = data => {
	messageEl.innerHTML = `"${title}" 검색 결과가 <span>${data.totalResults.toLocaleString()}</span>개 있습니다.`
	const newItems = data.Search.reduce((movies, movie) => movies + MOVIE_TEMPLATE(movie), "");
	gridConEl.insertAdjacentHTML("beforeend", newItems);
}
const MOVIE_TEMPLATE = movie =>
	`<div class="grid-item">
		<div class="contents-poster">
			<img src=${movie.Poster!=='N/A' ? movie.Poster : NO_POSTER_IMAGE} alt="poster" onerror="this.src='./images/noPoster.png'">
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

const handleError = error => {
	const NOT_FOUND = "Movie not found!";
	//const MANY_RESULT = "Too many results.";
	let errorMessage = "";
	errorMessage = (error === NOT_FOUND) ? `"${title}" 검색 결과가 없습니다.` : "검색 결과가 너무 많습니다.";
	messageEl.textContent = errorMessage;
}

const io = new IntersectionObserver(async ([{
	intersectionRatio
}]) => {
	if (intersectionRatio > 0 && pageLength > 1 && pageLength > currentPage) {
		loadingStart();
		await timer();
		fetchData(title, type, year, ++currentPage).then(res => parseData(res.data)).catch(error => alert(error));
		loadingStop();
	}
});

/* 모달창 관련 */
const updateGridHandler = () => {
	// 기존에 할당된 click 이벤트 핸들러 제거
	gridConEl.removeEventListener('click', handleGridClick);
	// .grid-container 요소 새로 받기 
	gridConEl = get('.grid-container');
	// 새로 받은 .grid-container 요소에 click 이벤트 핸들러 할당
	gridConEl.addEventListener('click', handleGridClick);
}

const handleGridClick = async e => {
	if (e.target.parentNode.className !== "contents-more") return;
	const movieId = e.target.closest(".contents-more").dataset.value;
	renderModal(movieId);
	/* 모달창을 제외한 배경 요소 스크롤 방지 */
	document.body.style.overflow = "hidden";
	hiddenModalEl.classList.add('active');
}

const renderModal = id => fetchDataById(id).then(res => parseModalData(res.data)).catch(error => alert(error));

const parseModalData = data => {
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
const handleSelectBoxClick = (e) => {
	e.stopPropagation();
	openOptions(e);
	handleLabels(e);
}
const handleSelectBoxClose = () => {
	if (!selectedBox) return;
	// 열린 option 창이 2개 이상이면 한꺼번에 닫아 주기 
	if (formEl.querySelectorAll('.selectbox--active').length > 1) {
		formEl.querySelectorAll('.selectbox').forEach(elem =>
			elem.classList.remove("selectbox--active")
		);
	}
	selectedBox.classList.remove("selectbox--active");
}
const handleFormClick = async (e) => {
	e.preventDefault();
	const searched = searchInputEl.value;
	if (KOREAN.test(searched)) {
		messageEl.textContent = "영어로 검색하세요.";
		return;
	}
	// 검색어가 없거나, 검색어가 직전의 검색어와 같을 경우 종료
	if (searched === "" || title === searched) return;
	bodyLoadingStart();
	await timer();
	renderMovies();
	bodyLoadingStop();
}
const handleModalClick = e => {
	/* 모달창을 제외한 배경 요소 스크롤 방지 해제 */
	document.body.style.overflow = "scroll";
	hiddenModalEl.classList.remove('active');
}
const init = () => {
	numberAnimation();
	renderOption();
	selectboxConEl.addEventListener("click", handleSelectBoxClick);
	document.body.addEventListener("click", handleSelectBoxClose);
	formEl.addEventListener('submit', handleFormClick);
	modalCloseEl.addEventListener('click', handleModalClick);
	modalCurtainEl.addEventListener('click', handleModalClick);
	io.observe(targetEl);
};
init();