// firebaseで使うやつ
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";
import { getDatabase, ref, set, get, onValue, update } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";  //追加
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

var uidValue;   //自分(教師)のuidを格納
var subjectsList = document.getElementById('subjChoose');   //科目選択のプルダウン、表示エリア(親クラス)
var todayTestsArea = document.getElementById('todayTestArea');  //今日のテストの表示エリア
var futureTestsArea = document.getElementById('futureTestArea');    //今後のテストの表示エリア
var pastTestsArea = document.getElementById('pastTestArea');    //過去のテストの表示エリア
var subjectsListForAdd= document.getElementById('subjTest');    //テスト追加の科目選択のプルダウン、表示エリア(親クラス2)

// 起動時に実行
window.addEventListener('load', function(){
    // クエリからuidを取得
    uidValue = queryDivider()[0];
    console.log("get uid: " + uidValue);

})

// 起動時に自分の担当している教科を「科目選択」のプルダウンに追加→テスト追加の科目名にも適用, プルダウンのvalueは教科のuid
window.addEventListener('load', async function(){
    // DB.subjectsからmanagerIdが自分になっている教科を探し出す(全探索)
    
    const subjRef = ref(database, 'subjects/');
    var subjSnapshot = await get(subjRef);
    var subjData = subjSnapshot.val();
    Object.keys(subjData).forEach((element, index, key, snapshot) => {
        let manaIdFromDB = subjData[element].mainData.managerId;

        if(manaIdFromDB == uidValue){   // もし自分の担当教科だったらvalue=uid, text=教科名 でプルダウンを作成(innerHTML,appendChild)
            var subjName = subjData[element].mainData.subjectName;  //教科の名前を取得
            var subjUid = subjData[element].mainData.subjectId; //教科のuidを取得(もしかしたらelementだけでいい？)
            var subject = document.createElement('option');   //子クラス
            console.log('ヒットしました:' + subjName);
            // subject.innerHTML = '<option value="' + subjUid + '">' + subjName + '</option>';
            subject.value = subjUid;
            subject.text = subjName;
            var subject2 = document.createElement('option');
            subject2.value = subjUid;
            subject2.text = subjName;
            subjectsList.appendChild(subject);   //エリアに追加
            subjectsListForAdd.appendChild(subject2);
        }
    });

    
})

