// setPage.js: ウィンドウの幅に応じて、表示するコンテンツを変えるためのJS

// あとで使う変数を用意
var windowWidth;
var windowHeight;

// ページが読み込まれたときに実行
window.addEventListener('load', async function (){
    // 表示領域のサイズを取得
    var windowSize = getWindowSize();
    windowWidth = windowSize[0];
    windowHeight = windowSize[1];

    setContents();
})

// 画面サイズが変更されたときに実行
$(window).resize(function () {  
    // 表示領域のサイズを取得（横幅だけを更新）
    var windowSize = getWindowSize();
    windowWidth = windowSize[0];

    setContents();
});

// ウィンドウサイズを取得
function getWindowSize(){
    var windowWidth_ofContents = Math.min(window.innerWidth, window.parent.screen.width);
    var windowHeight_ofContents = Math.min(window.innerHeight, window.parent.screen.height);

    console.log("window size (width, height): ( " + windowWidth_ofContents + ", " + windowHeight_ofContents + " )");

    let windowSize = [windowWidth_ofContents, windowHeight_ofContents];
    return windowSize;
}

// 表示するコンテンツをウィンドウサイズによって変化
function setContents() {
    if (windowWidth < 768) {
        // スモールサイズ以下の処理（スマホだと仮定する）
        console.log('window size [smart phone size]');

        // ナブ領域の表示非表示
        $('#nav-pc').addClass('unvisible').removeClass('visible');
        $('#nav-mobile-buttonArea').addClass('visible').removeClass('unvisible');

    } else if (windowWidth >= 768 && windowWidth < 992) {
        // ミディアムサイズの処理（タブレット端末だと仮定する）
        console.log('window size [tablet device size]');

        // ナブ領域の表示非表示
        $('#nav-pc').addClass('unvisible').removeClass('visible');
        $('#nav-mobile-buttonArea').addClass('visible').removeClass('unvisible');

    } else {
        // ラージサイズ以上の処理（PC画面であると仮定する）
        console.log('window size [PC monitor size]');

        // ナブ領域の表示非表示
        $('#nav-pc').addClass('visible').removeClass('unvisible');
        $('#nav-mobile-buttonArea').addClass('unvisible').removeClass('visible');

    }

}