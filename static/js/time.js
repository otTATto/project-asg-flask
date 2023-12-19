// time.js: 時間や日付の処理に関する関数を用意しているJS
//      用語:
//          - ISO8601 : "yyyy-mm-ddThh:mm" の形式　　(例) "2023-12-16T04:25"
//          - UNIX時間 : 1970年1月1日深夜0時0分を0として、1秒あたり1000ずつ増える時間の形式
//          - DateArray : [yyyy, mm, dd, hh, mm, ss] の形式　　(例) ['2023', '12', '16', '04', '25', '00'] 

// UNIX時間を与えると、現在のUNIX時間までの差(ミリ秒)を返す関数
function differenceToCurrentUnix(input){
    // 関数の返り値を入れる変数を用意
    var output;

    var now = new Date().getTime();
    var inputDate = new Date(input).getTime();
    output = now - inputDate;

    return output;
}

// UNIX時間を与えると、現在のUNIX時間からの差(ミリ秒)を返す関数
function differenceFromCurrentUnix(input){
    // 関数の返り値を入れる変数を用意
    var output;

    var now = new Date().getTime();
    var inputDate = new Date(input).getTime();
    output = inputDate - now;

    return output;
}

// ISO8601形式"yyyy-mm-ddThh:mm"からDateArray[yyyy, mm, dd, hh, mm]を返す関数
function convertISO8601ToDateArray(input){
    // 関数の返り値を入れる空の配列を用意
    var output = [];

    // 文字列の分割
    var dividedByT = input.split('T');  // then, devidedByT = ['yyyy-mm-dd', 'hh:mm']
    var dividedByhyphen = dividedByT[0].split('-'); // then, dividedByhyphen = ['yyyy', 'mm', 'dd']
    var devidedByColon = dividedByT[1].split(':') ;  // then, devidedByColon = ['hh', 'mm']

    // 返り値の整形
    output[0] = dividedByhyphen[0];
    output[1] = dividedByhyphen[1];
    output[2] = dividedByhyphen[2];
    output[3] = devidedByColon[0];
    output[4] = devidedByColon[1];

    return output;
}

// UNIX時間からDateArray[yyyy, mm, dd, hh, mm, ss]を返す関数
function convertUnixToDateArray(input){
    // 関数の返り値を入れる空の配列を用意
    var output = [];

    // inputのUNIX時間をDateオブジェクトの引数に取れる形に変形する
    input = input * 1;

    // 各時間要素の取得
    var date = new Date(input);
    output[0] = date.getFullYear();
    output[1] = (date.getMonth() + 1).toString().padStart(2, "0");
    output[2] = date.getDate().toString().padStart(2, "0");
    output[3] = date.getHours().toString().padStart(2, "0");
    output[4] = date.getMinutes().toString().padStart(2, "0");
    output[5] = date.getSeconds().toString().padStart(2, "0");

    console.log("[ GET ]output[0]: " + output[0]);

    return output;
}

// DateArray[yyyy, mm, dd, hh, mm, ss]からUNIX時間を返す関数
function convertDateArrayToUnix(input){
    // 関数の返り値を入れる変数を用意
    var output;

    input = fillDateArray(input);

    // Dateオブジェクトの引数として受け取れる形(ISO8601)に整形
    var dateInput = convertDateArrayToISO8601(input);

    // DateオブジェクトからUNIX時間を取得
    output = new Date(dateInput).getTime();

    return output;
}

// DateArray[yyyy, mm, dd, hh, mm, ss]からISO8601を返す関数
function convertDateArrayToISO8601(input){
    // 関数の返り値を入れる変数を用意
    var output;

    // 整形
    output = input[0] + '-' + input[1] + '-' + input[2] + 'T' + input[3] + ':' + input[4] + ':' + input[5];

    return output;
}

// UNIX時間からISO8601を返す関数
function convertUnixToISO8601(input){
    return convertDateArrayToISO8601(convertUnixToDateArray(input));
}

// ISO8601からUNIX時間を返す関数
function convertISO8601ToUnix(input){
    return convertDateArrayToUnix(convertISO8601ToDateArray(input));
}

// 不完全なDateArray[yyyy, mm, dd, hh, mm, ss]を完全なものに補う
function fillDateArray(input){
    // 関数の返り値となる配列を用意 
    var output = ['1970', '01', '01', '00', '00', '00'];

    for(var i = 0; i < input.length; i++){
        output[i] = input[i];
    }

    return output;
}

// 関数のエクスポート
export{ differenceToCurrentUnix, differenceFromCurrentUnix, convertISO8601ToDateArray, convertUnixToDateArray, convertDateArrayToUnix, convertUnixToISO8601,convertISO8601ToUnix }