var video = document.getElementById("vidos");
var videocontainer = document.getElementById("videocontainer");
var anybut = document.querySelector(".another p");

window.addEventListener('resize', event => {
    videocontainer.style.width = 'auto';
    videocontainer.style.height = 'auto';
    videocontainer.style.width = video.clientWidth+'px';
    videocontainer.style.height = video.clientHeight+'px';
    anybut.style.fontSize = video.clientWidth/1515*45+'px';
}, true);

window.addEventListener('keydown', event => {
    if (event.code === 'KeyS') {
        console.log(true);
    }
});
function reloadCss() {
  console.log('reloading');
    var links = document.getElementsByTagName("link");
    for (var cl in links) {
        var link = links[cl];
        if (link.rel === "stylesheet")
            link.href += "";
    }
}
function doReload() {
  reloadCss();
  setTimeout(() => {
    doReload();
  }, 10000);
}
window.onload = () => {
  // doReload();
}
