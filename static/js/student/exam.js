// Firebase SDKs
    // Import the functions
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";
    import { getDatabase, ref, set, get, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Firebase configuration
    const firebaseConfig = {
    apiKey: "AIzaSyDALbDCl1cQ0K-WoIVW_jEhGGFpVKu4HG8",
    authDomain: "dbtest-a8005.firebaseapp.com",
    databaseURL: "https://dbtest-a8005-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "dbtest-a8005",
    storageBucket: "dbtest-a8005.appspot.com",
    messagingSenderId: "788239328067",
    appId: "1:788239328067:web:aa6bd9897621641f4c45f6",
    measurementId: "G-B77QR8NJPQ"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const database = getDatabase();
// Firebase SDKs (ここまで)

// 必要な関数をインポート
import { queryDivider, generateUuid } from '../set.js';
import { differenceToCurrentUnix, differenceFromCurrentUnix, convertISO8601ToDateArray, convertUnixToDateArray, convertDateArrayToUnix, convertUnixToISO8601,convertISO8601ToUnix } from '../time.js';
import { getStudentNum, getStudentName, getStudentFac, getStudentDep, getStudentGrade, getSubjectName, getTestName, getTestDate, getTestLimit } from '../get.js';

// グローバル変数の定義
var subjectId;          // 教科のIDを格納
var subjectName;        // 教科の名前を格納
var userId;             // ユーザーIDを格納
var testId;             // テストのIDを格納
var testName;           // テストの名前を格納
var testDate;           // テストの日付を格納
var testLimit;          // テストの試験時間を格納
var testStart;          // テストの開始時刻(UNIX時間)を格納
var testEnd;            // テストの終了時刻(UNIX時間)を格納
var nowUnix;            // 現在時刻(UNIX時間)が随時格納される
var testStatus;         // テストの状況(試験前・試験中・試験後)が格納される
var subjectNameArea = document.getElementById("subjectNameArea");
var testNameArea = document.getElementById("testNameArea");
var testDateArea = document.getElementById("testDateArea");
var testLimitArea = document.getElementById("testLimitArea");
var stream;             // webカメラのストリームを格納
var mediaRecorder;      // メディアレコーダーを格納
var record_data = [];   // 録画されたデータの格納
var capStartTime;       // 録画開始日時(UNIX時間)を格納
var cheatCheckStatus = 0;   // カンニング判定プログラムの実行状態を格納

// カメラの設定
const cameraSetting = {
    audio: false,
    video: {
        width: 1280,
        height: 720,
        facingMode: "user",
    }
}

// ページがロードされたときに実行
window.onload = async () => {
    // クエリから必要な情報を読み込む
    subjectId = queryDivider()[0];  // クエリの１つ目に「教科のID」
    testId = queryDivider()[1];     // クエリの２つ目に「テストのID」
    userId = queryDivider()[2];     // クエリの３つ目に「ユーザーのID」

    // DBから必要な情報を取得する
    subjectName = await getSubjectName(subjectId);      // 教科名の取得
    testName = await getTestName(subjectId, testId);    // テスト名の取得
    testDate = await getTestDate(subjectId, testId);    // テスト日時(ISO8601)の取得
    testLimit = await getTestLimit(subjectId, testId);  // テスト試験時間の取得

    // 必要な情報をHTMLに表示
    subjectNameArea.innerHTML = subjectName;        // 教科名の表示
    testNameArea.innerHTML = testName;              // テスト名の表示
    testDateArea.innerHTML = arrangeDate(testDate); // テスト日時の表示
    testLimitArea.innerHTML = testLimit + "分間";   // テスト試験時間の表示

    testStart = convertISO8601ToUnix(testDate);     // テストの開始時刻(UNIX時間)の取得
    testEnd = testStart + (testLimit * 60 * 1000);  // テストの終了時刻(UNIX時間)の取得
    console.log("[ Time-Check ] " + testStart + " : testStart ( UNIX time )");
    console.log("[ Time-Check ] " + testEnd + " : testEnd ( UNIX time )");

    // 戻るボタンの実装
    var backBtn = document.getElementById("backBtn");
    backBtn.href = "./mypageS.html?id=" + userId;

    // ウェブカメラのストリームを取得（ウェブカメラのアクセス許可を求める）
    stream = await navigator.mediaDevices.getUserMedia(cameraSetting);

    // 'video/webm' 形式のビデオ録画がサポートされているかどうかを確認
    if (!MediaRecorder.isTypeSupported('video/webm')) {
        console.warn('video/webm is not supported')
    }

    // MediaRecorder クラスを使用して、ウェブカメラのストリームを録画するためのメディアレコーダーを作成
    mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
    })
}

