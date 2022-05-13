/* option 출시년도 렌더링 관련 */
const optionConEl = document.querySelector('.option-container.year'); // 출시년도 option-container
const makeYears = () => {
	const arr = [];
	const thisYear = new Date().getFullYear();
	for (let i = thisYear; i >= 1985; i -= 1) {
		arr.push(i)
	}
	return arr;
}
const renderOption = () => {
	const yearToOption = year => `<div class="option-container__option">
	<input type="radio" class="option__radio" id="${year}" name="year">
	<label class="option__label" for="${year}" data-value="${year}">${year}</label>
	</div>`;
	const years = makeYears();
	const newOptions = years.reduce((years,year)=>years+yearToOption(year), "");
	optionConEl.innerHTML = newOptions;
};
export default renderOption; 

