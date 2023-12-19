
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

//firebaseの機能を使用するために導入


import { queryDivider, generateUuid } from '../set.js';
import { getTeacherName, getTeacherNum } from '../get.js';
import { convertUnixToISO8601 } from '../time.js'

var uidValue;   //教師のuidを格納
var subjUidValue;
var subjTaken = [];
var todayTestBlockArea = document.getElementById("todayTestBlockArea");
var futureTestBlockArea = document.getElementById("futureTestBlockArea");
var tests =[];

// 起動時に実行
// 関数内で await を使用するために async を追加
window.addEventListener('load', async function(){

    // とりあえず読込中表示
    var loadingContent = '';
    loadingContent += '<div class="text-center c-sub-blue">';
    loadingContent += '<div class="spinner-border" role="status"></div>';
    loadingContent += '</div>';
    loadingContent += '';
    todayTestBlockArea.innerHTML = loadingContent;
    futureTestBlockArea.innerHTML = loadingContent;

    // クエリからuidを取得
    uidValue = queryDivider()[0];

    // この学生が履修している科目を配列「subjTaken」に格納
    await getSubjTaken();

    // テスト情報を取得
    for(var subject of subjTaken){
        await fetchTestsData(subject);
    }
    
    // 一旦まっさらにする
    todayTestBlockArea.innerHTML = '';
    futureTestBlockArea.innerHTML = '';
    
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

        var currentDate = new Date();
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
        } else {}
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

async function fetchTestsData(selectedSubject) {
    console.log("selectedSubject :" + selectedSubject)

    const subjRef = ref(database, 'subjects/' + selectedSubject + '/tests');
    const subjSnapshot = await get(subjRef);
    const subjData = subjSnapshot.val();

    const subjRef1 = ref(database, 'subjects/' + selectedSubject+'/');
    const subjSnapshot1 = await get(subjRef1);
    const subjData1 = subjSnapshot1.val();
    
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
    console.log("subjId: " + subjId);
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

//自分が履修している科目をプルダウンに表示する関数
async function showSubj(){
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

function formatDate(inputDate) {
    var date = new Date(inputDate);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var hour = date.getHours();
    var minute  =date.getMinutes().toString().padStart(2, "0");;
    
    // 月と日が1桁の場合は0埋めする
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    return year + '年' + month + '月' + day + '日 ' + hour + ":" + minute;
}

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

async function getSubjTaken(){
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
    console.log(subjTaken);
}




//ホームボタンを押したとき実行
function moveToHome(){
    window.location.href = './mypageS.html?id=' + uidValue;
}

//テストボタンを押したとき実行
function moveToTest(){
    window.location.href = './testsS.html?id=' + uidValue;  
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

function moveToExam(subjectIdInput, testIdInput, userIdInput){

    // ページ遷移
    window.location.href = './exam.html?sId=' + subjectIdInput + '&tId=' + testIdInput + '&uId=' + userIdInput;
    
}

window.moveToExam = moveToExam;
window.moveToHome = moveToHome;
window.moveToTest = moveToTest;
window.moveToProf = moveToProf;
window.moveToSet = moveToSet;
window.logout = logout;
window.editModal = editModal;
export{ moveToExam, moveToHome,moveToTest, moveToProf, moveToSet, logout, editModal }