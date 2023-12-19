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

// 関数をインポート
import {queryDivider, generateUuid } from '../set.js';

// グローバル変数の用意
var mailValue;      // メアド in databaseを格納
var passwordValue;  //パスワード in databaseを格納
var nameValue;      //
var nameInput      //名前 in 入力領域を格納
var stuNum;        //学籍番号 in入力領域を格納
var uidValue;       // ユーザーユニークIDを格納
var mailInput;     // メアド in 入力領域を格納
var passwordInput; //パスワード in 入力領域を格納
var nameInput      //名前 in 入力領域を格納
var univInput;  //大学名の情報格納
var facInput; //学部の情報格納
var depInput; //学科の情報格納

// 「ログインする」ボタンを押したときに実行
async function login(){

    // メアド、パスワードin 入力領域を取得
    mailInput = document.getElementById('loginMailInput').value;
    passwordInput = document.getElementById('loginPasswordInput').value;
    // メールアドレス、パスワードin データベースを取得

  if(!database) {
    alert("DBに正しくアクセスできません");
    return;
  }

  const itemRef = ref(database, 'users/teachers/');
  var snapshot = await get(itemRef);
  var data = snapshot.val();
  Object.keys(data).forEach((element, index, key, snapshot) => {  //DB内を全探索して一致するメアドを探す
    let mailFromDB = data[element].loginData.mail;
    
    if(mailFromDB == mailInput){   //一致したらそれを保存
      console.log('ヒットしました:' + mailFromDB);
      mailValue = mailFromDB;
      passwordValue = data[element].loginData.passwd;
      uidValue = data[element].mainData.userUid  //uidを取得
    }
  });
  
  // メアドがDBに無かったらreturn
  if(!mailValue) {
    alert("登録していないメールアドレスです");
    return;
  }

  // パスワードが間違っていたらreturn
  if(passwordValue != passwordInput ) {
    alert("パスワードが間違っています");
    return;
  }
  
  // ページ遷移
  window.location.href = './mypage.html?uid=' + uidValue;

}

// ナビにおける「サインイン」ボタンを押したときに実行
function viewSigninArea(){
    // 「ログインエリア」を非表示・「サインインエリア」を表示
    $('#loginArea').removeClass('visible').addClass('unvisible');
    $('#signinArea').removeClass('unvisible').addClass('visible');
}

// ナビにおける「ログイン」ボタンを押したときに実行
function viewLoginArea(){
    // 「ログインエリア」を表示・「サインインエリア」を非表示
    $('#loginArea').removeClass('unvisible').addClass('visible');
    $('#signinArea').removeClass('visible').addClass('unvisible');
}

// 「サインインエリア」の「1st step」における「次へ」ボタンを押したときに実行
function moveTo2(){
    mailValue = document.getElementById('signinMailInput').value;
    //「signinMailInput」が空ならreturn
    if(!mailValue) {
      alert("メールアドレスが入力されていません");
      return;   //if内の代替→maiVaalue == NULL
    };
    // テキストボックスからパスワードを取得
    //「passwordInput」から文字を取得
    passwordValue = document.getElementById('signinPasswordInput01').value;
    //「signinPasswordInput01」が空ならreturn
    if(!passwordValue) {
        alert("パスワードが入力されていません");
        return;
    };

    //パスワード(再入力)と違ったらreturn
    const passwordValue02 = document.getElementById('signinPasswordInput02').value;
    if(passwordValue != passwordValue02){
      alert("正しくパスワードを入力してください");
      return;
    };

    // 「1st ステップ エリア」を非表示・「2nd ステップ エリア」を表示・「3rd ステップ エリア」を非表示
    $('#firstStepArea').removeClass('visible').addClass('unvisible');
    $('#secondStepArea').removeClass('unvisible').addClass('visible');
    $('#thirdStepArea').removeClass('visible').addClass('unvisible');
}

