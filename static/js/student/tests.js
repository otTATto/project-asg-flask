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

// テストの詳細モーダル内の「試験画面へ進む」ボタンを押したときに実行
import { queryDivider, generateUuid } from '../set.js';
import { getTeacherName, getTeacherNum } from '../get.js';
import { convertUnixToISO8601 } from '../time.js'

var uidValue;   //自分(生徒)のuidを格納
var subjUidValue;
var subjTaken = [];
var todayTestBlockArea = document.getElementById("todayTestBlockArea");
var futureTestBlockArea = document.getElementById("futureTestBlockArea");
var todayTestBlockArea = document.getElementById("todayTestBlockArea");

// 起動時に実行
window.addEventListener('load', function(){
    // クエリからuidを取得
    uidValue = queryDivider()[0];
    console.log("get uid: " + uidValue);

})

//自分が履修している科目をプルダウンに表示する関数
async function showSubj(){
    console.log("subjTaken");
    console.log(subjTaken);

    for(var i = 0; i < subjTaken.length; i++){
        var element = subjTaken[i];

        console.log("element: " + element);

        var subjectsList1 = document.getElementById('subjChoose');   //科目選択の表示エリア(親クラス)
        var subject = document.createElement('option');
        
        //sujUidValueをsubjTakeの配列の中身にしたい。つまりidentyfyUidで一致した科目uid
        var subjNameRef = ref(database, 'subjects/' + element + '/mainData/');
        var snapshot = await get(subjNameRef);
        var data = snapshot.val();
        //教科の名前を取得
        var subjNameFromDb = data.subjectName;
        console.log("subjNameFromDb: " + subjNameFromDb);
        subject.text = subjNameFromDb;
        subject.value = element; //subjectの中身をsubUidをいれている。
        console.log("subject.value");
        console.log(subject.value);

        subject.text = subjNameFromDb; //subjectの表示テキストにsubjNameを入れている。
        subjectsList1.appendChild(subject); 
    }
}

// 起動時に自分の担当している教科を「科目選択」のプルダウンに追加→テスト追加の科目名にも適用, プルダウンのvalueは教科のuid

//科目のuidを引数を受け取りその科目を自分が履修しているかを確認し
//履修している科目をsujTaken内に格納する。
async function identifyUid(subjUidValue){
    
    var subjectsList1 = document.getElementById('subjChoose');   //科目選択の表示エリア(親クラス)
    
    const stuUidRef = ref(database, 'subjects/'+ subjUidValue + '/participants/');
    var stuUidSnapshot = await get(stuUidRef);
    var stuUidData = stuUidSnapshot.val();
    
    
    Object.keys(stuUidData).forEach( key => {
        let subParUid = stuUidData[key].uid;

        if(subParUid == uidValue) {
        subjTaken.push(subjUidValue);  
        }  
    })    
}

//プルダウンにより選択された科目のテストを表示する関数
window.addEventListener('load', async function(){
    const subjRef = ref(database, 'subjects/');
    var subjSnapshot = await get(subjRef);
    var subjData = subjSnapshot.val();

    // 非同期関数を使うためのfor...ofループ
    for (const element of Object.keys(subjData)) {
        subjUidValue = subjData[element].mainData.subjectId;
        console.log("subjUidValue: " + subjUidValue);

        // 非同期処理を待ってidentifyUidを実行
        await identifyUid(subjUidValue);
    }
    // forEachが完了した後にshowSubjを実行
    showSubj();
});

var subjSelect = document.getElementById('subjChoose');
var todayTestArea = document.getElementById("todayTestArea");

//履修をしている人数を数えてリターンで返す関数
async function getParticipantsNum(subjectUid){
    const participantsRef = ref(database, 'subjects/' + subjectUid + '/participants/');
    var snapshot = await get(participantsRef);
    var data = snapshot.val();
    var participantsNum = Object.keys(data).length;
    return participantsNum;
}


