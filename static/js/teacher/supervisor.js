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
var cheatDataArray = [];        // カンニングデータを格納する配列   （例）[['cheatUid_1', 'cheatDate_1'], ['cheatUid_2', 'cheatDate_2'], ...]
var detailCheatDataArray = [];  // カンニングデータの詳細を格納する配列

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
    backBtn.href = "./mypage.html?id=" + userId;

    // カンニングデータの取得・詳細情報取得・整形・表示
    await doCheatData();

}

// １秒に１回実行される
x = setInterval(() => {
    // 現在時刻を取得して、このテストのステータスを確認・タイマー表示
    nowUnix = new Date().getTime();
    testStatus = getTestStatus();
    showStatus();       // ステータスに応じてHTMLの表示を変える
    showTimer();        // タイマー表示の関数の呼び出し

}, 1000);

// 新たにカンニングを検知したときに実行（ただし教科IDとテストIDが既知である前提）
var cheatDataRef = ref(database, 'subjects/' + subjectId + '/tests/' + testId + '/cheatData/');
onValue(cheatDataRef, doCheatData());  // カンニングデータの取得・詳細情報取得・整形・表示

// カンニングデータの取得・詳細情報取得・整形・表示すべてをまとめた関数
async function doCheatData(){
    await getCheatData();           // カンニングデータの取得
    await getDetailCheatData();     // カンニングデータの詳細を取得
    await showCheatData();          // カンニングデータの表示
}

// カンニングデータを読み込んで配列「cheatDataArray」に格納する関数
async function getCheatData(){
    var cheatDataRef = ref(database, 'subjects/' + subjectId + '/tests/' + testId + '/cheatData/');
    var snapshot = await get(cheatDataRef);
    var data = snapshot.val();
    
    if(data == null) return;   // データが空ならforEachしない

    // カンニングデータをひとつひとつ読み込んで、配列「cheatDataArray」に格納
    Object.keys(data).forEach((element, index, key, snapshot) => {
        var tmp = [];
        tmp[0] = data[element].cheatUid;
        tmp[1] = data[element].cheatDate;
        cheatDataArray.push(tmp);
    });
}

// カンニングデータの詳細を取得して配列「detailCheatDataArray」に格納する関数
async function getDetailCheatData(){
    // 配列「cheatDataArray」のカンニングした人のUidを元に、その人の各情報を取得して配列「detailCheatDataArray」に格納
    for(var i = 0; i < cheatDataArray.length; i++){
        var targetUid = cheatDataArray[i][0];                       // ユーザーID
        var tmpStudentNum = await getStudentNum(targetUid);         // 学籍番号
        var tmpStudentName = await getStudentName(targetUid);       // 氏名
        var tmpStudentFac = await getStudentFac(targetUid);         // 学部
        var tmpStudentDep = await getStudentDep(targetUid);         // 学科
        var tmpStudentGrade = await getStudentGrade(targetUid);     // 学年

        var tmpArray = [];                  // 整形 ['studentNum', 'studentName', 'studentDep', 'studentGrade', 'cheatDate']
        tmpArray[0] = tmpStudentNum;
        tmpArray[1] = tmpStudentName;
        tmpArray[2] = tmpStudentDep;
        tmpArray[3] = tmpStudentGrade;
        tmpArray[4] = cheatDataArray[i][1];
        
        detailCheatDataArray.push(tmpArray);
    }
}

// カンニングデータをHTMLに表示させる関数
async function showCheatData(){
    if(cheatDataArray.length == 0){ 
        $('#neverCheatedArea').removeClass('unvisible').addClass('visible');
        return;         // カンニングデータが無いなら以降を実行しない
    }

    // カンニングデータをHTMLに表示させる
    $('#neverCheatedArea').removeClass('visible').addClass('unvisible');
    var cheatDataArea = document.getElementById("cheatDataArea");
    var tmpContent = '';
    for(var i = detailCheatDataArray.length; i > 0; i--){
        tmpContent += '<tr>';
        tmpContent += '<th scope="row" class="text-end" style="color: rgb(110, 110, 176);">' + i + '</th>'; // インデックス番号
        tmpContent += '<td class="text-center">' + detailCheatDataArray[i - 1][0] + '</td>';                // 学籍番号
        tmpContent += '<td class="text-center">' + detailCheatDataArray[i - 1][1] + '</td>';                // 氏名
        tmpContent += '<td class="text-center">' + detailCheatDataArray[i - 1][2] + '</td>';                // 学科
        tmpContent += '<td class="text-center">' + detailCheatDataArray[i - 1][3] + '</td>';                // 学年
        tmpContent += '<td class="text-center">' + detailCheatDataArray[i - 1][4] + '</td>';                // 日時
        tmpContent += '</tr>';
        tmpContent += '';
    }

    cheatDataArea.innerHTML = tmpContent;
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
            break;
        case 0:
            // 試験時間前(24時間以内)
            testStatusArea.innerHTML = '開始';
            $('#testStatusArea').removeClass('c-sub-pink').addClass('c-sub-blue');
            $('#countDownArea').removeClass('c-sub-pink').addClass('c-sub-blue');
            $('#testStatusDuring').removeClass('unvisible').addClass('visible');
            $('#testStatusBefore').removeClass('visible').addClass('unvisible');
            $('#testStatusAfter').removeClass('visible').addClass('unvisible');
            break;
        case 1:
            // 試験時間中
            testStatusArea.innerHTML = '終了';
            $('#testStatusArea').removeClass('c-sub-blue').addClass('c-sub-pink');
            $('#countDownArea').removeClass('c-sub-blue').addClass('c-sub-pink');
            $('#testStatusDuring').removeClass('unvisible').addClass('visible');
            $('#testStatusBefore').removeClass('visible').addClass('unvisible');
            $('#testStatusAfter').removeClass('visible').addClass('unvisible');
            break;
        case 2:
            // 試験時間後
            $('#testStatusDuring').removeClass('visible').addClass('unvisible');
            $('#testStatusBefore').removeClass('visible').addClass('unvisible');
            $('#testStatusAfter').removeClass('unvisible').addClass('visible');
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