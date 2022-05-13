/* 숫자 애니메이션 */
const countEl = document.querySelector(".count");
let speed = 100;
const numberAnimation = () => { 
	const data = +countEl.getAttribute('data'); 
	const value = +countEl.innerText; 
	const time = data / speed; 
	if (value < data) { 
		countEl.innerText = Math.ceil(value + time);  
		requestAnimationFrame(numberAnimation); 
	}
	if (value === data) countEl.innerText = data.toLocaleString();
};
export default numberAnimation;