// １秒に１回実行される
x = setInterval(() => {
    // 現在時刻を取得して、このテストのステータスを確認・タイマー表示
    nowUnix = new Date().getTime();
    testStatus = getTestStatus();
    showStatus();       // ステータスに応じてHTMLの表示を変える
    showTimer();        // タイマー表示の関数の呼び出し

    // 試験中かつカンニング判定プログラムが動作中でなければ実行する
    if(testStatus == 1 && cheatCheckStatus == 0){
        console.log("----- ----- ----- -----");
        console.log("[ READY ] to start cheatCheck");
        cheatCheckStatus = 1;   // カンニング判定プログラムの動作中を格納
        doCheatCheck();         // カンニング判定プログラムの実行
    }
}, 1000);

// カンニング判定の関数
async function doCheatCheck(){
    await videoGetAndSend();    // 動画を録画してPythonに送る関数の呼出
}

// （ここから）webカメラに関する記述
    

    // webカメラ映像を録画してhttpリクエストとしてPythonに映像を送る関数
    async function videoGetAndSend(){
        // ストリームの取得とメディアレコーダーの作成
        stream = await navigator.mediaDevices.getUserMedia(cameraSetting);
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm',
        })

        mediaRecorder.start();  // 録画開始
        capStartTime = new Date().getTime();    // 現在時刻(UNIX時間)を取得
        console.log("[ START ] a video capture (unixTime: " + capStartTime + ")");
        await wait(11000);      // 11秒待機
        mediaRecorder.stop();   // 録画停止
        console.log("[ STOP ] a video capture");

        // mediaRecorder.stop()の完了を待つ
        await new Promise(resolve => {
            mediaRecorder.onstop = resolve;
        });

        var blob = new Blob(record_data, { type: 'video/webm' })    // 録画ファイルをblob形式に出力
        sendBlobToServer(blob);  // recordedBlobをHTTPリクエストを介してPythonに送信する
    }

    // 録画データが利用可能になるたびに実行
    mediaRecorder.addEventListener('dataavailable', event => {
        record_data.push(event.data);
    })

    // 動画データをPythonに送信する
    function sendBlobToServer(blobFile){
        var responce;
        // 動画データ(Blob)をHTTPリクエスト(XHR)を介してPython()に送信する
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/upload', true);

        xhr.onload = () => {
            if (xhr.status === 200) {
                // 200が返ってくると、正常に送信されたことが分かる
                console.log('[ SUCCESS! ] send a video-data(Blob) to Python(Server-side)');
                // httpレスポンスを取得
                responce = xhr.responseText;
                console.log("[ GET ] a http Responce from Python: " + responce);
                arrangeResponse(responce);
            } else {
                console.error('[ ERROR ] http Request Error:', xhr.status);
                arrangeResponse(-100);
            }
        };

        const formData = new FormData();
        formData.append('file', blobFile, 'recorded_video.webm');

        xhr.send(formData);
    }

// （ここまで）webカメラに関する記述

// Pythonから受け取ったResponseを加工する関数
async function arrangeResponse(input){
    // HTMLオブジェクトの取得
    var cheatDisplayMainMessage = document.getElementById("cheatDisplayMainMessage");
    var cheatDisplaySubMessage = document.getElementById("cheatDisplaySubMessage");
    
    // カンニングを検知した場合
    if(input == 1){
        console.log("[ DETECT ] a cheating!");
        // 画面(HTML)表示
        cheatDisplayMainMessage.innerHTML = "カンニングが検知されました！";
        cheatDisplaySubMessage.innerHTML = "試験監督者の指示に従ってください";
        $('#cheatDisplayArea').removeClass('bg-success-subtle').addClass('bg-danger-subtle');
        $('#cheatDisplayMainMessage').removeClass('text-success').addClass('text-danger');
        // DB格納
        var cheatDataRef = ref(database, 'subjects/' + subjectId + '/tests/' + testId + 'cheatData/');
        var snapshot = await get(cheatDataRef);
        var data = snapshot.val();
        var dataLength = 0;
        if(data != null) dataLength = Object.keys(data).length;  // 要素数を数える
        var cheaDataSetRef = ref(database, 'subjects/' + subjectId + '/tests/' + testId + 'cheatData/' + dataLength + '/');
        await set(cheaDataSetRef, {
            cheatUid : userId,
            cheatDate : capStartTime
        });
    }

    cheatCheckStatus = 0;   // カンニング判定プログラムの動作完了を格納
}

