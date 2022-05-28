/* 숫자 애니메이션 */
const countEl = document.querySelector(".count");
const numberAnimation = () => { 
	const data = +countEl.dataset.count; 
	const value = +countEl.innerText; 
	const time = data / 100; 
	if (value < data) { 
		countEl.innerText = Math.ceil(value + time);  
		requestAnimationFrame(numberAnimation); 
	}
	if (value === data) countEl.innerText = data.toLocaleString();
};
export default numberAnimation;

