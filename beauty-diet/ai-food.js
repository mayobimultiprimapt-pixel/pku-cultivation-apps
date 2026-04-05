// ============================================================
//  AI 妞嬬喓澧块幏宥囧弾閸掑棙鐎藉Ο鈥虫健 閳?Gemini Vision API
//  閸旂喕鍏? 閹峰秶鍙?娑撳﹣绱舵鐔哄⒖閸ュ墽澧?閳?AI鐠囧棗鍩嗘鐔哄⒖ 閳?娴兼壆鐣婚悜顓㈠櫤閽€銉ュ悋 閳?缂囧骸顔愰崙蹇氬墰瀵ら缚顔?// ============================================================

function getGeminiKey(){return (window.PKU_KEYS&&window.PKU_KEYS.GEMINI_API_KEY)||null}
function getGeminiURL(){return 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+getGeminiKey()}

// ===== 閸ュ墽澧栨潪鐝篴se64 =====
function imageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ===== 閸樺缂夐崶鍓у (闁灝鍘ょ搾鍛扮箖API闂勬劕鍩? =====
function compressImage(file, maxWidth = 800) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.8);
    };
    img.src = URL.createObjectURL(file);
  });
}

// ===== AI 妞嬬喓澧块崚鍡樼€介弽绋跨妇閸戣姤鏆?=====
async function analyzeFood(imageBase64, mealType = '閺堫亞鐓?) {
  const prompt = `娴ｇ姵妲告稉鈧担宥勭瑩娑撴氨娈戦拃銉ュ悋鐢牆鎷扮紘搴☆啇閸忚崵鏁撴稉鎾愁啀閵嗗倽顕崚鍡樼€芥潻娆忕炊妞嬬喓澧块悡褏澧栭敍宀冪箲閸ョ偘浜掓稉濠甋ON閺嶇厧绱￠敍鍫滅瑝鐟曚礁瀵橀崥鐜琣rkdown閺嶅洩顔囬敍宀€娲块幒銉ㄧ箲閸ユ坎SON閿涘绱?
{
  "foods": [
    {
      "name": "妞嬬喓澧块崥宥囆?,
      "amount": "娴兼壆鐣绘禒浠嬪櫤(g/ml)",
      "calories": 閺佹澘鐡?kcal),
      "protein": 閺佹澘鐡?g),
      "fat": 閺佹澘鐡?g),
      "carbs": 閺佹澘鐡?g),
      "fiber": 閺佹澘鐡?g)
    }
  ],
  "totalCalories": 閹崵鍎归柌蹇旀殶鐎?
  "totalProtein": 閹槒娉查惂鍊熷窛閺佹澘鐡?
  "totalFat": 閹槒鍓涢懖顏呮殶鐎?
  "totalCarbs": 閹崵鈷婂瀛樻殶鐎?
  "satietyScore": "妤楄精鍚傜拠鍕瀻1-10",
  "beautyScore": "缂囧骸顔愮拠鍕瀻1-10",
  "dietScore": "閸戝繗鍓涚拠鍕瀻1-10",
  "verdict": "娑撯偓閸欍儴鐦介幀鏄忕槑(濮ｆ柨顩ч敍姘崇箹妞佹劖鎯岄柊宥勭瑝闁?閻戭參鍣洪崑蹇涚彯瀵ら缚顔呴崙蹇撶毌娑撳顥ょ粵?",
  "beautyTip": "娴犲海绶ㄧ€圭懓鍚囨０婊嗩潡鎼达妇娈戝楦款唴(婵″偊绱扮紓鍝勭毌缂佺閺夈儲绨敍灞界紦鐠侇喖濮炴稉鈧禒鍊熴偪閸忔媽濮?",
  "dietTip": "娴犲骸鍣洪懘鍌濐潡鎼达妇娈戝楦款唴(婵″偊绱扮喊铏寜閸嬪繐顦块敍灞界紦鐠侇喚鏁ょ化娆戣儗閺囧じ鍞惂鐣岃儗)",
  "betterAlternative": "閺囨潙浠存惔椋庢畱閺囧じ鍞弬瑙勵攳瀵ら缚顔?婵″偊绱板楦款唴閹跺﹦鍋㈡ウ鈩冨床閹存劖绔婚拏鎼佹诞閼虫瓕鍊濋敍宀€鍎归柌蹇庣矤500闂勫秴鍩?65kcal)",
  "nextMealSuggestion": "閺嶈宓佹潻娆擃樀閹藉嫬鍙嗛敍灞界紦鐠侇喕绗呮稉鈧鎰倖娴犫偓娑?婵″偊绱版潻娆擃樀閾斿娅х拹銊ュ帠鐡掑厖绲剧紓铏规唉缂佽揪绱濋弲姘额樀瀵ら缚顔呮径褌鍞ら拕顒冨綅+濞撳懏鍫?"
}

濞夈劍鍓伴敍?1. 鐏忎粙鍣洪崙鍡欌€樻导鎵暬娴犱粙鍣洪崪宀€鍎归柌蹇ョ礉閸欏倽鈧啩鑵戦崶鍊熸儉閸忕粯鍨氶崚鍡氥€?2. 缂囧骸顔愮拠鍕瀻閼板啳妾婚敍姘濮樠冨閹存劕鍨庨妴浣烘樊C閵嗕浇鍏岄崢鐔绘巢閻ц棄甯妴涓眒ega-3缁?3. 閸戝繗鍓涚拠鍕瀻閼板啳妾婚敍娆窱閸婄鈧浇娉查惂鍊熷窛濮ｆ柧绶ラ妴浣烘唉缂佹潙鎯堥柌蹇嬧偓浣光偓鑽ゅ劰闁?4. 鏉╂瑦妲?{mealType}閻ㄥ嫮鍙庨悧?5. 韫囧懘銆忔潻鏂挎礀閺堝鏅ラ惃鍑ON閿涘奔绗夌憰浣稿娴犺缍峬arkdown閺嶅洩顔嘸;

  const body = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: 'image/jpeg',
            data: imageBase64
          }
        }
      ]
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    }
  };

  const response = await fetch(getGeminiURL(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API Error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Extract JSON from response (handle possible markdown wrapping)
  let jsonStr = text;
  const jsonMatch = text.match(/```json?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) jsonStr = jsonMatch[1];
  // Also try to find raw JSON
  const braceMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (braceMatch) jsonStr = braceMatch[0];
  
  return JSON.parse(jsonStr);
}