// 現在の「testStatus」の値に応じてHTMLの表示を変更する
function showStatus(){
    // HTMLオブジェクトの参照
    var testStatusArea = document.getElementById("testStatusArea");

    // 「testStatus」の条件分岐
    switch(testStatus){
        case -1:
            // 試験時間前(24時間以上前)
            $('#testStatusDuring').removeClass('visible').addClass('unvisible');
            $('#testStatusBefore').removeClass('unvisible').addClass('visible');
            $('#testStatusAfter').removeClass('visible').addClass('unvisible');
            $('#cheatDisplayBefore').removeClass('unvisible').addClass('visible');
            $('#cheatDisplayArea').removeClass('visible').addClass('unvisible');
            $('#cheatDisplayAfter').removeClass('visible').addClass('unvisible');
            break;
        case 0:
            // 試験時間前(24時間以内)
            testStatusArea.innerHTML = '開始';
            $('#testStatusArea').removeClass('c-sub-pink').addClass('c-sub-blue');
            $('#countDownArea').removeClass('c-sub-pink').addClass('c-sub-blue');
            $('#testStatusDuring').removeClass('unvisible').addClass('visible');
            $('#testStatusBefore').removeClass('visible').addClass('unvisible');
            $('#testStatusAfter').removeClass('visible').addClass('unvisible');
            $('#cheatDisplayBefore').removeClass('unvisible').addClass('visible');
            $('#cheatDisplayArea').removeClass('visible').addClass('unvisible');
            $('#cheatDisplayAfter').removeClass('visible').addClass('unvisible');
            break;
        case 1:
            // 試験時間中
            testStatusArea.innerHTML = '終了';
            $('#testStatusArea').removeClass('c-sub-blue').addClass('c-sub-pink');
            $('#countDownArea').removeClass('c-sub-blue').addClass('c-sub-pink');
            $('#testStatusDuring').removeClass('unvisible').addClass('visible');
            $('#testStatusBefore').removeClass('visible').addClass('unvisible');
            $('#testStatusAfter').removeClass('visible').addClass('unvisible');
            $('#cheatDisplayBefore').removeClass('visible').addClass('unvisible');
            $('#cheatDisplayArea').removeClass('unvisible').addClass('visible');
            $('#cheatDisplayAfter').removeClass('visible').addClass('unvisible');
            break;
        case 2:
            // 試験時間後
            $('#testStatusDuring').removeClass('visible').addClass('unvisible');
            $('#testStatusBefore').removeClass('visible').addClass('unvisible');
            $('#testStatusAfter').removeClass('unvisible').addClass('visible');
            $('#cheatDisplayBefore').removeClass('visible').addClass('unvisible');
            $('#cheatDisplayArea').removeClass('visible').addClass('unvisible');
            $('#cheatDisplayAfter').removeClass('unvisible').addClass('visible');
            break;
    }

    // 読み込み画面の非表示
    $('#loadingArea').addClass('unvisible');
}

// タイマーの表示
function showTimer(){
    // HTMLオブジェクトの参照
    var timerMinuteArea = document.getElementById("timerMinuteArea");
    var timerSecondArea = document.getElementById("timerSecondArea");

    var distance;   // 現在時刻からテスト開始あるいは終了までのUNIX時間
    // 「testStatus」の条件分岐
    switch(testStatus){
        case 0:
            // 試験時間前(24時間以内)
            distance = differenceFromCurrentUnix(testStart);
            break;
        case 1:
            // 試験時間中
            distance = differenceFromCurrentUnix(testEnd);
            break;
    }

    // UNIX時間を分・秒に変換
    var timerMinute = (Math.floor(distance / (60 * 1000))).toString().padStart(2, "0");
    var timerSecond = (Math.floor(distance / 1000) - (timerMinute * 60)).toString().padStart(2, "0");
    // HTMLに表示
    timerMinuteArea.innerHTML = timerMinute;
    timerSecondArea.innerHTML = timerSecond;
}

// 日時(ISO8601: "yyyy-mm-ddThh:mm")を表示したい形式に整形
function arrangeDate(dateInput){
    // 関数の返り値を入れる変数を用意
    var output;

    // 整形
    var dateArray = convertISO8601ToDateArray(dateInput); // dateArray = [yyyy, mm, dd, hh, mm]
    output = dateArray[0] + "年" + dateArray[1] + "月" + dateArray[2] + "日 " + dateArray[3] + ":" + dateArray[4];
    
    return output;
}

// 試験時間前・試験時間中・試験時間後かどうかを返す関数（テストIDが既知の場合にのみ使用可能）
function getTestStatus(){
    var output = -100;
    var oneDayUnix = 24 * 60 * 60 * 1000;       // 24時間(UNIX時間)

    if(nowUnix <= (testStart - oneDayUnix)) output = -1;
    if((testStart - oneDayUnix) < nowUnix && nowUnix < testStart) output = 0;
    if(testStart <= nowUnix && nowUnix <= testEnd) output = 1;
    if(testEnd < nowUnix) output = 2;

    // 返り値
    // (-1: 試験時間前(24時間以上前), 0: 試験時間前(24時間以内), 1: 試験時間中, 2: 試験時間後)
    return output;
}

// スリープ関数
function wait(mSec) {
    // jQueryのDeferredを作成します。
    var objDef = new $.Deferred;
    setTimeout(() => {
        // 引数ミリ秒後に、resolve()を実行し、Promiseを完了。
        objDef.resolve(mSec);
    }, mSec);
    return objDef.promise();
};