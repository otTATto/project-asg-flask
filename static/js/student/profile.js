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
import { getStudentNum, getStudentName, getStudentFac, getStudentDep, getStudentGrade, getSubjectName, getTestName, getTestDate, getTestLimit } from '../get.js';

var uidValue;   //自分(教師)のuidを格納
var nameInput;      //名前 in 入力領域を格納
var univInput;  //大学名の情報格納
var stuNumInput; //学籍番号の格納
var facInput; //学部の情報格納
var depInput; //学科の情報格納
var grade;  //生徒の学年情報格納
var subjUidValue;
var subjTaken = []; //自分が履修している教科のuidを格納
// 起動時に実行

window.addEventListener('load', async function(){
    // クエリからuidを取得
    uidValue = queryDivider()[0];
    console.log("get uid: " + uidValue);

    //uid から名前、大学、学部、学科を取得
    const teaRef = ref(database, 'users/students/' + uidValue + '/mainData/');
    var snapshot = await get(teaRef);
    var data = snapshot.val();
    var teaName = data.studentName;
    var stuNum = data.studentNum;
    var teaUniv = data.belonging.univ;
    var teaFac = data.belonging.fac;
    var teaDep = data.belonging.dep;
    var teagrade = data.belonging.grade;


    console.log('Name:' + teaName);
    console.log('univ:' + teaUniv);


    // // uidValueをhtmlに反映
    // var uid = document.getElementById('uid');
    // var uid2 = document.createElement('div');
    // uid2.innerHTML = ' ID2・<span class="f-Zen-Maru-Gothic fw-bold c-black">' + uidValue + '</span>';
    // uid.appendChild(uid2);

    var teaNameShow = document.getElementById('teaName');
    var teaNameShow2 = document.createElement('div'); 
    teaNameShow2.innerHTML = '名前・<span class="f-Zen-Maru-Gothic fw-bold c-black">' + teaName + '</span>';
    teaNameShow.appendChild(teaNameShow2);

    var teaNameShow = document.getElementById('stuNum');
    var teaNameShow2 = document.createElement('div'); 
    teaNameShow2.innerHTML = '学籍番号・<span class="f-Zen-Maru-Gothic fw-bold c-black">' + stuNum + '</span>';
    teaNameShow.appendChild(teaNameShow2);

    var teaUnivShow = document.getElementById('teaUniv');
    var teaUnivShow2 = document.createElement('div');
    teaUnivShow2.innerHTML = '大学・<span class="f-Zen-Maru-Gothic fw-bold c-black">' + teaUniv + '</span>';
    teaUnivShow.appendChild(teaUnivShow2);

    var teaFacShow = document.getElementById('teaFac');
    var teaFacShow2 = document.createElement('div');
    teaFacShow2.innerHTML = '学部・<span class="f-Zen-Maru-Gothic fw-bold c-black">' + teaFac + '</span>';
    teaFacShow.appendChild(teaFacShow2);

    var teaDepShow = document.getElementById('teaDep');
    var teaDepShow2 = document.createElement('div');
    teaDepShow2.innerHTML = '学科・<span class="f-Zen-Maru-Gothic fw-bold c-black">' + teaDep + '</span>';
    teaDepShow.appendChild(teaDepShow2);

    var teaDepShow = document.getElementById('teagrade');
    var teaDepShow2 = document.createElement('div');
    teaDepShow2.innerHTML = '学年・<span class="f-Zen-Maru-Gothic fw-bold c-black">' + teagrade + '</span>';
    teaDepShow.appendChild(teaDepShow2);


})


// 大分類、小分類の選択肢を配列でそれぞれ用意
const categories = [
    '理学部第一部',
    '工学部',
    '薬学部',
    '創域理工学部',
    '先進工学部',
    '経営学部',
    '理学部第二部'
  ];
  
  // 小分類は、大分類と紐付けるためにオブジェクト型を使う
  const subCategories = [
    {category: '理学部第一部', name: '数学科'},
    {category: '理学部第一部', name: '物理学科'},
    {category: '理学部第一部', name: '化学科'},
    {category: '理学部第一部', name: '応用数学科'},
    {category: '理学部第一部', name: '応用物理学科'},
    {category: '理学部第一部', name: '応用化学科'},
    {category: '工学部', name: '建築学科'},
    {category: '工学部', name: '工業化学科'},
    {category: '工学部', name: '電気工学科'},
    {category: '工学部', name: '情報工学科'},
    {category: '工学部', name: '機械工学科'},
    {category: '薬学部', name: '薬学科'},
    {category: '薬学部', name: '生命創薬科学科'},
    {category: '創域理工学部', name: '数理科学科'},
    {category: '創域理工学部', name: '先端物理学科'},
    {category: '創域理工学部', name: '情報計算科学科'},
    {category: '創域理工学部', name: '生命生物科学科'},
    {category: '創域理工学部', name: '建築学科'},
    {category: '創域理工学部', name: '先端科学科'},
    {category: '創域理工学部', name: '電気電子情報工学科'},
    {category: '創域理工学部', name: '経営システム工学科'},
    {category: '創域理工学部', name: '機械航空宇宙工学科'},
    {category: '創域理工学部', name: '社会基盤工学科'},
    {category: '先進工学部', name: '電子システム工学科'},
    {category: '先進工学部', name: 'マテリアル創成工学科'},
    {category: '先進工学部', name: '生命システム工学科'},
    {category: '先進工学部', name: '物理工学科'},
    {category: '先進工学部', name: '機能デザイン工学科'},
    {category: '経営学部', name: '経営学科'},
    {category: '経営学部', name: 'ビジネスエコノミクス学科'},
    {category: '経営学部', name: '国際デザイン経営学科'},
    {category: '理学部第二部', name: '数学科'},
    {category: '理学部第二部', name: '物理学科'},
    {category: '理学部第二部', name: '化学科'},
  ];
  
  const categorySelect1 = document.getElementById('faculty');
  const subCategorySelect1 = document.getElementById('depature');
  
  // 大分類のプルダウンを生成
  categories.forEach(category => {
    const option = document.createElement('option');
    option.textContent = category;
  
    categorySelect1.appendChild(option);    
  });
  
  // 大分類が選択されたら小分類のプルダウンを生成
  categorySelect1.addEventListener('input', () => {
  
    // 小分類のプルダウンをリセット
    const options = document.querySelectorAll('#depature > option');
    options.forEach(option => {
      option.remove();
    });
  
    // 小分類のプルダウンに「選択してください」を加える
    const firstSelect = document.createElement('option');
    firstSelect.textContent = '選択してください';
    subCategorySelect1.appendChild(firstSelect);
  
    // 大分類で選択されたカテゴリーと同じ小分類のみを、プルダウンの選択肢に設定する
    subCategories.forEach(subCategory => {
      if (categorySelect1.value == subCategory.category) {
        const option = document.createElement('option');
        option.textContent = subCategory.name;
        
        subCategorySelect1.appendChild(option);
      }
    });
  });