// ===== AI 濮ｅ繑妫╂顕€顥ゅ楦款唴 =====
async function getAIDietAdvice(userProfile, todayIntake) {
  const prompt = `娴ｇ姵妲告稉鎾茬瑹閽€銉ュ悋鐢牆鍚嬬紘搴☆啇閸忚崵鏁撴い楣冩６閵嗗倹鐗撮幑顔讳簰娑撳淇婇幁顖滅舶閸戣桨绮栭弮銉ュ⒖娴ｆ瑩顦垫鐔风紦鐠侇噯绱濇潻鏂挎礀JSON閺嶇厧绱￠敍鍫滅瑝鐟曚沟arkdown閺嶅洩顔囬敍澶涚窗

閻劍鍩涙穱鈩冧紖閿?- 楠炴挳绶為敍?{userProfile.age}瀹€渚婄礉闊偊鐝敍?{userProfile.height}cm閿涘奔缍嬮柌宥忕窗${userProfile.weight}kg
- 閻╊喗鐖ｉ敍?{userProfile.goal === 'lose' ? '閸戝繗鍓涙繅鎴濊埌' : userProfile.goal === 'maintain' ? '缂佸瓨瀵旀担鎾诲櫢' : '婢х偠鍊?}
- 缂囧骸顔愰惄顔界垼閿?{userProfile.skin.join('閵?)}

娴犲﹥妫╁鍙夋啔閸忋儻绱?- 閹崵鍎归柌蹇ョ窗${todayIntake.calories}kcal
- 閾斿娅х拹顭掔窗${todayIntake.protein}g
- 閼村倽鍋戦敍?{todayIntake.fat}g  
- 绾拌櫕鎸夐敍?{todayIntake.carbs}g
- 瀹告彃鎮嗛惃鍕樀濞嗏槄绱?{todayIntake.mealsEaten.join('閵?)}

鐠囩柉绻戦崶婵睸ON閿?{
  "remainingCalories": 娴犲﹥妫╅崜鈺€缍戦崣顖涙啔閸忋儳鍎归柌?
  "advice": "閺佺繝缍嬪楦款唴",
  "nextMeal": {
    "type": "娑撳绔存鎰閸?閸楀牓顦?閺呮岸顦?閸旂娀顦?",
    "items": [
      {"name":"閹恒劏宕樻鐔哄⒖","amount":"娴犱粙鍣?,"calories":閻戭參鍣?"reason":"閹恒劏宕橀悶鍡欐暠(娴犲海绶ㄧ€圭懓鍣洪懘鍌濐潡鎼?"}
    ],
    "totalCalories": 娑撳绔存鎰紦鐠侇喗鈧崵鍎归柌?  },
  "beautyFocus": "娴犲﹥妫╃紘搴☆啇闁插秶鍋ｅ楦款唴(濮ｆ柨顩ч敍姘矕婢垛晝娣瓹閹藉嫬鍙嗘稉宥堝喕閿涘苯缂撶拋顔煎閻氭洜灏ㄥ?",
  "warning": "婵″倹婀侀棁鈧憰浣规暈閹板繒娈?濮ｆ柨顩ч敍姘扁拪濮樻潙鍑＄搾鍛垼閿涘苯澧挎担娆擃樀濞嗭繝浼╅崗宥嗙┅缁琚?"
}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.4, maxOutputTokens: 1500 }
  };

  const response = await fetch(getGeminiURL(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  let jsonStr = text;
  const jsonMatch = text.match(/```json?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) jsonStr = jsonMatch[1];
  const braceMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (braceMatch) jsonStr = braceMatch[0];
  
  return JSON.parse(jsonStr);
}

