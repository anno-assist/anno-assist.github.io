import { throttle } from '../../util.js';


const canvas = document.createElement('canvas');
canvas.id = 'layout-canvas';
canvas.style.backgroundColor = 'black';

resize();
const onResize = throttle(resize, 50);
window.addEventListener('resize', onResize);

const ctx = canvas.getContext('2d');


function resize() {
    const root =     document.getElementById('content');
    if (root) {
        const size = root.getBoundingClientRect();
        canvas.width = size.width - 8;
        canvas.height = size.height - 98;
    }
}


export { canvas, ctx };