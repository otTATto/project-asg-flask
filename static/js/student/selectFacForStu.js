// 大分類、小分類の選択肢を配列でそれぞれ用意
const categories = [
    '理学部第一部',
    '工学部',
    '薬学部',
    '創域理工学部',
    '先進工学部',
    '経営学部',
    '理学部第二部',
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
    firstSelect.textContent = '学科を選択してください';
    firstSelect.setAttribute('value', '1');
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