// ===== 妞嬬喓澧块崚鍡樼€界拋鏉跨秿缁狅紕鎮?=====
function getFoodLog() {
  try {
    return JSON.parse(localStorage.getItem('beauty_diet_food_log') || '[]');
  } catch(e) { return []; }
}

function saveFoodEntry(entry) {
  const log = getFoodLog();
  log.push({
    ...entry,
    timestamp: Date.now(),
    date: new Date().toDateString()
  });
  localStorage.setItem('beauty_diet_food_log', JSON.stringify(log));
}

function getTodayLog() {
  const today = new Date().toDateString();
  return getFoodLog().filter(e => e.date === today);
}

function getTodayIntake() {
  const todayEntries = getTodayLog();
  const result = {
    calories: 0, protein: 0, fat: 0, carbs: 0,
    mealsEaten: [], entries: todayEntries
  };
  todayEntries.forEach(e => {
    result.calories += e.totalCalories || 0;
    result.protein += e.totalProtein || 0;
    result.fat += e.totalFat || 0;
    result.carbs += e.totalCarbs || 0;
    if (e.mealType && !result.mealsEaten.includes(e.mealType)) {
      result.mealsEaten.push(e.mealType);
    }
  });
  return result;
}

// ===== UI: 閹峰秶鍙庨崚鍡樼€介棃銏℃緲 =====
function renderPhotoAnalysis() {
  const todayEntries = getTodayLog();
  const intake = getTodayIntake();
  const targetCal = state.profile.goal === 'lose' ? 1200 : state.profile.goal === 'maintain' ? 1600 : 2000;
  const remaining = Math.max(0, targetCal - intake.calories);
  const pct = Math.min(100, Math.round(intake.calories / targetCal * 100));
  
  return `
    <div class="hero-card" style="margin-top:8px">
      <img src="foods.png" class="hero-img" alt="ai-food"/>
      <div class="hero-overlay">
        <div class="hero-date">AI 妞嬬喓澧块崚鍡樼€?璺?Gemini Vision</div>
        <div class="hero-title">閹峰秶鍙?em>鐠囧棗宕?/em></div>
        <div class="hero-sub">閹峰秳绔村鐘晪AI 缁夋帞鐣婚悜顓㈠櫤閳帞绮版担鐘电法鐎圭懓鍣洪懘鍌氱紦鐠?/div>
      </div>
    </div>

    <!-- 娴犲﹥妫╅幗鍕弳濮掑倽顩?-->
    <div class="profile-section">
      <div class="section-title"><span class="icon">棣冩惓</span>娴犲﹥妫╅幗鍕弳鏉╁€熼嚋</div>
      <div style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-secondary);margin-bottom:6px">
          <span>瀹稿弶鎲氶崗?${intake.calories} kcal</span>
          <span>閸撯晙缍?${remaining} kcal</span>
        </div>
        <div style="height:8px;border-radius:4px;background:rgba(255,255,255,0.06);overflow:hidden">
          <div style="height:100%;width:${pct}%;border-radius:4px;background:${pct>100?'var(--accent-rose)':pct>80?'var(--accent-peach)':'var(--accent-mint)'};transition:width 0.5s"></div>
        </div>
      </div>
      <div class="stats-bar" style="margin-bottom:0">
        <div class="stat-item"><div class="stat-value cal">${intake.calories}</div><div class="stat-label">瀹稿弶鎲氶崗顧眂al</div></div>
        <div class="stat-item"><div class="stat-value pro">${intake.protein}g</div><div class="stat-label">閾斿娅х拹?/div></div>
        <div class="stat-item"><div class="stat-value fat">${intake.fat}g</div><div class="stat-label">閼村倽鍋?/div></div>
        <div class="stat-item"><div class="stat-value carb">${intake.carbs}g</div><div class="stat-label">绾拌櫕鎸?/div></div>
      </div>
    </div>

    <!-- 閹峰秶鍙?娑撳﹣绱堕崠鍝勭厵 -->
    <div class="profile-section" style="text-align:center">
      <div class="section-title" style="justify-content:center"><span class="icon">棣冩懗</span>閹峰秶鍙庨崚鍡樼€芥鐔哄⒖</div>
      
      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:16px">
        <label class="btn-generate" style="width:auto;padding:14px 24px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px">
          <span class="shimmer"></span>
          棣冩懖 閹峰秶鍙?          <input type="file" accept="image/*" capture="environment" id="cameraInput" style="display:none" onchange="handleFoodPhoto(this, 'camera')"/>
        </label>
        <label class="btn-generate" style="width:auto;padding:14px 24px;cursor:pointer;display:flex;align-items:center;gap:8px;font-size:14px;background:linear-gradient(135deg,#a78bfa,#6366f1)">
          <span class="shimmer"></span>
          棣冩煠閿?閻╃鍞?          <input type="file" accept="image/*" id="galleryInput" style="display:none" onchange="handleFoodPhoto(this, 'gallery')"/>
        </label>
      </div>

      <select class="form-select" id="mealTypeSelect" style="width:auto;margin:0 auto;text-align:center">
        <option value="閺冣晠顦?>棣冨瘶 鏉╂瑦妲搁弮鈺咁樀</option>
        <option value="閸楀牓顦? selected>閳解偓閿?鏉╂瑦妲搁崡鍫ヮ樀</option>
        <option value="閺呮岸顦?>棣冨 鏉╂瑦妲搁弲姘额樀</option>
        <option value="閸旂娀顦?>棣冨祲 鏉╂瑦妲搁崝鐘活樀</option>
      </select>

      <!-- 妫板嫯顫嶉崠鍝勭厵 -->
      <div id="photoPreview" style="margin-top:16px;display:none">
        <img id="previewImg" style="width:100%;max-height:250px;object-fit:cover;border-radius:var(--radius-sm);border:1px solid rgba(255,255,255,0.1)"/>
      </div>

      <!-- AI 閸掑棙鐎界紒鎾寸亯 -->
      <div id="analysisResult" style="margin-top:16px"></div>
    </div>

    <!-- AI 娑撳绔存鎰紦鐠?-->
    ${intake.calories > 0 ? `
    <div class="profile-section">
      <div class="section-title"><span class="icon">棣冾樆</span>AI 閺呴缚鍏橀幒銊ㄥ礃娑撳绔存?/div>
      <button class="btn-generate" onclick="getNextMealAdvice()" style="background:linear-gradient(135deg,#6366f1,#a78bfa)">
        <span class="shimmer"></span>
        棣冾潵 闂傜摰I閿涙矮绗呮稉鈧鎰嚉閸氬啩绮堟稊鍫吹
      </button>
      <div id="aiAdviceResult" style="margin-top:16px"></div>
    </div>
    ` : ''}

    <!-- 娴犲﹥妫╅崚鍡樼€介崢鍡楀蕉 -->
    ${todayEntries.length > 0 ? `
    <div class="profile-section">
      <div class="section-title"><span class="icon">棣冩惖</span>娴犲﹥妫╅崚鍡樼€界拋鏉跨秿 (${todayEntries.length}閺?</div>
      ${todayEntries.map((e, i) => `
        <div class="meal-card" style="margin-bottom:10px">
          <div class="meal-header" style="border:none">
            <div class="meal-type">
              <span class="meal-emoji">${e.mealType==='閺冣晠顦??'棣冨瘶':e.mealType==='閸楀牓顦??'閳解偓閿?:e.mealType==='閺呮岸顦??'棣冨':'棣冨祲'}</span>
              <div>
                <div class="meal-name">${e.mealType} 璺?${new Date(e.timestamp).toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}</div>
                <div class="meal-time">${e.foods?.map(f=>f.name).join('閵?) || '閺堫亞鐓℃鐔哄⒖'}</div>
              </div>
            </div>
            <div class="meal-cal">${e.totalCalories} kcal</div>
          </div>
          ${e.verdict ? `<div style="padding:0 20px 12px;font-size:12px;color:var(--text-secondary)">${e.verdict}</div>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
  `;
}

// ===== 閹峰秶鍙庢径鍕倞 =====
async function handleFoodPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  
  // Show preview
  const preview = document.getElementById('photoPreview');
  const previewImg = document.getElementById('previewImg');
  const resultDiv = document.getElementById('analysisResult');
  const mealType = document.getElementById('mealTypeSelect').value;
  
  preview.style.display = 'block';
  previewImg.src = URL.createObjectURL(file);
  
  // Show loading
  resultDiv.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div class="loading-spinner" style="width:40px;height:40px;margin:0 auto 12px"></div>
      <div style="font-size:13px;color:var(--text-secondary)">棣冩敵 Gemini AI 濮濓絽婀崚鍡樼€芥担鐘垫畱${mealType}...</div>
      <div style="font-size:11px;color:var(--text-secondary);margin-top:6px">鐠囧棗鍩嗘鐔哄⒖ 閳?娴兼壆鐣婚悜顓㈠櫤 閳?閻㈢喐鍨氬楦款唴</div>
    </div>
  `;
  
  try {
    // Compress and convert to base64
    const compressed = await compressImage(file);
    const base64 = await imageToBase64(compressed);
    
    // Call Gemini Vision API
    const result = await analyzeFood(base64, mealType);
    
    // Save to log
    saveFoodEntry({ ...result, mealType });
    
    // Display result
    resultDiv.innerHTML = renderAnalysisResult(result, mealType);
    
    // Refresh the page's intake counter after a moment
    setTimeout(() => {
      // Update just the stats without full re-render to preserve the result
      const intake = getTodayIntake();
      const targetCal = state.profile.goal === 'lose' ? 1200 : 1600;
      document.querySelectorAll('.stat-value.cal').forEach(el => {
        if (el.closest('.profile-section')) el.textContent = intake.calories;
      });
    }, 500);
    
  } catch (error) {
    resultDiv.innerHTML = `
      <div style="padding:16px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);border-radius:var(--radius-sm);text-align:left">
        <div style="font-size:14px;font-weight:700;color:#ef4444;margin-bottom:8px">閴?閸掑棙鐎芥径杈Е</div>
        <div style="font-size:12px;color:var(--text-secondary)">${error.message}</div>
        <div style="font-size:11px;color:var(--text-secondary);margin-top:8px">鐠囬攱顥呴弻銉х秹缂佹粏绻涢幒銉礉閹存牕鐨剧拠鏇熷床娑撯偓瀵姵娲垮〒鍛珰閻ㄥ嫮鍙庨悧?/div>
      </div>
    `;
  }
}

// ===== 濞撳弶鐓嬮崚鍡樼€界紒鎾寸亯 =====
function renderAnalysisResult(result, mealType) {
  const getScoreColor = (score) => {
    const s = parseInt(score);
    if (s >= 8) return 'var(--accent-mint)';
    if (s >= 5) return 'var(--accent-peach)';
    return 'var(--accent-rose)';
  };

  return `
    <div style="text-align:left">
      <!-- 鐠囧嫬鍨庨弽?-->
      <div style="display:flex;gap:8px;margin-bottom:16px">
        <div style="flex:1;text-align:center;padding:12px;border-radius:var(--radius-sm);background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
          <div style="font-size:24px;font-weight:900;color:${getScoreColor(result.dietScore)}">${result.dietScore}</div>
          <div style="font-size:10px;color:var(--text-secondary)">閸戝繗鍓涚拠鍕瀻</div>
        </div>
        <div style="flex:1;text-align:center;padding:12px;border-radius:var(--radius-sm);background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
          <div style="font-size:24px;font-weight:900;color:${getScoreColor(result.beautyScore)}">${result.beautyScore}</div>
          <div style="font-size:10px;color:var(--text-secondary)">缂囧酣顤佺拠鍕瀻</div>
        </div>
        <div style="flex:1;text-align:center;padding:12px;border-radius:var(--radius-sm);background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06)">
          <div style="font-size:24px;font-weight:900;color:${getScoreColor(result.satietyScore)}">${result.satietyScore}</div>
          <div style="font-size:10px;color:var(--text-secondary)">妤楄精鍚傜拠鍕瀻</div>
        </div>
      </div>

      <!-- 閹崵鍎归柌?-->
      <div style="text-align:center;padding:12px;background:linear-gradient(135deg,rgba(232,82,122,0.1),rgba(167,139,250,0.06));border-radius:var(--radius-sm);margin-bottom:16px">
        <div style="font-size:28px;font-weight:900;color:var(--accent-peach)">${result.totalCalories} <span style="font-size:14px">kcal</span></div>
        <div style="font-size:11px;color:var(--text-secondary);margin-top:4px">
          閾斿娅?${result.totalProtein}g 璺?閼村倽鍋?${result.totalFat}g 璺?绾拌櫕鎸?${result.totalCarbs}g
        </div>
      </div>

      <!-- 妞嬬喓澧块弰搴ｇ矎 -->
      <div style="margin-bottom:12px">
        <div style="font-size:13px;font-weight:700;margin-bottom:8px">棣冨禂閿?鐠囧棗鍩嗛崚鎵畱妞嬬喓澧?/div>
        ${(result.foods || []).map(f => `
          <div class="food-item">
            <div class="food-info">
              <span class="food-icon">棣冩暬</span>
              <div><div class="food-name">${f.name}</div><div class="food-amount">${f.amount}</div></div>
            </div>
            <div class="food-detail">
              <div class="food-kcal">${f.calories} kcal</div>
              <div class="food-macro">閾斿娅?{f.protein}g 璺?閼?{f.fat}g 璺?绾?{f.carbs}g</div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- AI 瀵ら缚顔?-->
      <div class="beauty-tip" style="border-left-color:var(--accent-mint)">
        <div class="beauty-tip-title" style="color:var(--accent-mint)">棣冩憫 閹槒鐦?/div>
        <div class="beauty-tip-text">${result.verdict || ''}</div>
      </div>
      
      <div class="beauty-tip" style="margin-top:8px;border-left-color:var(--accent-rose)">
        <div class="beauty-tip-title" style="color:var(--accent-rose)">棣冩嫷 缂囧骸顔愬楦款唴</div>
        <div class="beauty-tip-text">${result.beautyTip || ''}</div>
      </div>

      <div class="beauty-tip" style="margin-top:8px;border-left-color:var(--accent-peach)">
        <div class="beauty-tip-title" style="color:var(--accent-peach)">閳?閸戝繗鍓涘楦款唴</div>
        <div class="beauty-tip-text">${result.dietTip || ''}</div>
      </div>

      <div class="beauty-tip" style="margin-top:8px;border-left-color:var(--accent-lavender)">
        <div class="beauty-tip-title" style="color:var(--accent-lavender)">棣冩敡 閺囩繝绱弴澶稿敩</div>
        <div class="beauty-tip-text">${result.betterAlternative || ''}</div>
      </div>

      <div class="beauty-tip" style="margin-top:8px;border-left-color:#60a5fa">
        <div class="beauty-tip-title" style="color:#60a5fa">閴冣槄绗?娑撳绔存鎰紦鐠?/div>
        <div class="beauty-tip-text">${result.nextMealSuggestion || ''}</div>
      </div>

      <!-- 閹垮秳缍旈幐澶愭尦 -->
      <div style="display:flex;gap:8px;margin-top:16px">
        <button class="btn-order btn-meituan" style="flex:1" onclick="openOrder('meituan','${mealType}')">棣冪厸 缂囧骸娲熼悙瑙勬禌娴狅綁顦?/button>
        <button class="btn-order btn-eleme" style="flex:1" onclick="openOrder('eleme','${mealType}')">棣冩暩 妤楀じ绨℃稊鍫㈠仯閺囧じ鍞?/button>
      </div>
    </div>
  `;
}

// ===== AI 娑撳绔存鎰紦鐠?=====
async function getNextMealAdvice() {
  const adviceDiv = document.getElementById('aiAdviceResult');
  if (!adviceDiv) return;
  
  adviceDiv.innerHTML = `
    <div style="text-align:center;padding:20px">
      <div class="loading-spinner" style="width:40px;height:40px;margin:0 auto 12px"></div>
      <div style="font-size:13px;color:var(--text-secondary)">棣冾潵 AI 濮濓絽婀崚鍡樼€芥担鐘辩矕閺冦儴鎯€閸忚崵濮搁崘?..</div>
    </div>
  `;
  
  try {
    const intake = getTodayIntake();
    const result = await getAIDietAdvice(state.profile, intake);
    
    adviceDiv.innerHTML = `
      <div style="text-align:left">
        <div style="text-align:center;padding:12px;background:rgba(99,102,241,0.1);border-radius:var(--radius-sm);margin-bottom:12px">
          <div style="font-size:11px;color:var(--text-secondary)">閸撯晙缍戦崣顖涙啔閸?/div>
          <div style="font-size:28px;font-weight:900;color:var(--accent-lavender)">${result.remainingCalories} <span style="font-size:14px">kcal</span></div>
        </div>
        
        <div class="beauty-tip" style="border-left-color:var(--accent-lavender)">
          <div class="beauty-tip-title" style="color:var(--accent-lavender)">棣冾潵 AI 閺佺繝缍嬪楦款唴</div>
          <div class="beauty-tip-text">${result.advice}</div>
        </div>

        ${result.nextMeal ? `
        <div style="margin-top:12px">
          <div style="font-size:13px;font-weight:700;margin-bottom:8px">棣冩惖 閹恒劏宕?{result.nextMeal.type}閼挎粌宕?(~${result.nextMeal.totalCalories}kcal)</div>
          ${(result.nextMeal.items || []).map(item => `
            <div class="food-item">
              <div class="food-info">
                <span class="food-icon">閴?/span>
                <div>
                  <div class="food-name">${item.name}</div>
                  <div class="food-amount">${item.amount}</div>
                  <div style="font-size:10px;color:var(--accent-lavender);margin-top:2px">${item.reason}</div>
                </div>
              </div>
              <div class="food-detail">
                <div class="food-kcal">${item.calories} kcal</div>
              </div>
            </div>
          `).join('')}
        </div>
        ` : ''}

        ${result.beautyFocus ? `
        <div class="beauty-tip" style="margin-top:8px;border-left-color:var(--accent-rose)">
          <div class="beauty-tip-title" style="color:var(--accent-rose)">棣冩嫷 娴犲﹥妫╃紘搴☆啇闁插秶鍋?/div>
          <div class="beauty-tip-text">${result.beautyFocus}</div>
        </div>
        ` : ''}

        ${result.warning ? `
        <div class="beauty-tip" style="margin-top:8px;border-left-color:#ef4444">
          <div class="beauty-tip-title" style="color:#ef4444">閳跨媴绗?濞夈劍鍓?/div>
          <div class="beauty-tip-text">${result.warning}</div>
        </div>
        ` : ''}
      </div>
    `;
  } catch (error) {
    adviceDiv.innerHTML = `
      <div style="padding:12px;background:rgba(239,68,68,0.1);border-radius:var(--radius-sm);font-size:12px;color:#ef4444">
        閴?閼惧嘲褰囧楦款唴婢惰精瑙? ${error.message}
      </div>
    `;
  }
}