// 「科目情報」をクリックしたときに実行
function viewSubjectArea(){
    // 「基本情報エリア」を非表示・「科目情報エリア」を表示
    $('#profileMainArea').removeClass('visible').addClass('unvisible');
    $('#profileSubjectArea').removeClass('unvisible').addClass('visible');
}

function viewMainArea(){
    // 「基本情報エリア」を表示・「科目情報エリア」を非表示
    $('#profileMainArea').removeClass('unvisible').addClass('visible');
    $('#profileSubjectArea').removeClass('visible').addClass('unvisible');
}

// プロフィール変更の「保存する」ボタンを押したときに実行
async function saveProf(){
  //テキストエリアから情報を取得
  nameInput = document.getElementById('testNameInput').value;
  stuNumInput = document.getElementById('teaNumInput').value;
  univInput = document.getElementById('univ').value;
  facInput = document.getElementById('faculty').value;
  depInput = document.getElementById('depature').value;
  grade = document.getElementById('grade').value;
  //DBに上書き
  const userRef1 = ref(database, 'users/students/' + uidValue + '/mainData/');
  await update(userRef1, {
      studentNum : stuNumInput,
      studentName : nameInput
  });

  const userRef2 = ref(database, 'users/students/' + uidValue + '/mainData/belonging/');
  await update(userRef2, {
      univ : univInput,
      fac : facInput,
      dep : depInput,
      grade : grade
  });

  window.location.href = './profile.html?uid=' + uidValue;
}


// 起動時に自分の担当している教科を「科目選択」のプルダウンに追加→テスト追加の科目名にも適用, プルダウンのvalueは教科のuid

//自分が履修している科目のuidをsujTakenに格納する関数
async function identifyUid(subjUidValue){
  // uidValue内に既に自分のuidが格納されているはず？なのでそれをif文を用いて判定する
  // またforEachを用いることにより条件判定をsub/uid/par/uid内の要素すべてに対して行う
  //また、ここでは科目のsubjUidvalue部分が変数となる。その変数はより上層の関数から引数として渡される必要がある。
  //もし自分のuidが格納されているならば"何かを"返り値(?)にして関数を終える
  //表示したいのは教科名の所、suj/$uid/main/subjectsName←ここ
  //表示の参照地点はsub/$uid←ここ
  //変数sunjUidValueを変数としてその変数を繰り返し変更するような文をより高層階で行えば何とか動かすことができる？
  //つまりsubjUidValueをワールド変数としてそれを繰り返し変更する方針がよい
  
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


var subjName = [];

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
  // processArray() 内で subjName を取得
  processArray();
});

async function processArray() {
  for (let i = 0; i < subjTaken.length; i++) {
    // 教科IDを取得
    const subjectIdInput = subjTaken[i];

    // getSubjectName関数を実行し、結果を取得
    const subjectName = await getSubjectName(subjectIdInput);
    
    // 取得した結果を新しい配列に格納
    subjName.push(subjectName);
  }

  // ここから新しく要素を生成するコードを追加
  var takenSubjContainer = document.getElementById('Takensubj');
  console.log(subjName);
  console.log(takenSubjContainer);

  // 配列の各要素に対してボタンを生成して #Takensubj 要素に追加
  subjName.forEach(function(subjectName) {
      var divItem = document.createElement("div");
      divItem.classList.add("list-group-item", "list-group-item-action");

      var divContent = document.createElement("div");
      divContent.classList.add("f-Zen-Kaku-Gothic-New", "fw-bold", "fs-5", "c-black");
      divContent.textContent = subjectName;

      divItem.appendChild(divContent);
      takenSubjContainer.appendChild(divItem);
  });
}

// 既存の .list-group 要素を取得
var listGroup = document.querySelector('.list-group');

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

window.viewSubjectArea = viewSubjectArea;
window.viewMainArea = viewMainArea;
window.moveToHome = moveToHome;
window.moveToTest = moveToTest;
window.moveToProf = moveToProf;
window.moveToSet = moveToSet;
window.logout = logout;
window.saveProf = saveProf;
export{ viewSubjectArea, viewMainArea, moveToHome, moveToTest, moveToProf, moveToSet, logout }