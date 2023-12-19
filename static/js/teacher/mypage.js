// firebaseで使うやつ
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";
import { getDatabase, ref, set, get, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";  //追加
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

import { queryDivider, generateUuid } from '../set.js';

var uidValue;   //教師のuidを格納
var subjUidArray = [];   //自分が担当する教科のuidを格納する配列

// 起動時に実行
window.addEventListener('load', function(){
    // クエリからuidを取得
    uidValue = queryDivider()[0];
    console.log("get uid: " + uidValue);

})

// 自分の担当の教科のsubjUidを配列に格納する関数
window.addEventListener('load', async function(){
    const subjRef = ref(database, 'subjects/');
    var subjSnapshot = await get(subjRef);
    var subjData = subjSnapshot.val();
    Object.keys(subjData).forEach((element, index, key, snapshot) => {  // 自分の担当教科を探し出す
        let manaIdFromDB = subjData[element].mainData.managerId;

        if(manaIdFromDB == uidValue){   //一致したら(自分の教科だったら)
            var subjUid = subjData[element].mainData.subjectId; //教科のuid
            subjUidArray.push(subjUid);
        }
    });
    console.log(subjUidArray);
    showTest();
})

// 配列内の各教科に対して、すべてのテストを確認、日付に応じてボタンを作成
async function showTest(){
    var testsListToday = document.getElementById('testsAreaToday');   //「今日のテスト」表示エリア(親クラス)
    var testsListLater = document.getElementById('testsAreaLater');  //「今後のテスト」表示エリア(親クラス)
    for(var subjUid of subjUidArray){
        // 教科名、テスト名、日時、参加人数を取得
        console.log('reading:' + subjUid);
        var subjRef = ref(database, 'subjects/' + subjUid + '/');
        var subjSnapshot = await get(subjRef);
        var subjData = subjSnapshot.val();
        console.log(subjData);
        var subjName = subjData.mainData.subjectName;    //教科名
        // console.log(subjName);
        var numOfParticipants = Object.keys(subjData.participants).length;//参加人数を取得
        console.log(numOfParticipants);
        var testRef = ref(database, 'subjects/' + subjUid + '/tests/');
        var testSnapshot = await get(testRef);
        var testData = testSnapshot.val();
        // console.log(testData);

        if(testData != null){
            Object.keys(testData).forEach((element, index, key, snapshot) => {
                // テスト名、日時を取得
                var testName = testData[element].mainData.testName;
                var testDate = testData[element].mainData.testDate;
                // var testLimit = testData[element].mainData.testLimit;
                var testUid = testData[element].mainData.testId;

                // htmlにボタンを追加
                // 日付に応じて今日のテスト、今後のテストに分ける
                var testDateArray = testDate.split(/-|T/);   //テスト時間を年、月、日、時にわける
                var testYear = testDateArray[0];    //年
                var testMonth = testDateArray[1];   //月
                var testDay = testDateArray[2];     //日
                var testOc = testDateArray[3];
                var testUnixTime = new Date(testDate).getTime()/1000//テスト開始時間のunixTime
                var nowUnixTime = Date.now();     //現在時間(unix time)
                var now = new Date(nowUnixTime);    //Dateオブジェクトに変換
                var nowYear = now.getFullYear();    //現在年
                var nowMonth = now.getMonth() + 1;      //現在月
                var nowDay = now.getDate();     //現在日
                var todayUnixTime = new Date(nowYear, nowMonth -1, nowDay).getTime()/1000; //今日00:00のunixTime
                var tomorrowUnixTime = todayUnixTime + 86400;    //明日の00:00のUnixTime(1日のunixTime=86400)
                console.log('現在' + nowYear + '年' + nowMonth + '月' + nowDay + '日');
                console.log('テスト' + testYear + '年' + testMonth + '月' + testDay + '日');

                var test = document.createElement('div');
                test.innerHTML ='<div onclick="viewTest(\''+ subjUid + '\', \'' + testUid + '\')" type="button" data-bs-toggle="modal"' +
                                    'data-bs-target="#testViewModal"' +
                                    'class="shadow br-10 mt-2 mx-lg-5 mx-3 px-3 py-3 f-Zen-Kaku-Gothic-New be-big-sm"' +
                                    'style="border: 2px solid rgb(124, 154, 95);">' +
                                    '<div class="row row-cols-auto">' +
                                        '<div class="col fw-bold br-20 px-3 ms-2 text-white"' +
                                            'style="background-color: rgb(124, 154, 95); font-size: 20px;">' + 
                                            subjName + 
                                        '</div>' +
                                        '<div class="col fw-exbold c-black" style="font-size: 20px">' + 
                                            testName +
                                        '</div>' +
                                    '</div>' +
                                    '<div class="my-2" style="border-bottom: 1px solid rgb(180, 180, 180);"></div>' +
                                        '<div class="row row-cols-auto mt-1 justify-content-end">' +
                                            '<div class="col f-Zen-Maru-Gothic br-20 px-3 ms-2 text-white"' +
                                                'style="background-color: rgb(89, 121, 60); font-size: 15px;">' +
                                                testYear + '年' + testMonth + '月' + testDay + '日' + testOc +
                                            '</div>' +
                                            '<div class="col f-Zen-Maru-Gothic fw-medium c-black text-secondary" style="font-size: 15px">' +
                                                '受験予定者' + numOfParticipants + '人' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>';

                // テスト当日なら「今日のテスト」欄にする
                if(testYear == nowYear && testMonth == nowMonth && testDay == nowDay){
                    testsListToday.appendChild(test);
                }else if(testUnixTime >= tomorrowUnixTime){     //明日の00:00のunixtimeより大きかったら今後のテスト
                    testsListLater.appendChild(test);
                }
                console.log(typeof(subjUid));
                console.log(typeof(testUid));
            });
        }
    }

}

// テストのボタンを押したときに実行
async function viewTest(subjUid, testUid){    //引数は(教科のuid, テストのuid)
    // テストの各情報を取得(科目名、テスト名、日時、試験時間、テストの備考)、作成者、作成日時
    const subjRef = ref(database, 'subjects/' + subjUid + '/');
    var subjSnapshot = await get(subjRef);
    var subjData = subjSnapshot.val();
    var subjName = subjData.mainData.subjectName;   //科目名
    const testRef = ref(database, 'subjects/' + subjUid + '/tests/' + testUid + '/');
    var testSnapshot = await get(testRef);
    var testData = testSnapshot.val();
    var testName = testData.mainData.testName;  //テスト名
    var testDate = testData.mainData.testDate;  //実施日時
    var testDateArray = testDate.split(/-|T/);   //テスト時間を年、月、日、時にわける
    var testYear = testDateArray[0];    //年
    var testMonth = testDateArray[1];   //月
    var testDay = testDateArray[2];     //日
    var testOc = testDateArray[3];      //時刻
    var testLimit = testData.mainData.testLimit;    //試験時間
    var testMemo = testData.mainData.testMemo;  //備考
    var testMakeDate = testData.baseData.makeDate;  //作成日時(unixTime)
    var makeDateDate = new Date(testMakeDate);
    var makeYear = makeDateDate.getFullYear();    //作成年
    var makeMonth = makeDateDate.getMonth() + 1;   //作成月
    var makeDay = makeDateDate.getDate();     //作成日
    // var makeOc = ;      //作成時
    const teaRef = ref(database, 'users/teachers/' + uidValue + '/mainData/');
    var teaSnapshot = await get(teaRef);
    var teaData = teaSnapshot.val();
    var teaName =  teaData.studentName; //作成者の名前
    var teaNum = teaData.studentNum;    //作成者の学籍番号
    console.log(testLimit);
    var particiNum = Object.keys(subjData.participants).length   //履修者数を取得
    // モーダルを作成
    var testModal = document.getElementById('testViewModal');
    testModal.innerHTML =  '<div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">' +
                                    '<div class="modal-content br-20">' +
                                        '<div class="modal-header">' +
                                            '<h1 class=" modal-title fs-5 f-Zen-Kaku-Gothic-New fw-exbold" id="testViewModalLabel"' +
                                                'style="color: rgb(62, 62, 136);">' +
                                                '<i class="fa-solid fa-file-lines"></i>' +
                                                'テスト内容の確認' +
                                            '</h1>' +
                                            '<div class="d-grid col-4 mx-auto f-Zen-Kaku-Gothic-New">' +
                                                '<button type="button" class="btn btn-outline-danger br-30 fw-exbold"  data-bs-toggle="modal" data-bs-target="#testEditModal">' +
                                                    '編集する' +
                                                '</button>' +
                                            '</div>' +
                                            '<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>' +
                                        '</div>' +
                                        '<div class="modal-body f-Zen-Kaku-Gothic-New">' +

                                            '<div class="px-3">' +

                                                '<div class="f-Zen-Kaku-Gothic-New fw-bold c-black" style="font-size: 21px;">' +
                                                    '<i class="fa-solid fa-hashtag"></i>' +
                                                    '基本情報' +
                                                '</div>' +

                                                '<table class="table table-hover table-striped">' +
                                                    '<thead>' +
                                                        '<tr>' +
                                                            '<th scope="col" class="text-end fw-exbold text-secondary">見出し</th>' +
                                                            '<th scope="col" class="fw-exbold text-secondary">内容</th>' +
                                                        '</tr>' +
                                                    '</thead>' +
                                                    '<tbody class="table-group-divider">' +
                                                        '<tr>' +
                                                            '<th scope="row" class="text-end" style="color: rgb(110, 110, 176);">科目</th>' +
                                                            '<td>' + subjName + '</td>' +
                                                        '</tr>' +
                                                        '<tr>' +
                                                            '<th scope="row" class="text-end" style="color: rgb(110, 110, 176);">タイトル</th>' +
                                                            '<td>' + testName + '</td>' +
                                                        '</tr>' +
                                                        '<tr>' +
                                                            '<th scope="row" class="text-end" style="color: rgb(110, 110, 176);">実施日時</th>' +
                                                            '<td>' + testYear + '年' + testMonth + '月' + testDay + '日' + testOc +'</td>' +
                                                        '</tr>' +
                                                        '<tr>' +
                                                            '<th scope="row" class="text-end" style="color: rgb(110, 110, 176);">試験時間</th>' +
                                                            '<td>' + testLimit + '分間</td>' +
                                                        '</tr>' +
                                                    '</tbody>' +
                                                '</table>' +

                                                '<div class="mt-1">' +
                                                    '<div class="f-Zen-Kaku-Gothic-New fw-bold text-secondary">' +
                                                        'テストの備考' +
                                                    '</div>' +
                                                    '<div class="mt-1 bg-success-subtle px-2 py-1 br-10">' +
                                                        '<div class="f-Zen-Kaku-Gothic-New c-black">' +
                                                            testMemo +
                                                        '</div>' +
                                                    '</div>' +
                                                '</div>' +

                                                '<div class="mt-4 f-Zen-Kaku-Gothic-New fw-bold c-black" style="font-size: 21px;">' +
                                                    '<i class="fa-solid fa-hashtag"></i>' +
                                                    '補助情報' +
                                                '</div>' +

                                                '<table class="table table-hover table-striped">' +
                                                    '<thead>' +
                                                        '<tr>' +
                                                            '<th scope="col" class="text-end fw-exbold text-secondary">見出し</th>' +
                                                            '<th scope="col" class="fw-exbold text-secondary">内容</th>' +
                                                        '</tr>' +
                                                    '</thead>' +
                                                    '<tbody class="table-group-divider">' +
                                                        '<tr>' +
                                                            '<th scope="row" class="text-end" style="color: rgb(110, 110, 176);">作成者</th>' +
                                                            '<td>' + teaNum + '・' + teaName + '</td>' +
                                                        '</tr>' +
                                                        '<tr>' +
                                                            '<th scope="row" class="text-end" style="color: rgb(110, 110, 176);">作成日時</th>' +
                                                            '<td>' + makeYear + '年' + makeMonth + '月' + makeDay + '日' + '</td>' +
                                                        '</tr>' +
                                                    '</tbody>' +
                                                '</table>' +

                                                '<div class="mt-3 f-Zen-Kaku-Gothic-New fw-bold c-black" style="font-size: 21px;">' +
                                                    '<i class="fa-solid fa-hashtag"></i>' +
                                                    '受験者情報<span class="text-secondary ms-1" style="font-size: 15px;">' + particiNum + '人</span>' +
                                                '</div>' +

                                                '<table class="table table-hover table-striped">' +
                                                    '<thead>' +
                                                        '<tr>' +
                                                            '<th scope="col" class="text-end fw-exbold" style="color: rgb(110, 110, 176);">#</th>' +
                                                            '<th scope="col" class="fw-exbold text-secondary text-center">学籍番号</th>' +
                                                            '<th scope="col" class="fw-exbold text-secondary text-center">氏名</th>' +
                                                            '<th scope="col" class="fw-exbold text-secondary text-center">学科</th>' +
                                                            '<th scope="col" class="fw-exbold text-secondary text-center">学年</th>' +
                                                        '</tr>' +
                                                    '</thead>' +
                                                    '<tbody class="table-group-divider" id="participants">' +
                                                    '</tbody>' +
                                                '</table>' +

                                            '</div>' +

                                        '</div>' +
                                        '<div class="modal-footer f-Zen-Maru-Gothic">' +
                                            '<div class="mt-1 mb-2 d-grid gap-2 col-10 mx-auto">' +
                                                '<button onclick="supervise(\'' + subjUid + '\', \'' + testUid + '\')" class="btn btn-primary btn-lg br-30 f-Zen-Kaku-Gothic-New fw-exbold" type="button">' +
                                                    '監督画面へ進む' +
                                                '</button>' +
                                            '</div>' +
                                            '<div class="d-grid col-4 mx-auto">' +
                                                '<button type="button" class="btn btn-secondary br-30" data-bs-dismiss="modal">' +
                                                    '閉じる' +
                                                '</button>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' + 
                                '</div>' +
                            '</div>';

    

    // 参加者一覧を作成(id = participants)
    var stuRef = ref(database, 'users/students/');
    var stuSnapshot = await get(stuRef);
    var data = stuSnapshot.val();
    var stuNumFromDB;
    var stuNameFromDB;
    var stuDepFromDB;
    var stuGradeFromDB;
    var particiArea = document.getElementById('participants');  //表示エリア(親クラス)
    var particiRef = ref(database, 'subjects/' + subjUid + '/participants/');
    var particiSnapshot = await get(particiRef);
    var particiData = particiSnapshot.val();
    Object.keys(particiData).forEach((element, index, key, snapshot) => {      //各履修者に対して、subjRef.participants
        var uid = particiData[element].uid;    // 生徒のuidを取得
        // console.log(uid);
        stuNumFromDB = data[uid].mainData.studentNum;
        console.log(stuNumFromDB);
        stuNameFromDB = data[uid].mainData.studentName;
        stuDepFromDB = data[uid].mainData.belonging.dep;
        stuGradeFromDB = data[uid].mainData.belonging.grade;
        // 取得した属性を表示
        var participant = document.createElement('tr');    //子クラス
        participant.innerHTML = '<th scope="row" class="text-end" style="color: rgb(110, 110, 176);">' + (index + 1) + '</th>' +
                                '<td class="text-center">' + stuNumFromDB + '</td>' +
                                '<td class="text-center">' + stuNameFromDB + '</td>' +
                                '<td class="text-center">' + stuDepFromDB + '</td>' +
                                '<td class="text-center">' + stuGradeFromDB + '</td>';
        particiArea.appendChild(participant);

    });

    //　テストの編集モーダルを作成
    // var testEditModalArea = document.getElementById('testEditModal');   //表示エリア(親クラス)
    
    // テストの名前、実施時間、試験時間、備考をDBから抽出(testName, testDate, testLimit, testMemo)

    // テストの名前
    var testEditModalName = document.getElementById('edittingTestNameInput');
    testEditModalName.value = testName;

    // テストの実施日時
    var testEditModalDate = document.getElementById('edittingTestDateInput');
    testEditModalDate.value = testDate;

    // テストの制限時間
    var testEditModalLimit = document.getElementById('edittingTestLimitInput');
    testEditModalLimit.value = testLimit;

    // テストの備考
    var testEditModalMemo = document.getElementById('edittingTestMemoInput');
    testEditModalMemo.value = testMemo;

    // 削除ボタンの作成
    var removeButton = document.getElementById('removeButton');
    removeButton.innerHTML ='<button onclick="removeTest(\'' + subjUid + '\',\'' + testUid + '\')" class="btn btn-outline-danger btn-lg br-30 f-Zen-Kaku-Gothic-New fw-exbold" type="button">' +
                                'テストを削除する' +
                            '</button>';
    
    // 更新ボタンの作成
    var updateButton = document.getElementById('updateButton');
    updateButton.innerHTML = '<button onclick="updateTest(\'' + subjUid + '\',\'' + testUid + '\')" class="btn btn-outline-primary btn-lg br-30 f-Zen-Kaku-Gothic-New fw-exbold" type="button">' +
                                    '更新する' +
                              '</button>';

}

// テストの詳細モーダル→編集モーダル→「削除する」ボタンを押したときに実行
function removeTest(subjUid, testUid){           //引数：テストのuid
    var testRef = ref(database, 'subjects/' + subjUid + '/tests/' + testUid + '/');
    remove(testRef);
    window.location.href = './mypage.html?id=' +uidValue;
}

// テストの詳細モーダル→編集モーダル→「更新する」ボタンを押したときに実行
async function updateTest(subjUid,testUid){   //引数：教科のuid
    // テキストボックスから各情報を取得(テストの名前、実施予定日、制限時間、メモ)
    var testNameInput = document.getElementById('edittingTestNameInput').value;   //テストの名前
    console.log(testNameInput);
    var testDateInput = document.getElementById('edittingTestDateInput').value;   //実施日時
    var testLimitInput = document.getElementById('edittingTestLimitInput').value;  //制限時間
    var testMemoInput = document.getElementById('edittingTestMemoInput').value;   //メモ

    // DBの情報を上書き
    const testRef = ref(database, 'subjects/' + subjUid + '/tests/' + testUid + '/mainData');
    await update(testRef, {
        testName : testNameInput,
        testDate : testDateInput,
        testLimit : testLimitInput,
        testMemo : testMemoInput
    });
    // console.log('成功しました');

    // // ページ遷移
    window.location.href = './mypage.html?id=' + uidValue;
}

// テストの詳細モーダル内の「監督画面へ進む」ボタンを押したときに実行
function supervise(subjId, testId){

    // ページ遷移
    window.location.href = './supervisor.html?sId=' + subjId + '&tId=' + testId + '&uId=' + uidValue;
    
}

//ホームボタンを押したとき実行
function moveToHome(){
    window.location.href = './mypage.html?id=' + uidValue;
}

//テストボタンを押したとき実行
function moveToTest(){
    window.location.href = './tests.html?id=' + uidValue;  
}

//プロフィールボタンを押したとき実行
function moveToProf(){
    window.location.href = './profile.html?uid=' + uidValue;
}

//設定ボタンを押したとき実行
function moveToSet(){
    window.location.href = './setting.html?id=' + uidValue;
}

//ログアウトボタンを押したときに実行
function logout(){
    window.location.href = './login.html';
}

window.viewTest = viewTest;
window.removeTest = removeTest;
window.updateTest = updateTest;
window.supervise = supervise;
window.moveToHome = moveToHome;
window.moveToTest = moveToTest;
window.moveToProf = moveToProf;
window.moveToSet = moveToSet;
window.logout = logout;
export{ viewTest, removeTest, updateTest, supervise, moveToHome, moveToTest, moveToProf, moveToSet, logout }