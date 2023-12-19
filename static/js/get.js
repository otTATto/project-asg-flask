// get.js: データベースから何らかの要素を取得するための関数をまとめたJS
//      注意: 
//              それぞれの関数で予め必要なものが異なるため注意（例えば、関数「getTestName」を使うには、予め科目IDとテストIDとが分かっていなければならない）

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

// 学生に関するもの（ユーザーIDのみを引数に取るもの）たち
    // ユーザーID→ユーザーの学籍番号
    async function getStudentNum(userIdInput){
        var output;

        var studentsRef = ref(database, 'users/students/');
        var snapshot = await get(studentsRef);
        var data = snapshot.val();

        if(data == null) return;   // データが空ならforEachしない

        Object.keys(data).forEach((element) => {
            var userIdFromDb = data[element].mainData.userUid;
            var studentNumFromDb = data[element].mainData.studentNum;
            if(userIdFromDb == userIdInput) output = studentNumFromDb;
        });

        return output;
    }

    // ユーザーID→ユーザーの氏名（学生）
    async function getStudentName(userIdInput){
        var output;

        var studentsRef = ref(database, 'users/students/');
        var snapshot = await get(studentsRef);
        var data = snapshot.val();

        if(data == null) return;   // データが空ならforEachしない

        Object.keys(data).forEach((element) => {
            var userIdFromDb = data[element].mainData.userUid;
            var studentNameFromDb = data[element].mainData.studentName;
            if(userIdFromDb == userIdInput) output = studentNameFromDb;
        });

        return output;
    }

    // ユーザーID→ユーザーの所属学部
    async function getStudentFac(userIdInput){
        var output;

        var studentsRef = ref(database, 'users/students/');
        var snapshot = await get(studentsRef);
        var data = snapshot.val();

        if(data == null) return;   // データが空ならforEachしない

        Object.keys(data).forEach((element) => {
            var userIdFromDb = data[element].mainData.userUid;
            var studentFacFromDb = data[element].mainData.belonging.fac;
            if(userIdFromDb == userIdInput) output = studentFacFromDb;
        });

        return output;
    }

    // ユーザーID→ユーザーの所属学科
    async function getStudentDep(userIdInput){
        var output;

        var studentsRef = ref(database, 'users/students/');
        var snapshot = await get(studentsRef);
        var data = snapshot.val();

        if(data == null) return;   // データが空ならforEachしない

        Object.keys(data).forEach((element) => {
            var userIdFromDb = data[element].mainData.userUid;
            var studentDepFromDb = data[element].mainData.belonging.dep;
            if(userIdFromDb == userIdInput) output = studentDepFromDb;
        });

        return output;
    }

    // ユーザーID→ユーザーの学年
    async function getStudentGrade(userIdInput){
        var output;

        var studentsRef = ref(database, 'users/students/');
        var snapshot = await get(studentsRef);
        var data = snapshot.val();

        if(data == null) return;   // データが空ならforEachしない

        Object.keys(data).forEach((element) => {
            var userIdFromDb = data[element].mainData.userUid;
            var studentGradeFromDb = data[element].mainData.belonging.grade;
            if(userIdFromDb == userIdInput) output = studentGradeFromDb;
        });

        return output;
    }

    // ユーザーID→ユーザーの氏名（教師）
    async function getTeacherName(userIdInput){
        var output;

        var teacherRef = ref(database, 'users/teachers/');
        var snapshot = await get(teacherRef);
        var data = snapshot.val();

        if(data == null) return;   // データが空ならforEachしない

        Object.keys(data).forEach((element) => {
            var userIdFromDb = data[element].mainData.userUid;
            var teacherNameFromDb = data[element].mainData.studentName;
            if(userIdFromDb == userIdInput) output = teacherNameFromDb;
        });

        return output;
    }

    // ユーザーID→ユーザーの学籍番号（教師）
    async function getTeacherNum(userIdInput){
        var output;

        var teacherRef = ref(database, 'users/teachers/');
        var snapshot = await get(teacherRef);
        var data = snapshot.val();

        if(data == null) return;   // データが空ならforEachしない

        Object.keys(data).forEach((element) => {
            var userIdFromDb = data[element].mainData.userUid;
            var teacherNumFromDb = data[element].mainData.studentNum;
            if(userIdFromDb == userIdInput) output = teacherNumFromDb;
        });

        return output;
    }