// 科目検索のプルダウンを選択したときにその科目のテストを表示する
subjectsList.addEventListener('change', async function(){
    // 選択された科目のuidを取得
    var selectedSubjUid = subjectsList.value;
    // テストエリアをクリアにする
    todayTestsArea.innerHTML = `<div class="mt-3">
                                    <div class="row justify-content-center row-cols-auto f-Zen-Kaku-Gothic-New">
                                        <div class="col">
                                            <div class="fw-exbold c-pink tb-pink">
                                                本日のテスト
                                            </div>
                                        </div>
                                        <div class="col">
                                            <div onclick="viewFutureTestArea()" type="button" class="fw-medium text-secondary be-big-lg">
                                                今後のテスト
                                            </div>
                                        </div>
                                        <div class="col">
                                            <div onclick="viewPastTestArea()" type="button" class="fw-medium text-secondary be-big-lg">
                                                過去のテスト
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="mt-4"></div>`;
    futureTestsArea.innerHTML = `<div class="mt-3">
                                    <div class="row justify-content-center row-cols-auto f-Zen-Kaku-Gothic-New">
                                        <div class="col">
                                            <div onclick="viewTodayTestArea()" type="button" class="fw-medium text-secondary be-big-lg">
                                                本日のテスト
                                            </div>
                                            
                                        </div>
                                        <div class="col">
                                            <div class="fw-exbold c-pink tb-pink">
                                                今後のテスト
                                            </div>
                                        </div>
                                        <div class="col">
                                            <div onclick="viewPastTestArea()" type="button" class="fw-medium text-secondary be-big-lg">
                                                過去のテスト
                                            </div>
                                        </div>
                                    </div> 
                                </div>

                                <div class="mt-4"></div>`;
    pastTestsArea.innerHTML = `<div class="mt-3">
                                    <div class="row justify-content-center row-cols-auto f-Zen-Kaku-Gothic-New">
                                        <div class="col">
                                            <div onclick="viewTodayTestArea()" type="button" class="fw-medium text-secondary be-big-lg">
                                                本日のテスト
                                            </div>
                                        </div>
                                        <div class="col">
                                            <div onclick="viewFutureTestArea()" type="button" class="fw-medium text-secondary be-big-lg">
                                                今後のテスト
                                            </div>
                                        </div>
                                        <div class="col">
                                            <div class="fw-exbold c-pink tb-pink">
                                                過去のテスト
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="mt-4"></div>`;
    

    // 選択された科目の各テストの情報を取得(fetchTestData)
    var tests = await fetchTestsData(selectedSubjUid);
    // 取得したデータをもとにボタンを追加
    tests.forEach(test => {
        var newTestElement = document.createElement("div");
        newTestElement.setAttribute("onclick", "viewTest(\'" + selectedSubjUid + "\',\'" + test.uid  + "\')")
        newTestElement.setAttribute("type", "button");
        newTestElement.setAttribute("data-bs-toggle", "modal");
        newTestElement.setAttribute("data-bs-target", "#testViewModal");
        newTestElement.classList.add("shadow", "br-10", "mt-2", "mx-lg-5", "mx-3", "px-3", "py-3", "f-Zen-Kaku-Gothic-New", "be-big-sm");
        newTestElement.style.border = "2px solid rgb(124, 154, 95)";

        newTestElement.innerHTML = `
            <div class="row row-cols-auto">
                <div class="col fw-bold br-20 px-3 ms-2 text-white" style="background-color: rgb(124, 154, 95); font-size: 20px;">
                    ${test.subject}
                </div>
                <div class="col fw-exbold c-black" style="font-size: 20px">
                    ${test.title}
                </div>
            </div>
            <div class="my-2" style="border-bottom: 1px solid rgb(180, 180, 180);"></div>
            <div class="row row-cols-auto mt-1 justify-content-end">
                <div class="col f-Zen-Maru-Gothic br-20 px-3 ms-2 text-white" style="background-color: rgb(89, 121, 60); font-size: 15px;">
                    ${formatDate(test.date)}
                </div>
                <div class="col f-Zen-Maru-Gothic fw-medium c-black text-secondary" style="font-size: 15px">
                    ${test.examinees}
                </div>
            </div>
        `;

    // テストの日時に応じてエリアを振り分ける
    var testUnixTime = new Date(test.date).getTime()/1000//テスト開始時間のunixTime
    var nowUnixTime = Date.now();     //現在時間(unix time)
    var now = new Date(nowUnixTime);    //Dateオブジェクトに変換
    var nowYear = now.getFullYear();    //現在年
    var nowMonth = now.getMonth() + 1;      //現在月
    var nowDay = now.getDate();     //現在日
    var todayUnixTime = new Date(nowYear, nowMonth -1, nowDay).getTime()/1000; //今日00:00のunixTime
    var tomorrowUnixTime = todayUnixTime + 86400;    //明日の00:00のUnixTime(1日のunixTime=86400)
    // console.log('現在' + nowYear + '年' + nowMonth + '月' + nowDay + '日');
    // console.log('テスト' + testYear + '年' + testMonth + '月' + testDay + '日');

    if(testUnixTime >= todayUnixTime && testUnixTime < tomorrowUnixTime){   //テストが今日だったら
        todayTestsArea.appendChild(newTestElement);
    } else if(testUnixTime >= tomorrowUnixTime){   //テストが明日以降だったら
        futureTestsArea.appendChild(newTestElement);
    } else{ //テストが昨日以前だったら
        pastTestsArea.appendChild(newTestElement);
    }

    });

})

