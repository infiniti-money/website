const filters=[...document.querySelectorAll(".filter")];
const lessons=[...document.querySelectorAll(".lesson")];
const key="hocweb-completed-lessons";
const progressFill=document.querySelector("#progress-fill");
const progressText=document.querySelector(".progress span");
const empty=document.querySelector(".empty");
function loadDone(){try{const value=JSON.parse(localStorage.getItem(key)||"[]");return new Set(Array.isArray(value)?value:[])}catch{return new Set()}}
let done=loadDone();
function renderProgress(){const count=lessons.filter(item=>done.has(item.dataset.lesson)).length;progressText.textContent=`${count}/4 hoàn thành`;progressFill.style.width=`${count/lessons.length*100}%`;lessons.forEach(item=>{const button=item.querySelector(".done");const complete=done.has(item.dataset.lesson);button.setAttribute("aria-pressed",String(complete));button.setAttribute("aria-label",`${complete?"Bỏ đánh dấu":"Đánh dấu"} ${item.querySelector("h3").textContent} ${complete?"chưa hoàn thành":"là hoàn thành"}`)})}
filters.forEach(button=>button.addEventListener("click",()=>{filters.forEach(filter=>{const active=filter===button;filter.classList.toggle("active",active);filter.setAttribute("aria-pressed",String(active))});let visible=0;lessons.forEach(item=>{item.hidden=button.dataset.filter!=="all"&&item.dataset.category!==button.dataset.filter;if(!item.hidden)visible++});empty.hidden=visible!==0}));
document.querySelectorAll(".done").forEach(button=>button.addEventListener("click",()=>{const id=button.closest(".lesson").dataset.lesson;if(done.has(id))done.delete(id);else done.add(id);localStorage.setItem(key,JSON.stringify([...done]));renderProgress()}));
document.querySelector("#copy-code").addEventListener("click",async()=>{const snippet='<!doctype html>\n<html lang="vi">\n  <h1>Xin chào, thế giới!</h1>\n  <p>Mình đang học tạo website.</p>\n</html>';const feedback=document.querySelector("#copy-feedback");try{await navigator.clipboard.writeText(snippet);feedback.textContent="Đã sao chép! Giờ bạn có thể dán vào index.html."}catch{feedback.textContent="Trình duyệt chưa cho phép sao chép. Hãy sao chép đoạn mã thủ công nhé."}});
const menu=document.querySelector(".menu"),nav=document.querySelector("#nav");menu.addEventListener("click",()=>{const open=menu.getAttribute("aria-expanded")==="true";menu.setAttribute("aria-expanded",String(!open));menu.setAttribute("aria-label",open?"Mở menu":"Đóng menu");nav.classList.toggle("open",!open)});nav.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>{menu.setAttribute("aria-expanded","false");menu.setAttribute("aria-label","Mở menu");nav.classList.remove("open")}));
renderProgress();