// 教科やテストに関するもの
    // 教科ID→教科名
    async function getSubjectName(subjectIdInput){
        // 関数の返り値を入れる変数を用意
        var output;

        // DBの参照
        const subjectRef = ref(database, 'subjects/');
        var snapshot = await get(subjectRef);
        var data = snapshot.val();
        if(data == null) return;   // データが空ならforEachしない
        // DBの「subjects/」の中をひとつひとつ見ていく
        Object.keys(data).forEach((element) => {
            var subjectIdFromDb = data[element].mainData.subjectId;
            var subjectNameFromDb = data[element].mainData.subjectName;
            // DBの教科IDと引数の教科IDとが一致したらoutputに教科名を入れる
            if(subjectIdFromDb == subjectIdInput) output = subjectNameFromDb;
        });

        return output;
    }

    // テストID→テスト名（科目IDが既知の場合にのみ使用可能）
    async function getTestName(subjectIdInput, testIdInput){
        // 関数の返り値を入れる変数を用意
        var output;

        // DBの参照
        const testRef = ref(database, 'subjects/' + subjectIdInput + '/tests/');
        var snapshot = await get(testRef);
        var data = snapshot.val();
        if(data == null) return;   // データが空ならforEachしない
        // DBの「tests/」の中をひとつひとつ見ていく
        Object.keys(data).forEach((element) => {
            var testIdFromDb = data[element].mainData.testId;
            var testNameFromDb = data[element].mainData.testName;
            // DBのテストIDと引数のテストIDとが一致したらoutputにテスト名を入れる
            if(testIdFromDb == testIdInput) output = testNameFromDb;
        });

        return output;
    }

    // テストID→テストの日時（科目IDが既知の場合にのみ使用可能）
    async function getTestDate(subjectIdInput, testIdInput){
        // 関数の返り値を入れる変数を用意
        var output;

        // DBの参照
        const testRef = ref(database, 'subjects/' + subjectIdInput + '/tests/');
        var snapshot = await get(testRef);
        var data = snapshot.val();
        if(data == null) return;   // データが空ならforEachしない
        // DBの「tests/」の中をひとつひとつ見ていく
        Object.keys(data).forEach((element) => {
            var testIdFromDb = data[element].mainData.testId;
            var testDateFromDb = data[element].mainData.testDate;
            // DBのテストIDと引数のテストIDとが一致したらoutputにテストの日時を入れる
            if(testIdFromDb == testIdInput) output = testDateFromDb;
        });

        return output;
    }

    // テストID→試験時間（科目IDが既知の場合にのみ使用可能）
    async function getTestLimit(subjectIdInput, testIdInput){
        // 関数の返り値を入れる変数を用意
        var output;

        // DBの参照
        const testRef = ref(database, 'subjects/' + subjectIdInput + '/tests/');
        var snapshot = await get(testRef);
        var data = snapshot.val();
        if(data == null) return;   // データが空ならforEachしない
        // DBの「tests/」の中をひとつひとつ見ていく
        Object.keys(data).forEach((element) => {
            var testIdFromDb = data[element].mainData.testId;
            var testLimitFromDb = data[element].mainData.testLimit;
            // DBのテストIDと引数のテストIDとが一致したらoutputに試験時間を入れる
            if(testIdFromDb == testIdInput) output = testLimitFromDb;
        });

        return output;
    }


// 関数のエクスポート
export{ getStudentNum, getStudentName, getStudentFac, getStudentDep, getStudentGrade, getTeacherName, getTeacherNum, getSubjectName, getTestName, getTestDate, getTestLimit }