// 日付を指定されたフォーマットに変換する関数
function formatDate(inputDate) {
    var date = new Date(inputDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute  =date.getMinutes();
    
    // 月と日が1桁の場合は0埋めする
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    hour = hour < 10 ? '0' + hour : hour;
    minute = minute < 10 ? '0' + minute : minute;

    return year + '年' + month + '月' + day + '日 ' + hour + ":" + minute;
}

async function fetchTestsData(selectedSubject) {
    console.log("selectedSubject :" + selectedSubject)
    const subjRef = ref(database, 'subjects/' + selectedSubject + '/tests');
    const subjSnapshot = await get(subjRef);
    const subjData = subjSnapshot.val();
    console.log("subjData :" + subjData)
    const tests = [];

    const subjRef1 = ref(database, 'subjects/' + selectedSubject+'/');
    const subjSnapshot1 = await get(subjRef1);
    const subjData1 = subjSnapshot1.val();
    console.log("subjData1 :" + subjData1)
    
    // var subbject = subjData1.mainData.subjectName;
    // var sumstu  = numberOfParticipants;

    // パスを指定してデータを取得
    const subjRef3 = ref(database, 'subjects/' + selectedSubject + '/participants');
    const subjSnapshot3 = await get(subjRef3);
    const participantsData3 = subjSnapshot3.val(); 
    // オブジェクトのキー（参加者のID）の数を取得
    const numberOfParticipants = Object.keys(participantsData3).length;

    var subbject = subjData1.mainData.subjectName;
    var sumstu  = numberOfParticipants;
    if (subjData) { //テストが存在したら
        // Firebaseから取得したデータをtests配列に変換
        Object.keys(subjData).forEach(element => {
            const testInfo = {
                uid : subjData[element].mainData.testId,
                subject: subbject,
                title: subjData[element].mainData.testName,
                date: subjData[element].mainData.testDate,
                examinees: '受験予定者：'+ sumstu + '人'
            };

            tests.push(testInfo);
        });
    } else {
        console.log("subjData is null or undefined");
    }

    return tests;
}

// テストのボタンを押したときに実行、テストの詳細のモーダルを表示
async function viewTest(subjUid, testUid){    //引数は(教科のuid, テストのuid)
    // テストの各情報を取得(科目名、テスト名、日時、試験時間、テストの備考)、作成者、作成日時
    const subjRef = ref(database, 'subjects/' + subjUid + '/');
    var subjSnapshot = await get(subjRef);
    var subjData = subjSnapshot.val();
    var subjName = subjData.mainData.subjectName;   //科目名
    console.log(subjName);
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

    //教科名
    console.log(subjName);
    var testEditModalSubjName = document.getElementById('edittingSubjNameInput');
    testEditModalSubjName.value = subjName; 

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

// 新しくテストを作成する
async function makeTest(){
    // 科目名(教科のuid)、テストの名前、実施日時、試験時間、補助情報をテキストボックスから取得
    const subjectUid = document.getElementById('subjTest').value;  //教科のuid
    const testNameInput = document.getElementById('testNameInput').value; //テストの名前
    const testDateInput = document.getElementById('testDateInput').value; //テストの日時
    const testLimitInput = document.getElementById('testLimitInput').value;    //試験時間
    const testMemoInput = document.getElementById('testMemoInput').value;    //備考

    // テストのuidを作成
    const testUid = generateUuid();

    //テストの作成日時を生成
    const makeDate = Date.now();

    // DBに情報を格納
    const testRef1 = ref(database, 'subjects/' + subjectUid + '/tests/' + testUid + '/mainData/');  //第一引数：database(L24)(どのデータベースか), 第2：入れたい場所のパス, refはfirebaseから引っ張ってきた
    await set(testRef1, {      //第一引数：入れたい場所, 第2引数：入れたい内容   await: 非同期関数の中で使える、この関数が完了するまで先に進まない
      testName : testNameInput,
      testId : testUid,
      testDate : testDateInput,
      testLimit : testLimitInput,
      testMemo : testMemoInput
    });

    const testRef2 = ref(database, 'subjects/' + subjectUid + '/tests/' + testUid + '/baseData/');
    await set(testRef2,{
        makeDate : makeDate
    });

    window.location.href = './tests.html?id=' + uidValue;

}

// テストの詳細モーダル内の「監督画面へ進む」ボタンを押したときに実行
function supervise(subjId, testId){

    // ページ遷移
    window.location.href = './supervisor.html?sId=' + subjId + '&tId=' + testId + '&uId=' + uidValue;
    
}


// ナビにおける「本日のテスト」ボタンを押したときに実行
function viewTodayTestArea(){
    // 「本日のテスト」を表示・「今後のテスト」を非表示・「過去のテスト」を非表示
    $('#todayTestArea').removeClass('unvisible').addClass('visible');
    $('#futureTestArea').removeClass('visible').addClass('unvisible');
    $('#pastTestArea').removeClass('visible').addClass('unvisible');
}

// ナビにおける「今後のテスト」ボタンを押したときに実行
function viewFutureTestArea(){
    // 「本日のテスト」を非表示・「今後のテスト」を表示・「過去のテスト」を非表示
    $('#todayTestArea').removeClass('visible').addClass('unvisible');
    $('#futureTestArea').removeClass('unvisible').addClass('visible');
    $('#pastTestArea').removeClass('visible').addClass('unvisible');
}

// ナビにおける「過去のテスト」ボタンを押したときに実行
function viewPastTestArea(){
    // 「本日のテスト」を非表示・「今後のテスト」を非表示・「過去のテスト」を表示
    $('#todayTestArea').removeClass('visible').addClass('unvisible');
    $('#futureTestArea').removeClass('visible').addClass('unvisible');
    $('#pastTestArea').removeClass('unvisible').addClass('visible');
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


// 関数のエクスポート
window.viewTodayTestArea = viewTodayTestArea;
window.viewFutureTestArea = viewFutureTestArea;
window.viewPastTestArea = viewPastTestArea;
window.viewTest = viewTest;
window.removeTest = removeTest;
window.updateTest = updateTest;
window.makeTest = makeTest;
window.supervise = supervise;
window.moveToHome = moveToHome;
window.moveToTest = moveToTest;
window.moveToProf = moveToProf;
window.moveToSet = moveToSet;
window.logout = logout;
export{ viewTodayTestArea, viewFutureTestArea, viewPastTestArea, viewTest, removeTest, updateTest, makeTest, supervise, moveToHome, moveToTest, moveToProf, moveToSet, logout }