// 「サインインエリア」の「2st step」における「次へ」ボタンを押したときに実行
function moveTo3(){
  stuNum = document.getElementById('signinStudentNumInput').value;
  if(!stuNum){
      alert("学籍番号を入力してください");
      return;
    };
    console.log(signinStudentNumInput);

  //テキストボックスから名前を取得
  nameInput = document.getElementById('signinNameInput').value;
  if(!nameInput){
    alert("名前を入力してください");
    return;
  };

    // 「1st ステップ エリア」を非表示・「2nd ステップ エリア」を非表示・「3rd ステップ エリア」を表示
    $('#firstStepArea').removeClass('visible').addClass('unvisible');
    $('#secondStepArea').removeClass('visible').addClass('unvisible');
    $('#thirdStepArea').removeClass('unvisible').addClass('visible');
}

// 「サインインエリア」の「2st step」における「戻る」ボタンを押したときに実行
function backTo1(){
    // 「1st ステップ エリア」を表示・「2nd ステップ エリア」を非表示・「3rd ステップ エリア」を非表示
    console.log(nameInput);
    $('#firstStepArea').removeClass('unvisible').addClass('visible');
    $('#secondStepArea').removeClass('visible').addClass('unvisible');
    $('#thirdStepArea').removeClass('visible').addClass('unvisible');
}

// 「サインインエリア」の「3rd step」における「次へ」ボタンを押したときに実行
async function moveToMypage(){
    //プルダウンから学籍番号、大学、学部、学科を取得
    univInput = document.getElementById('univ').value;
    facInput = document.getElementById('faculty').value;
    depInput = document.getElementById('depature').value;
    console.log(facInput); 
    console.log(depInput);
    console.log(univInput);


    // ユニークなユーザーIDを生成・取得
    // 関数「generateUuid」を呼び出して、返り値を「uidValue」に格納
    uidValue = generateUuid();

    // 登録時間を取得
    const signinTime = Date.now();

    //DBに格納
    const userRef1 = ref(database, 'users/teachers/' + uidValue + '/mainData/');  //第一引数：database(L24)(どのデータベースか), 第2：入れたい場所のパス, refはfirebaseから引っ張ってきた
    await set(userRef1, {      //第一引数：入れたい場所, 第2引数：入れたい内容   await: 非同期関数の中で使える、この関数が完了するまで先に進まない
      studentNum : stuNum,
      studentName : nameInput,
      userType : "teacher",
      userUid : uidValue,
    });

    const userRef2 = ref(database, 'users/teachers/' + uidValue + '/mainData/belonging/');
    await set(userRef2, {
      univ : univInput,
      fac : facInput,
      dep : depInput
    });

    const userRef3 = ref(database, 'users/teachers/' + uidValue + '/loginData/');
    await set(userRef3, {
      mail : mailValue,
      passwd : passwordValue
    });

    const userRef4 = ref(database, 'users/teachers/' + uidValue + '/baseData/');
    await set(userRef4, {
      makeDate : signinTime
    })

    // マイページへの遷移
    window.location.href = './mypage.html?uid=' + uidValue + '/';

}

// 「サインインエリア」の「3rd step」における「戻る」ボタンを押したときに実行
function backTo2(){
    // 「1st ステップ エリア」を非表示・「2nd ステップ エリア」を表示・「3rd ステップ エリア」を非表示
    $('#firstStepArea').removeClass('visible').addClass('unvisible');
    $('#secondStepArea').removeClass('unvisible').addClass('visible');
    $('#thirdStepArea').removeClass('visible').addClass('unvisible');
}

// 関数のエクスポート
window.login = login;
window.viewSigninArea = viewSigninArea;
window.viewLoginArea = viewLoginArea;
window.moveTo2 = moveTo2;
window.moveTo3 = moveTo3;
window.backTo1 = backTo1;
window.moveToMypage = moveToMypage;
window.backTo2 = backTo2;
export{ login, viewSigninArea, viewLoginArea, moveTo2, moveTo3, backTo1, moveToMypage, backTo2 }