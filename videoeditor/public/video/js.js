function fixTime(num) {
  num = Math.floor(num);
  let minutes = Math.floor(num / 60);
  num = num % 60;
  return minutes + ":" + (num < 10 ? "0" : "") + num;
}
function getCookie(name) {
  let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}
function setCookie(name, value, options = {}) {
  options = {path: '/', ...options};
  if (options.expires instanceof Date) options.expires = options.expires.toUTCString();
  let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  for (let optionKey in options) {
    updatedCookie += "; " + optionKey;
    let optionValue = options[optionKey];
    if (optionValue !== true) {
      updatedCookie += "=" + optionValue;
    }
  }
  document.cookie = updatedCookie;
}
let args;
function preLoad() {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      args = xmlHttp.responseText.split("§§§§");
      if (args[0] === 'doreset') {
        window.location.href = `/video?f=${args[1]}&sf=${args[2]}&id=1`;
        return;
      }
      afterLoad();
    }
  }
  xmlHttp.open("GET", "/api/getvideoid"+ window.location.search, true); // true for asynchronous
  xmlHttp.send("vidos");
}
var marker_start, marker_end;
window.onload = () => {
    video = document.querySelector(".video_container video");
    preLoad();
    var timeline = document.querySelector(".timeline");
    marker_start = document.querySelector(".marker.m_start");
    marker_end = document.querySelector(".marker.m_end");
    soundline = document.querySelector(".soundline");
    var pause = document.querySelector(".pause");
    var sound = document.querySelector(".sound");
    var timer_current = document.querySelector(".timer.current");

    timeline.addEventListener("change", function() {
      video.currentTime = video.duration * (timeline.value / 100);
      timer_current.innerText = fixTime(video.currentTime);
    });
    document.addEventListener("mousedown", (event) => {
      if (event.which == 4) {
        pasteStartMarker();
        doSave();
      }
      else if (event.which == 5) {
        pasteEndMarker();
        doSave();
      }
    });
    timeline.addEventListener("mousedown", (event) => video.pause());
    timeline.addEventListener("mouseup", (event) => {
      if (pause.innerText === '⏸') video.play();
    });

    video.addEventListener("timeupdate", function() {
      if (video.paused) return;
      timeline.value = (100 / video.duration) * video.currentTime;
      timer_current.innerText = fixTime(video.currentTime);
    });
    let lastPauseTime = Date.now();
    let doPause = () => {
      if (Date.now() - lastPauseTime < 200) return;
      if (video.paused == true) {
        video.play();
        pause.innerText = "⏸";
      } else {
        video.pause();
        pause.innerText = "⏵";
      }
      lastPauseTime = Date.now();
    }
    pause.addEventListener("click", doPause);
    window.addEventListener('keydown', event => {
        switch (event.code) {
          case "Space": {
            doPause();
            break;
          }
          case "KeyS": {
            pasteStartMarker();
            doSave();
            break;
          }
          case "KeyE": {
            pasteEndMarker();
            doSave();
            break;
          }
          default: break;
        }
    });
    video.onclick = () => doPause();
    soundline.addEventListener("change", function() {
      video.volume = soundline.value;
      if (soundline.value < 0.5) sound.innerText = "🕩";
      else sound.innerText = "🕪";
      setCookie("sound", Math.floor(video.volume*100));
    });
    sound.onmouseover = () => { soundline.style.opacity = 1.0; };
    sound.onmouseout = () => { soundline.style.opacity = 0.0; };
    soundline.onmouseover = () => { soundline.style.opacity = 1.0; };
    soundline.onmouseout = () => { soundline.style.opacity = 0.0; };
    video.addEventListener('loadeddata', function() {
      let el = document.querySelector(".timer.end");
      el.innerText = fixTime(video.duration);
      soundline.value = parseInt(getCookie("sound"))/100;
      if (soundline.value < 0.5) sound.innerText = "🕩";
      else sound.innerText = "🕪";
      video.volume = soundline.value;
      timeline.value = 0;
      timer_current.innerText = fixTime(0);
      if (pause.innerText === '⏸') video.play();
      if (parseFloat(args[6]) != -1) {
        pasteEndMarker(parseFloat(args[6]));
      } else {
        pasteEndMarker(video.duration);
      }
      if (parseFloat(args[5]) != -1) {
        pasteStartMarker(parseFloat(args[5]));
      } else {
        pasteStartMarker(0);
      }
    }, false);
}

var video, soundline;
const style_startvideo = 10.1;
const style_endvideo = 89.4;
let time_startvideo = 0, time_endvideo = 0;
function afterLoad() {
  video.src = "/api/video?videopath=" + args[0];
  document.querySelector(".controllers.top .videoid").innerText = `${args[3]}/${args[4]}`;
  document.querySelector(".controllers.top .videoname").innerText = `${atob(args[0]).split('/').at(-1)}`;

  document.querySelector(".controllers.top .gotovid.left").onclick = () => {
    history.pushState(null, null, `/video?f=${args[1]}&sf=${args[2]}&id=${parseInt(args[3])-1}`);
    preLoad();
  };
  document.querySelector(".controllers.top .gotovid.right").onclick = () => {
    history.pushState(null, null, `/video?f=${args[1]}&sf=${args[2]}&id=${parseInt(args[3])+1}`);
    preLoad();
  };
}
function doSave() {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", `/api/savevideo?p=${args[0]}&sm=${time_startvideo}&em=${time_endvideo}&id=${args[3]}`, false);
  xmlHttp.send("vidos");
}

function pasteStartMarker(time = video.currentTime) {
  if (time >= time_endvideo) return;
  if (time < 0) time = 0;
  if (video.duration && time > video.duration) time = video.duration;

  let a = style_endvideo - style_startvideo;
  a = a * time / video.duration;
  marker_start.style.marginLeft = `${style_startvideo + a}%`;
  time_startvideo = time;
}
function pasteEndMarker(time = video.currentTime) {
  if (time <= time_startvideo) return;
  if (time < 0) time = 0;
  if (video.duration && time > video.duration) time = video.duration;

  let a = style_endvideo - style_startvideo;
  a = a * time / video.duration;
  marker_end.style.marginLeft = `${style_startvideo + a}%`
  time_endvideo = time;
}
