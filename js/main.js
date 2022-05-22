import '../scss/main.scss';
import numberAnimation from './numberAnimation';
import renderOption from './renderOption';
import drawCircle from './drawCircle';
import movieTemplate from './movieTemplate';
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
const hiddenModalEl = get('.hidden-modal');
const modalCloseEl = hiddenModalEl.querySelector('.modal-close');
const modalCurtainEl = hiddenModalEl.querySelector('.modal-curtain');
const imageEl = hiddenModalEl.querySelector('.modal-image');
const plotEl = hiddenModalEl.querySelector('.modal-plot');
const titleEl = hiddenModalEl.querySelector('.modal-title');
const directorsEl = hiddenModalEl.querySelector('.modal-directors');
const actorsEl = hiddenModalEl.querySelector('.modal-actors');
const genresEl = hiddenModalEl.querySelector('.modal-genres');
const imdbLinkEl = hiddenModalEl.querySelector('.imdb-link'); 
const bodyLoaderConEl = get('.body-loader-container');
const videoWrapEl = get('.video-wrap');
const videoEl = videoWrapEl.querySelector('video');
const videoCloseEl = get('.video-close');
const KOREAN = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
const NO_POSTER_IMAGE = "./images/noPoster.png";
const IMDB_BASE_URL = "https://www.imdb.com/title/";
const NOT_FOUND = "Movie not found!";
let gridConEl = resultsSecEl.querySelector('.grid-container');
let selectedBox, title, type, year, pageLength, currentPage;

const openOptions = e => {
	if (e.target.className !== "selectbox__displayWord") return;
	selectedBox = e.target.closest('.selectbox');
	selectedBox.classList.toggle('selectbox--active');
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
const fetchMoreLoadingStart = () => loaderEl.classList.add('active');
const fetchMoreLoadingStop = () => loaderEl.classList.remove('active');
const bodyLoadingStart = () => bodyLoaderConEl.classList.add('active');
const bodyLoadingStop = () => bodyLoaderConEl.classList.remove('active');

const initApiParams = () => {
	title = searchInputEl.value;
	type = selectBoxEls[0].dataset.option || "";
	year = selectBoxEls[1].dataset.option || "";
	currentPage = 1;
	pageLength = 1;
}
const renderMovies = () => {
	initApiParams();
	searchInputEl.value = ""; // 검색창 초기화 
	gridConEl.innerHTML = ""; // 그리드 영역 초기화
	setTimeout(bodyLoadingStart);
	fetchData(title, type, year, currentPage)
		.then(res => parseData(res.data))
		.then(res => bodyLoadingStop());
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
	const newItems = data.Search.reduce((movies, movie) => movies + movieTemplate(movie), "");
	gridConEl.insertAdjacentHTML("beforeend", newItems);
}

const handleError = error => {
	//const MANY_RESULT = "Too many results.";
	const errorMessage = (error === NOT_FOUND) ? `"${title}" 검색 결과가 없습니다.` : "검색 결과가 너무 많습니다.";
	messageEl.textContent = errorMessage;
}

const io = new IntersectionObserver(([{
	isIntersecting
}]) => {
	if (!isIntersecting) return;
	if (pageLength > 1 && pageLength > currentPage) {
		setTimeout(fetchMoreLoadingStart);
		fetchData(title, type, year, ++currentPage)
			.then(res => parseData(res.data))
				.then(res => fetchMoreLoadingStop());
	}
});

const updateGridHandler = () => {
	// 기존에 할당된 click 이벤트 핸들러 제거
	gridConEl.removeEventListener('click', handleGridClick);
	// .grid-container 요소 새로 받기 
	gridConEl = get('.grid-container');
	// 새로 받은 .grid-container 요소에 click 이벤트 핸들러 할당
	gridConEl.addEventListener('click', handleGridClick);
}

const handleGridClick = e => {
	if (e.target.parentNode.className !== "contents-more") return;
	const movieId = e.target.closest(".contents-more").dataset.value;
	renderModal(movieId);
}

const renderModal = id => {
	fetchDataById(id)
		.then(res => parseModalData(res.data))
			.then(res => {
				/* 모달창을 제외한 배경 요소 스크롤 방지 */
				document.body.style.overflow = "hidden";
				hiddenModalEl.classList.add('active');
			});
}

const parseModalData = async data => {
	const {
		Plot,
		Title,
		Director,
		Actors,
		Genre,
		imdbRating,
		imdbID
	} = data;
	imageEl.src = data.Poster !== 'N/A' ? data.Poster.replace('SX300', 'SX700') : NO_POSTER_IMAGE;
	plotEl.textContent = Plot;
	titleEl.textContent = Title;
	directorsEl.textContent = Director;
	actorsEl.textContent = Actors;
	genresEl.textContent = Genre;
	imdbLinkEl.setAttribute('href', IMDB_BASE_URL+imdbID);
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
const handleSubmit = async (e) => {
	e.preventDefault();
	resultsSecEl.classList.add('active');
	const searched = searchInputEl.value;
	if (KOREAN.test(searched)) {
		messageEl.textContent = "영어로 검색하세요.";
		return;
	}
	// 검색어가 없거나, select 박스의 옵션값이 변경되지 않고 검색어가 직전의 검색어와 같을 경우 종료
	const isInputEmpty = searched.replace(/ /gi,"") === "";
	const isNotChanged = title === searched && type === selectBoxEls[0].dataset.option && year === selectBoxEls[1].dataset.option;
	if (isInputEmpty || isNotChanged) return;
	renderMovies();
}
const handleModalClick = () => {
	/* 모달창을 제외한 배경 요소 스크롤 방지 해제 */
	document.body.style.overflow = "scroll";
	hiddenModalEl.classList.remove('active');
}
const handleVideoStop = () => {
	videoWrapEl.classList.add('inactive');
	searchSecEl.classList.add('ani-active');
	numberAnimation();
};
const handleVideoCloseClick = () => videoEl.pause();
const init = () => {
	renderOption();
	selectboxConEl.addEventListener("click", handleSelectBoxClick);
	document.body.addEventListener("click", handleSelectBoxClose);
	formEl.addEventListener('submit', handleSubmit);
	modalCloseEl.addEventListener('click', handleModalClick);
	modalCurtainEl.addEventListener('click', handleModalClick);
	videoEl.addEventListener("ended", handleVideoStop);
	videoEl.addEventListener("pause", handleVideoStop);
	videoCloseEl.addEventListener("click", handleVideoCloseClick);
	io.observe(targetEl);
};
init();