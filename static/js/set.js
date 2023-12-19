// set.js: UUIDの生成やクエリの読込の関数を用意しているJS

// UUIDの生成
function generateUuid() {
    // https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
    // const FORMAT: string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
    let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
    for (let i = 0, len = chars.length; i < len; i++) {
        switch (chars[i]) {
            case "x":
                chars[i] = Math.floor(Math.random() * 16).toString(16);
                break;
            case "y":
                chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
                break;
        }
    }
    return chars.join("");
}

// クエリの右辺のみを入れた配列を返す
function  queryDivider(){
    // URLからクエリ部分のみを取得する
    var query = decodeURI(location.search);
    if(!query){
        console.log("クエリの取得に失敗しました");
        return;
    }

    console.log("クエリを取得しました: ");
    // 取得したクエリを「&」で切り分けて各要素を配列「queryArray」に入れる
    var queryArray = query.split('&');
    var trancedDataArray = [];
    // 「queryArray」の各要素について「=」の右辺部分のみを配列「trancedDataArray」に入れる
    for(var i = 0; i < queryArray.length; i++){
        var queryValueArray = queryArray[i].split('=');
        trancedDataArray[i] = queryValueArray[1];
        console.log("Query[ " + i + " ]: " + trancedDataArray[i]);
    }

    return trancedDataArray;
}

export{ generateUuid, queryDivider }