subjSelect.addEventListener('change', async function () {
    // 選択された科目の値を取得
    var selectedSubject = subjSelect.value;

    // 本日のテストエリア、過去のテストエリア、今後のテストエリアの要素をクリア
    todayTestBlockArea.innerHTML = '';
    pastTestBlockArea.innerHTML = ''; // 過去のテストエリアをクリア
    futureTestBlockArea.innerHTML = ''; // 今後のテストエリアをクリア

    // 選択された科目の値を使用してデータを取得してtests配列に追加
    var tests = await fetchTestsData(selectedSubject);
    console.log("ああああああああ"+tests);
    // 現在の日付を取得
    var currentDate = new Date();


    // 取得したテストデータに基づいて要素を生成して本日のテストエリア、過去のテストエリア、今後のテストエリアに追加
    tests.forEach(test => {
        var newTestElement = document.createElement("div");
        newTestElement.setAttribute("type", "button");
        newTestElement.setAttribute("data-bs-toggle", "modal");
        newTestElement.setAttribute("data-bs-target", "#testViewModal");
        newTestElement.setAttribute("onclick", "editModal('" + test.subject + "', '" + test.title + "' ,'" + test.date +"' ,'" + test.testLimit + "' , '" + test.testMemo + "', '" + test.managerId + "', '" + test.makeDate + "', '" + test.testUid + "', '" + test.subjId + "')");
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
                    受験予定者 ${test.examinees} 人
                </div>
            </div>
        `;



        // 日付比較を行い、本日、過去、今後のテストエリアに追加
        var testDate = new Date(test.date);
        console.log(testDate);
        var testYear = testDate.getFullYear();
        var testMonth = testDate.getMonth() + 1;
        var testDay = testDate.getDate();


        var currentYear = currentDate.getFullYear();
        var currentMonth = currentDate.getMonth() + 1; // 月は0から11で表されるため、+1して実際の月に変換
        var currentDay = currentDate.getDate();
        console.log(testDay);
        console.log(currentDay);

        if (testYear == currentYear && testMonth == currentMonth &&  testDay == currentDay) {
            // 本日のテストエリアに追加
            todayTestBlockArea.appendChild(newTestElement);
        } else if ( testYear > currentYear) {
            futureTestBlockArea.appendChild(newTestElement);
        } else if( testMonth > currentMonth ) {
            futureTestBlockArea.appendChild(newTestElement);
        } else if( testDay > currentDay ) {
            futureTestBlockArea.appendChild(newTestElement);
        } else {
            pastTestBlockArea.appendChild(newTestElement);
        }
        ;
    });
});

// テスト詳細モーダルの内容を変更する関数
async function editModal(subjectNameInput,titelInModal,dateInModal,limitInModal,memoInModal,managerInModal,makeDateInModal,testIdInput, subjectIdInput ){
    console.log("[ GET ]makeDateInModal: " + makeDateInModal);
    console.log("managerInModal: " + managerInModal);
    document.getElementById("subjectNameInModal").innerHTML = subjectNameInput;
    document.getElementById("titelInModal").innerHTML = titelInModal;
    document.getElementById("dateInModal").innerHTML = formatDate(dateInModal);
    document.getElementById("limitInModal").innerHTML = limitInModal + '分間';
    document.getElementById("memoInModal").innerHTML = memoInModal;
    document.getElementById("managerInModal").innerHTML = await getTeacherNum(managerInModal) + '・' + await getTeacherName(managerInModal);
    document.getElementById("makeDateInModal").innerHTML = formatDate(convertUnixToISO8601(makeDateInModal));
    
    var tmp = "moveToExam('" + subjectIdInput + "', '" + testIdInput + "', '" + uidValue + "')";
    $("#moveToExamBtn").attr('onClick', tmp);

}


// 日付を指定されたフォーマットに変換する関数
function formatDate(inputDate) {
    var date = new Date(inputDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute = date.getMinutes().toString().padStart(2, "0");;
    
    // 月と日が1桁の場合は0埋めする
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

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
    var managerId = subjData1.mainData.managerId;
    var subjId = subjData1.mainData.subjectId;
    if (subjData) {
        // Firebaseから取得したデータをtests配列に変換
        Object.keys(subjData).forEach(element => {
             var testDate = subjData[element].mainData.testDate;
            // var formattedTestDate = formatTime(testDate);
            const testInfo = {
                subject: subbject,
                title: subjData[element].mainData.testName,
                date: testDate,
                examinees: sumstu,
                testUid: subjData[element].mainData.testId,
                testLimit:subjData[element].mainData.testLimit,
                testMemo:subjData[element].mainData.testMemo,
                managerId:managerId,
                subjId: subjId,
                makeDate: subjData[element].baseData.makeDate
            };

            tests.push(testInfo);
        });
    } else {
        console.log("subjData is null or undefined");
    }

    return tests;
}





function moveToExam(subjectIdInput, testIdInput, userIdInput){

    // ページ遷移
    window.location.href = './exam.html?sId=' + subjectIdInput + '&tId=' + testIdInput + '&uId=' + userIdInput;
    
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
    window.location.href = './mypageS.html?id=' + uidValue;
}

//テストボタンを押したとき実行
function moveToTest(){
    window.location.href = './tests.html?id=' + uidValue;  
}

//プロフィールボタンを押したとき実行
function moveToProf(){
    window.location.href = './profileS.html?uid=' + uidValue;
}

//設定ボタンを押したとき実行
function moveToSet(){
    window.location.href = './settingS.html?id=' + uidValue;
}

//ログアウトボタンを押したときに実行
function logout(){
    window.location.href = './loginS.html';
}
// 関数のエクスポート
window.viewTodayTestArea = viewTodayTestArea;
window.viewFutureTestArea = viewFutureTestArea;
window.viewPastTestArea = viewPastTestArea;
window.moveToExam = moveToExam;
window.moveToHome = moveToHome;
window.moveToTest = moveToTest;
window.moveToProf = moveToProf;
window.moveToSet = moveToSet;
window.logout = logout;
window.editModal = editModal;

export{ viewTodayTestArea, viewFutureTestArea, viewPastTestArea, moveToExam,moveToHome, moveToTest, moveToProf, moveToSet, logout, editModal }