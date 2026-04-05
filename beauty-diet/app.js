// ============================================================
//  缇庨杞讳綋 路 鎳掍汉瀹氬埗 鈥?Core Application Logic
// ============================================================

// ===== 韬虹槮鏍稿績娉曞垯 =====
const LYING_SLIM_RULES = [
  '馃イ 椁愬墠20鍒嗛挓鍠?00ml娓╂按锛屽崰鎹儍瀹归噺',
  '馃 杩涢椤哄簭锛氭堡姘粹啋铔嬬櫧璐ㄢ啋钄彍鈫掔⒊姘?,
  '馃嵔锔?211椁愮洏娉曪細陆钄彍 + 录铔嬬櫧 + 录浣嶨I涓婚',
  '馃悽 姣忓彛鍜€鍤?0娆′互涓婏紝20鍒嗛挓鍚冨畬涓€椁?,
  '鈴?鏅氶鍦?8:00鍓嶅畬鎴愶紝鐫″墠4h绂侀',
  '馃挧 姣忓ぉ2000ml姘达紝鍔犻€熻剛鑲唬璋?,
  '馃槾 淇濊瘉7-8h鐫＄湢锛屾縺绱犳墠鑳芥甯哥噧鑴?,
];

// ===== DATA: 浣撶Н楗娉?路 鍚冮ケ涔熸帀绉?Meal Database =====
// 璁捐鍘熷垯: 楂橀ケ鑵规寚鏁?SI) + 澶т綋绉綆鐑噺瀵嗗害 + 楂樿泲鐧介槻鎺夎倢鑲?// 鐩爣: 鏃╅350kcal + 鍗堥450kcal + 鏅氶300kcal + 鍔犻100kcal 鈮?1200kcal
const MEALS_DB = {
  // ===== 鏃╅ (鐩爣: ~350kcal, 楗辫吂4h+) =====
  breakfast: [
    { name:'钂哥孩钖?姘寸叜铔嬅?', icon:'馃崰', amount:'绾㈣柉200g+铔?涓?, kcal:330, protein:14, fat:10, carb:42, tip:'绾㈣柉鑶抽绾ょ淮鎾戦ケ鑳冿紝铔嬬櫧璐ㄧǔ琛€绯?h涓嶉タ', satiety:'鈽呪槄鈽呪槄鈽?, vol:'澶т綋绉? },
    { name:'鐕曢害甯岃厞閰稿ザ纰?, icon:'馃ィ', amount:'鐕曢害50g+閰稿ザ200g+鑾撴灉', kcal:310, protein:18, fat:6, carb:45, tip:'尾-钁¤仛绯栧惛姘磋啫鑳€10鍊嶏紝楗辫吂鎰熶箣鐜?, satiety:'鈽呪槄鈽呪槄鈽?, vol:'澶т綋绉? },
    { name:'鍏ㄩ害涓夋槑娌?楦¤泲鐢熻彍)', icon:'馃オ', amount:'闈㈠寘2鐗?铔?鑿?, kcal:320, protein:16, fat:8, carb:40, tip:'鍏ㄩ害绾ょ淮+铔嬬櫧璐ㄧ粍鍚堬紝娑堝寲鎱㈤噴鏀剧ǔ', satiety:'鈽呪槄鈽呪槄', vol:'涓瓑' },
    { name:'鏃犵硸璞嗘祮+鐜夌背+铔?, icon:'馃尳', amount:'璞嗘祮350ml+鐜夌背1鏍?铔?涓?, kcal:340, protein:17, fat:8, carb:46, tip:'鐜夌背鏄珮绾や富椋熶箣鐜嬶紝涓€鏍瑰氨楗辫繕鍙湁90kcal', satiety:'鈽呪槄鈽呪槄鈽?, vol:'澶т綋绉? },
    { name:'灏忕背鍗楃摐绮?姘寸叜铔?, icon:'馃巸', amount:'绮?00g+铔?涓?, kcal:290, protein:14, fat:10, carb:34, tip:'鍗楃摐鏋滆兌鍑忕紦鑳冩帓绌猴紝楗辫吂鎰熷欢闀?灏忔椂', satiety:'鈽呪槄鈽呪槄', vol:'澶т綋绉? },
    { name:'绱柉鐕曢害鐗涘ザ', icon:'馃', amount:'绱柉150g+鐕曢害40g+濂?00ml', kcal:340, protein:12, fat:6, carb:55, tip:'绱柉鑺遍潚绱犵編鐧?鐕曢害尾-钁¤仛绯栭ケ鑵瑰弻閲嶅姞鎸?, satiety:'鈽呪槄鈽呪槄鈽?, vol:'澶т綋绉? },
    { name:'楦¤兏鑲夊叏楹﹀嵎楗?, icon:'馃尟', amount:'楗?寮?楦¤兏80g+鐢熻彍', kcal:310, protein:22, fat:7, carb:38, tip:'22g铔嬬櫧寮€鍚竴澶╀唬璋紝鑲岃倝涓嶆帀鍩轰唬涓嶉檷', satiety:'鈽呪槄鈽呪槄', vol:'涓瓑' },
    { name:'榄旇妺鐕曢害绮?鑼跺彾铔?, icon:'馃ィ', amount:'榄旇妺涓?鐕曢害+铔?涓?, kcal:280, protein:15, fat:10, carb:28, tip:'榄旇妺闆跺崱鎾戣儍绁炲櫒+鐕曢害缂撻噴纰虫按=5h涓嶉タ', satiety:'鈽呪槄鈽呪槄鈽?, vol:'瓒呭ぇ浣撶Н' },
  ],
  // ===== 鍗堥 (鐩爣: ~450kcal, 楗辫吂5h+, 211椁愮洏娉? =====
  lunch: [
    // === 铔嬬櫧璐ㄤ富鑿?(1/4椁愮洏) ===
    { name:'棣欑厧楦¤兏鑲?, icon:'馃崡', amount:'150g(1鎺屽績)', kcal:165, protein:31, fat:4, carb:0, tip:'铔嬬櫧璐ㄧ儹鏁堝簲30%锛屾秷鍖栧氨鍦ㄧ噧鑴傦紒', satiety:'鈽呪槄鈽呪槄鈽?, vol:'涓瓑', cat:'protein' },
    { name:'娓呰捀椴堥奔', icon:'馃悷', amount:'200g', kcal:140, protein:28, fat:3, carb:0, tip:'楸艰倝铔嬬櫧娑堝寲鍚告敹鐜?8%锛屼綆鑴備箣鐜?, satiety:'鈽呪槄鈽呪槄', vol:'涓瓑', cat:'protein' },
    { name:'鐧界伡铏?, icon:'馃', amount:'250g(绾?5鍙?', kcal:150, protein:30, fat:2, carb:0, tip:'铏鹃潚绱犵編鐧?瓒呴珮铔嬬櫧锛屽墺澹冲悆鏇存參鏇撮ケ', satiety:'鈽呪槄鈽呪槄鈽?, vol:'澶т綋绉?, cat:'protein' },
    { name:'鐣寗鐐栫墰鑵?, icon:'馃ォ', amount:'150g', kcal:200, protein:22, fat:10, carb:6, tip:'閾佽川+鐣寗绾㈢礌锛屾皵鑹茬孩娑﹁繕鎶楁哀鍖?, satiety:'鈽呪槄鈽呪槄', vol:'涓瓑', cat:'protein' },
    { name:'棣欑厧涓夋枃楸?, icon:'馃悷', amount:'120g', kcal:220, protein:22, fat:14, carb:0, tip:'Omega-3鎶楃値瀚╄偆+淇冭繘鐦︾礌鍒嗘硨鍔╁噺鑴?, satiety:'鈽呪槄鈽呪槄', vol:'涓瓑', cat:'protein' },
    { name:'璞嗚厫铇戣弴鐓?, icon:'馃嵅', amount:'璞嗚厫200g+鑿?50g', kcal:130, protein:14, fat:5, carb:8, tip:'妞嶇墿铔嬬櫧+鑿囩被澶氱硸锛屽ぇ浣撶Н鍙湁130kcal锛?, satiety:'鈽呪槄鈽呪槄鈽?, vol:'瓒呭ぇ浣撶Н', cat:'protein' },
    // === 钄彍 (1/2椁愮洏, 澶ч噺!) ===
    { name:'娓呯倰瑗垮叞鑺?澶т唤)', icon:'馃ウ', amount:'300g', kcal:60, protein:8, fat:2, carb:6, tip:'300g鎵?0kcal锛佺淮C淇冭繘鑳跺師鍚堟垚', satiety:'鈽呪槄鈽呪槄鈽?, vol:'瓒呭ぇ浣撶Н', cat:'veg' },
    { name:'钂滆搲鑿犺彍', icon:'馃ガ', amount:'300g', kcal:55, protein:6, fat:2, carb:4, tip:'鍙堕吀+閾佽ˉ琛€鍦ｅ搧锛屽ぇ鎶婂悆涔熶笉鑳?, satiety:'鈽呪槄鈽呪槄', vol:'瓒呭ぇ浣撶Н', cat:'veg' },
    { name:'鍑夋媽榛勭摐鏈ㄨ€?, icon:'馃', amount:'榛勭摐250g+鏈ㄨ€?0g', kcal:45, protein:2, fat:1, carb:8, tip:'姘村垎96%鐨勯粍鐡?娓呰偁鏈ㄨ€?娑ㄨ儍涓嶆定绉?, satiety:'鈽呪槄鈽呪槄', vol:'瓒呭ぇ浣撶Н', cat:'veg' },
    { name:'鐣寗铔嬭姳姹?澶х)', icon:'馃崊', amount:'400ml', kcal:60, protein:5, fat:2, carb:6, tip:'椁愬墠涓€纰楃儹姹ゅ崰鑳冨閲?0%锛屼富椋熻嚜鍔ㄥ皯鍚?, satiety:'鈽呪槄鈽呪槄鈽?, vol:'瓒呭ぇ浣撶Н', cat:'veg' },
    { name:'鐧界伡鐢熻彍/鑿滃績', icon:'馃ガ', amount:'300g', kcal:40, protein:3, fat:1, carb:4, tip:'鏁寸洏钄彍40kcal锛屾兂鍚冨灏戝悆澶氬皯', satiety:'鈽呪槄鈽?, vol:'瓒呭ぇ浣撶Н', cat:'veg' },
    { name:'榄旇妺涓濊敩鑿滄矙鎷?, icon:'馃', amount:'榄旇妺200g+钄彍200g', kcal:35, protein:2, fat:1, carb:5, tip:'榄旇妺鍑犱箮0鍗?钄彍绾ょ淮=鏃犻檺閲忓～鑳?, satiety:'鈽呪槄鈽呪槄鈽?, vol:'瓒呭ぇ浣撶Н', cat:'veg' },
    // === 浣嶨I涓婚 (1/4椁愮洏) ===
    { name:'绯欑背楗?灏忎唤)', icon:'馃崥', amount:'100g(鍗婃嫵)', kcal:115, protein:3, fat:1, carb:24, tip:'浣嶨I=琛€绯栨參鍗囨參闄?涓嶉タ涓嶅洶涓嶅洡鑴?, satiety:'鈽呪槄鈽?, vol:'灏忎綋绉?, cat:'carb' },
    { name:'钂稿崡鐡?灞辫嵂', icon:'馃崰', amount:'200g', kcal:90, protein:2, fat:0, carb:20, tip:'鍗楃摐鏋滆兌寤剁紦鑳冩帓绌猴紝鍚岀瓑鐑噺姣旂背楗ケ2鍊?, satiety:'鈽呪槄鈽呪槄鈽?, vol:'澶т綋绉?, cat:'carb' },
    { name:'钂哥帀绫?鍗婃牴)', icon:'馃尳', amount:'鍗婃牴绾?00g', kcal:80, protein:3, fat:1, carb:16, tip:'楂樼氦缁翠綆鐑噺涓婚锛屽毤鐫€鍚冭秴婊¤冻', satiety:'鈽呪槄鈽呪槄', vol:'涓瓑', cat:'carb' },
  ],
  // ===== 鏅氶 (鐩爣: ~300kcal, 杞婚涓轰富, 18:00鍓嶅悆瀹? =====
  dinner: [
    { name:'楦¤兏鑲夎敩鑿滄堡', icon:'馃嵅', amount:'楦¤倝100g+鑿?00g+姹?, kcal:180, protein:22, fat:3, carb:12, tip:'涓€澶х鐑堡鍙湁180kcal锛屾殩鑳冮ケ鑵瑰埌澶╀寒', satiety:'鈽呪槄鈽呪槄鈽?, vol:'瓒呭ぇ浣撶Н' },
    { name:'娓呰捀铏?鐧界伡瑗垮叞鑺?, icon:'馃', amount:'铏?00g+瑗垮叞鑺?50g', kcal:200, protein:33, fat:3, carb:6, tip:'绾泲鐧?绾氦缁存櫄椁愶紝鐫¤涔熷湪鐕冭剛', satiety:'鈽呪槄鈽呪槄鈽?, vol:'澶т綋绉? },
    { name:'鍐摐铏句粊姹?, icon:'馃嵅', amount:'鍐摐300g+铏?00g', kcal:120, protein:18, fat:1, carb:8, tip:'鍐摐鍒╂按娑堣偪+铏句粊楂樿泲鐧?鏃╄捣绉よ交0.5鏂?, satiety:'鈽呪槄鈽呪槄', vol:'瓒呭ぇ浣撶Н' },
    { name:'榄旇妺闈?钄彍鍗?, icon:'馃崪', amount:'榄旇妺闈?00g+鑿?00g', kcal:90, protein:3, fat:2, carb:12, tip:'榄旇妺闈㈠悆鍒版拺涔熶笉鍒?00kcal锛岄潰椋熻嚜鐢憋紒', satiety:'鈽呪槄鈽呪槄鈽?, vol:'瓒呭ぇ浣撶Н' },
    { name:'璞嗚厫钄彍鐓?, icon:'馃', amount:'璞嗚厫150g+鑿?鑿?, kcal:160, protein:14, fat:6, carb:10, tip:'妞嶇墿铔嬬櫧+鑿囩被椴滃懗婊¤冻锛屽噺鑴備笉鍑忓垢绂忔劅', satiety:'鈽呪槄鈽呪槄', vol:'澶т綋绉? },
    { name:'鍑夋媽楦′笣+鎷嶉粍鐡?, icon:'馃', amount:'楦¤兏100g+榛勭摐300g', kcal:170, protein:22, fat:4, carb:8, tip:'榛勭摐姘村垎鎾戣儍+楦′笣铔嬬櫧楗辫吂锛屾竻鐖芥帀绉ょ粍鍚?, satiety:'鈽呪槄鈽呪槄鈽?, vol:'澶т綋绉? },
    { name:'鐣寗璞嗚厫铔嬭姳姹?, icon:'馃崊', amount:'鐣寗200g+璞嗚厫100g+铔?, kcal:150, protein:12, fat:6, carb:10, tip:'涓夌铔嬬櫧璐ㄦ潵婧?鐣寗绾㈢礌锛岀編鐧藉噺鑴備袱涓嶈', satiety:'鈽呪槄鈽呪槄', vol:'澶т綋绉? },
    { name:'绱彍铔嬭姳姹?钂稿崡鐡?, icon:'馃巸', amount:'姹?00ml+鍗楃摐200g', kcal:140, protein:6, fat:2, carb:26, tip:'鐑堡鏆栬儍+鍗楃摐鐢滅朝瑙ｉ锛屾櫄椁愬垢绂忔劅鎷夋弧', satiety:'鈽呪槄鈽呪槄', vol:'瓒呭ぇ浣撶Н' },
  ],
  // ===== 鍔犻 (鐩爣: ~100kcal, 闃叉楗垮埌鏆撮) =====
  snack: [
    { name:'灏忕暘鑼?鍦ｅコ鏋?', icon:'馃崊', amount:'300g(绾?0棰?', kcal:60, protein:2, fat:0, carb:12, tip:'300g鎵?0kcal锛佸拃鍤兼劅寮猴紝鍚冨崐灏忔椂', satiety:'鈽呪槄鈽呪槄', vol:'澶т綋绉? },
    { name:'榛勭摐鏉?, icon:'馃', amount:'1鏍圭害250g', kcal:35, protein:1, fat:0, carb:7, tip:'闅忔椂鍟冿紝闆剁姜鎭舵劅锛屾按鍒?绾ょ淮鎾戣儍', satiety:'鈽呪槄鈽?, vol:'澶т綋绉? },
    { name:'鑻规灉', icon:'馃崕', amount:'1涓腑绛?, kcal:80, protein:0, fat:0, carb:20, tip:'鏋滆兌娓呰偁+鑻规灉閰稿鑲わ紝澶╃劧闆堕', satiety:'鈽呪槄鈽呪槄', vol:'涓瓑' },
    { name:'鍧氭灉(灏忔妸)', icon:'馃', amount:'15g(绾?棰?', kcal:90, protein:3, fat:8, carb:3, tip:'濂借剛鑲淮鎸佹縺绱犲钩琛★紝浣嗗彧鑳戒竴灏忔妸锛?, satiety:'鈽呪槄鈽?, vol:'灏忎綋绉? },
    { name:'榄旇妺鏋滃喕', icon:'馃嵁', amount:'2鏉?, kcal:10, protein:0, fat:0, carb:2, tip:'鍑犱箮0鍗＄殑Q寮瑰皬闆堕锛屽槾棣嬫晳鏄?, satiety:'鈽呪槄鈽?, vol:'涓瓑' },
    { name:'鏃犵硸姘旀场姘?, icon:'馃イ', amount:'330ml', kcal:0, protein:0, fat:0, carb:0, tip:'姘旀场鎾戣儍浜х敓楗辫吂鎰燂紝0鍗￠獥楗卞ぇ鑴?, satiety:'鈽呪槄鈽呪槄', vol:'澶т綋绉? },
    { name:'钃濊帗/鑽夎帗', icon:'馃珢', amount:'150g', kcal:48, protein:1, fat:0, carb:11, tip:'鎶楁哀鍖栦箣鐜嬶紝鐢滆€屼笉鑳栫殑缇庣櫧姘存灉', satiety:'鈽呪槄鈽?, vol:'涓瓑' },
  ]
};

// ===== DATA: Beauty Tips =====
const BEAUTY_TIPS = [
  { title:'鑳跺師铔嬬櫧鍚堟垚绉樿瘈', text:'缁碈+浼樿川铔嬬櫧鍚岄锛岃兌鍘熷悎鎴愭晥鐜囨彁鍗?鍊嶃€備笁鏂囬奔+瑗垮叞鑺辨槸榛勯噾鎼厤锛? },
  { title:'鎶楃硸鍖栭ギ椋熸硶', text:'鍑忓皯绮惧埗绯栨憚鍏ワ紝閫夋嫨浣嶨I涓婚(绯欑背/钘滈害)锛岀毊鑲ょ硸鍖栧弽搴斿噺灏戯紝寮规€ф樉钁楁彁鍗囥€? },
  { title:'鎺掓瘨鏃堕棿琛?, text:'鏃╄捣涓€鏉俯鏌犳姘达紝鍗堝悗涓€鏉豢鑼讹紝鐫″墠閾惰€崇竟銆備笁娈垫帓姣掞紝鍐呰皟澶栧吇銆? },
  { title:'鎶楄“鑰佽秴绾ч鐗?, text:'钃濊帗銆佹牳妗冦€佷笁鏂囬奔銆佺墰娌规灉銆佺豢鑼垛€斺€斾簲澶ф姉琛板ぉ鍥紝姣忓ぉ鍚冨3绉嶃€? },
  { title:'琛ヨ鍏婚閾佷笁瑙?, text:'绾㈡灒+榛戣姖楹?妗傚渾锛屾瘡鏃ラ€傞噺锛屼袱鍛ㄦ皵鑹叉槑鏄炬敼鍠勩€? },
  { title:'绁涙箍缇庣櫧缁勫悎', text:'钖忕背+绾㈣眴+璧ゅ皬璞嗙叜姘达紝姣忔棩涓€鏉紝娑堣偪缇庣櫧鍙岀榻愪笅銆? },
  { title:'鎶ょ溂缇庣灣楗', text:'鑳¤悵鍗?鏋告潪+鍙堕粍绱?鑿犺彍)锛岀溂鍛ㄧ粏绾规贰鍖栵紝鐪稿瓙鏇存槑浜€? },
  { title:'澶滈棿淇钀ュ吇', text:'鐫″墠2灏忔椂鍋滄杩涢锛屼絾鍙枬灏戦噺閾惰€崇竟鎴栨俯鐗涘ザ锛屼績杩涘闂磋倢鑲や慨澶嶃€? },
];

// ===== DATA: 缇庨鏃堕棿杞?鈥?绮剧‘鍒版瘡涓椂闂寸偣鐨勭編瀹归ギ椋熸寚鍗?=====
const BEAUTY_TIMELINE = [
  { time:'06:30', icon:'馃挧', title:'鏅ㄨ捣鎺掓瘨姘?, food:'娓╂煚妾按 / 铚傝湝姘?300ml', tip:'绌鸿吂涓€鏉縺娲昏偁閬擄紝鏌犳VC淇冭繘鑳跺師鍚堟垚锛?鍒嗛挓鍐呭枬瀹?, kcal:15, cat:'drink' },
  { time:'07:30', icon:'馃寘', title:'缇庨鏃╅', food:'绾㈣柉+铔?钃濊帗閰稿ザ / 鐕曢害+鍧氭灉', tip:'缁碈(钃濊帗)+铔嬬櫧璐?铔?鍚岄鈫掕兌鍘熷悎鎴愭晥鐜囨彁鍗?鍊嶏紒', kcal:330, cat:'breakfast' },
  { time:'09:30', icon:'馃珢', title:'涓婂崍鎶楁哀鍖栧姞椁?, food:'钃濊帗/鑽夎帗150g 鎴?鍧氭灉涓€灏忔妸', tip:'鑺遍潚绱?缁碋鍙岄噸鎶楁哀鍖栵紝闃叉涓婂崍绱绾挎哀鍖栨崯浼?, kcal:60, cat:'snack' },
  { time:'11:30', icon:'馃挧', title:'椁愬墠楗辫吂姘?, food:'娓╂按300ml锛堥鍓?0鍒嗛挓锛?, tip:'鍗犳嵁鑳冨閲?0%锛屽崍椁愯嚜鍔ㄥ皯鍚冿紝闆舵垚鏈渶寮哄噺鑴傛妧宸?, kcal:0, cat:'drink' },
  { time:'12:00', icon:'鈽€锔?, title:'211鍑忚剛鍗堥', food:'楦¤兏/楸?+ 澶т唤钄彍脳2 + 浣嶨I涓婚', tip:'鍏堝悆铔嬬櫧鈫掑啀鍚冭彍鈫掓渶鍚庣⒊姘达紝琛€绯栫ǔ瀹?涓嶅洡鑴?涓嶇姱鍥?, kcal:400, cat:'lunch' },
  { time:'14:00', icon:'馃嵉', title:'鍗堝悗鎶楃硸鍖栬尪', food:'缁胯尪/鏅幢鑼?涓€鏉紙鏃犵硸锛?, tip:'鑼跺閰氭姉绯栧寲鈫掗槻姝㈢毊鑲ゅ彉榛勫彉鏉撅紝鍚屾椂鎻愮涓嶇姱鍥?, kcal:2, cat:'drink' },
  { time:'15:30', icon:'馃崊', title:'涓嬪崍缇庣櫧鍔犻', food:'鍦ｅコ鏋?00g / 鐚曠尨妗?涓?/ 榛勭摐鏉?, tip:'缁碈瀵嗛泦琛ュ厖鏃舵锛屾惌閰嶅墠闈㈢殑铔嬬櫧璐ㄢ啋鎸佺画渚涚粰鑳跺師鍚堟垚鍘熸枡', kcal:60, cat:'snack' },
  { time:'17:30', icon:'馃寵', title:'杞婚缇庡鏅氶', food:'铏?瑗垮叞鑺辨堡 / 楦′笣鎷岄粍鐡?/ 榄旇妺闈?, tip:'18:00鍓嶅悆瀹岋紒涓夋枃楸?铏?Omega-3鎶楃値瀚╄偆锛岃タ鍏拌姳=缁碈缇庣櫧', kcal:170, cat:'dinner' },
  { time:'19:00', icon:'馃泚', title:'鐟舵荡/娉¤剼鏃堕棿', food:'娉″墠鍠濇按300ml + 娉″悗琛ユ按500ml', tip:'娓╃儹鎵╁紶姣涘瓟鈫掍腑鑽夎嵂娓楅€忊啋鎺掓瘨鎺掓箍鈫掗厤鍚堜粖鏃ラ鐤楁晥鏋滅炕鍊?, kcal:0, cat:'bath' },
  { time:'20:30', icon:'馃イ', title:'鐫″墠淇楗?, food:'閾惰€宠幉瀛愮竟 / 娓╃墰濂讹紙灏戦噺锛?, tip:'妞嶇墿鑳跺師+鑹叉皑閰稿姪鐪狅紝22:00鍓嶅繀椤诲仠姝竴鍒囪繘椋?, kcal:80, cat:'night' },
  { time:'22:00', icon:'馃槾', title:'缇庡瑙夊紑濮?, food:'鍋滄杩涢锛佸彧鍙枬姘?, tip:'娣辩潯鏃剁敓闀挎縺绱犲垎娉屸啋浠婂ぉ鍚冪殑鑳跺師铔嬬櫧鍘熸枡寮€濮嬭嚜鍔ㄤ慨澶嶇毊鑲?, kcal:0, cat:'sleep' },
];

// ===== DATA: Yao Bath (鐟舵荡鍖? Schedule =====
const YAO_BATH_CYCLE = [
  { name:'娲荤粶绁涢', icon:'馃尙锔?, color:'#60a5fa', desc:'鐤忛€氱粡缁溿€佺闄ら瀵掓箍閭€佺紦瑙ｅ叧鑺傞吀鐥?, effect:'淇冭繘琛€娑插惊鐜紝鏀瑰杽鎵嬭剼鍐板噳', duration:'20-30鍒嗛挓', temp:'40-42掳C' },
  { name:'娲荤粶绁涢', icon:'馃尙锔?, color:'#60a5fa', desc:'鐤忛€氱粡缁溿€佺闄ら瀵掓箍閭€佺紦瑙ｅ叧鑺傞吀鐥?, effect:'淇冭繘琛€娑插惊鐜紝鏀瑰杽鎵嬭剼鍐板噳', duration:'20-30鍒嗛挓', temp:'40-42掳C' },
  { name:'鎺掓睏鍏婚', icon:'馃拵', color:'#f472b6', desc:'娣卞眰鎺掓睏鎺掓瘨銆佺枏閫氭瘺瀛斻€佺編鐧芥鼎鑲?, effect:'鐨偆閫氶€忔湁鍏夋辰锛屼唬璋㈠簾鐗╂帓鍑?, duration:'25-35鍒嗛挓', temp:'41-43掳C' },
  { name:'鎺掓睏鍏婚', icon:'馃拵', color:'#f472b6', desc:'娣卞眰鎺掓睏鎺掓瘨銆佺枏閫氭瘺瀛斻€佺編鐧芥鼎鑲?, effect:'鐨偆閫氶€忔湁鍏夋辰锛屼唬璋㈠簾鐗╂帓鍑?, duration:'25-35鍒嗛挓', temp:'41-43掳C' },
  { name:'濡囧仴淇', icon:'馃尭', color:'#fb923c', desc:'鏆栧鎶ゅ发銆佽皟鐞嗘湀缁忋€佷慨澶嶅绉戜簹鍋ュ悍', effect:'鏀瑰杽瀹瘨鐥涚粡锛屽钩琛″唴鍒嗘硨', duration:'25-30鍒嗛挓', temp:'39-41掳C' },
  { name:'濡囧仴淇', icon:'馃尭', color:'#fb923c', desc:'鏆栧鎶ゅ发銆佽皟鐞嗘湀缁忋€佷慨澶嶅绉戜簹鍋ュ悍', effect:'鏀瑰杽瀹瘨鐥涚粡锛屽钩琛″唴鍒嗘硨', duration:'25-30鍒嗛挓', temp:'39-41掳C' },
  { name:'娓╄偩鍥哄厓', icon:'馃敟', color:'#fbbf24', desc:'娓╄ˉ鑲鹃槼銆佸浐鏈煿鍏冦€佸寮轰綋璐?, effect:'鏀瑰杽鑵拌啙閰歌蒋锛屾彁鍗囩簿姘旂', duration:'20-30鍒嗛挓', temp:'40-42掳C' },
  { name:'娓╄偩鍥哄厓', icon:'馃敟', color:'#fbbf24', desc:'娓╄ˉ鑲鹃槼銆佸浐鏈煿鍏冦€佸寮轰綋璐?, effect:'鏀瑰杽鑵拌啙閰歌蒋锛屾彁鍗囩簿姘旂', duration:'20-30鍒嗛挓', temp:'40-42掳C' },
  { name:'娓呰偆淇濆仴', icon:'馃崈', color:'#34d399', desc:'娓呯儹瑙ｆ瘨銆佹鐥掔鐤广€佸吇鎶よ倢鑲?, effect:'鏀瑰杽鐨偆鐦欑棐銆佹箍鐤癸紝鑲岃偆娓呯埥', duration:'20-25鍒嗛挓', temp:'38-40掳C' },
  { name:'娓呰偆淇濆仴', icon:'馃崈', color:'#34d399', desc:'娓呯儹瑙ｆ瘨銆佹鐥掔鐤广€佸吇鎶よ倢鑲?, effect:'鏀瑰杽鐨偆鐦欑棐銆佹箍鐤癸紝鑲岃偆娓呯埥', duration:'20-25鍒嗛挓', temp:'38-40掳C' },
];

// ===== STATE =====
let state = {
  profile: { gender:'female', age:25, height:160, weight:55, goal:'lose', allergies:[], skin:['缇庣櫧','鎶楄“'] },
  todayMeals: null,
  autoOrder: false,
  currentTab: 'home',
  bathIndex: 0,
  bathStartDate: null,
  weekLog: {},
};

// Load saved state
function loadState() {
  try {
    const saved = localStorage.getItem('beauty_diet_state');
    if (saved) Object.assign(state, JSON.parse(saved));
  } catch(e) {}
}
function saveState() {
  try { localStorage.setItem('beauty_diet_state', JSON.stringify(state)); } catch(e) {}
}

// ===== MEAL GENERATION =====
function pickRandom(arr, count) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateDayMeals() {
  const targetCal = state.profile.goal === 'lose' ? 1200 : state.profile.goal === 'maintain' ? 1600 : 2000;
  
  // Breakfast: pick 1 complete combo
  const bk = pickRandom(MEALS_DB.breakfast, 1);
  
  // Lunch: 211 plate method 鈥?1 protein + 2 veg + 1 carb
  const proteins = MEALS_DB.lunch.filter(i => i.cat === 'protein');
  const vegs = MEALS_DB.lunch.filter(i => i.cat === 'veg');
  const carbs = MEALS_DB.lunch.filter(i => i.cat === 'carb');
  const lu = [
    ...pickRandom(proteins, 1),
    ...pickRandom(vegs, 2),
    ...pickRandom(carbs, 1),
  ];
  
  // Dinner: pick 1 main (already combo dishes)
  const dn = pickRandom(MEALS_DB.dinner, 1);
  
  // Snack: 1 item
  const sn = pickRandom(MEALS_DB.snack, 1);
  
  const tip = BEAUTY_TIPS[Math.floor(Math.random() * BEAUTY_TIPS.length)];
  
  state.todayMeals = {
    date: new Date().toDateString(),
    target: targetCal,
    meals: [
      { type:'鏃╅', emoji:'馃寘', time:'7:30 - 8:30 路 椁愬墠鍠濇按300ml', items: bk },
      { type:'鍗堥', emoji:'鈽€锔?, time:'12:00 - 13:00 路 211椁愮洏娉?, items: lu },
      { type:'鏅氶', emoji:'馃寵', time:'17:30 - 18:00 路 鐫″墠4h绂侀', items: dn },
      { type:'鍔犻', emoji:'馃嵉', time:'15:00 路 闃查タ闃叉毚椋?, items: sn },
    ],
    beautyTip: tip,
  };
  saveState();
  return state.todayMeals;
}

function getTotalNutrition(meals) {
  let cal=0,pro=0,fat=0,carb=0;
  if (!meals) return {cal,pro,fat,carb};
  meals.meals.forEach(m => m.items.forEach(i => { cal+=i.kcal; pro+=i.protein; fat+=i.fat; carb+=i.carb; }));
  return {cal,pro,fat,carb};
}

// ===== YAO BATH SCHEDULE =====
function getBathSchedule(count=10) {
  const schedule = [];
  const startDate = state.bathStartDate ? new Date(state.bathStartDate) : new Date();
  if (!state.bathStartDate) { state.bathStartDate = startDate.toISOString(); saveState(); }
  
  let dayOffset = 0;
  for (let i = 0; i < count; i++) {
    const idx = (state.bathIndex + i) % YAO_BATH_CYCLE.length;
    const bath = YAO_BATH_CYCLE[idx];
    const date = new Date(startDate);
    date.setDate(date.getDate() + dayOffset);
    schedule.push({ ...bath, date, index: idx, seq: i+1 });
    dayOffset += (i % 2 === 0) ? 1 : 2; // alternate 1 and 2 days gap
  }
  return schedule;
}

function markBathDone() {
  state.bathIndex = (state.bathIndex + 1) % YAO_BATH_CYCLE.length;
  saveState();
}

// ===== DATE HELPERS =====
function formatDate(d) {
  const opts = { month:'long', day:'numeric', weekday:'long' };
  return new Date(d || Date.now()).toLocaleDateString('zh-CN', opts);
}
function getWeekDays() {
  const days = ['鏃?,'涓€','浜?,'涓?,'鍥?,'浜?,'鍏?];
  const today = new Date();
  const result = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(today); d.setDate(d.getDate()+i);
    result.push({ label: days[d.getDay()], date: d.toDateString(), isToday: i===0 });
  }
  return result;
}

// ===== RENDER ENGINE =====
function renderApp() {
  const app = document.getElementById('app');
  
  // Check if meals exist for today
  if (state.todayMeals && state.todayMeals.date !== new Date().toDateString()) {
    state.todayMeals = null; // Reset for new day
  }
  
  app.innerHTML = `
    ${renderHeader()}
    <div class="main">
      ${state.currentTab === 'home' ? renderHome() : ''}
      ${state.currentTab === 'photo' ? renderPhotoAnalysis() : ''}
      ${state.currentTab === 'chat' ? renderChatTab() : ''}
      ${state.currentTab === 'history' ? renderHistoryTab() : ''}
      ${state.currentTab === 'profile' ? renderProfileTab() : ''}
    </div>
    ${renderBottomNav()}
    ${renderOrderModal()}
    <div class="loading-overlay" id="loadingOverlay">
      <div class="loading-spinner"></div>
      <div class="loading-text">鉁?AI 姝ｅ湪涓轰綘瀹氬埗浠婃棩椋熻氨...</div>
    </div>
  `;
  bindEvents();
  if (typeof bindChatEvents === 'function') bindChatEvents();
}

function renderHeader() {
  return `<header class="app-header">
    <div class="logo">
      <div class="logo-icon">鉁?/div>
      <div class="logo-text"><span>缇庨杞讳綋</span></div>
    </div>
    <div class="header-actions">
      <button class="header-btn" onclick="toggleAutoOrder()">馃 ${state.autoOrder?'鑷姩涓嬪崟涓?:'鎳掍汉妯″紡'}</button>
    </div>
  </header>`;
}

function renderHome() {
  const meals = state.todayMeals;
  const nutr = getTotalNutrition(meals);
  
  return `
    <div class="hero-card">
      <img src="hero.png" class="hero-img" alt="wellness" />
      <div class="hero-overlay">
        <div class="hero-date">${formatDate()}</div>
        <div class="hero-title">鍚冮ケ涔熻兘<em>韬虹槮</em></div>
        <div class="hero-sub">${meals ? '浣撶Н楗娉?路 211椁愮洏 路 楂橀ケ鑵逛綆鐑噺 馃挄' : '浣撶Н楗娉?+ 211椁愮洏娉曪紝鍚冩拺涔熸帀绉?}</div>
      </div>
    </div>

    ${renderWeekTracker()}

    ${meals ? `
      <div class="stats-bar">
        <div class="stat-item"><div class="stat-value cal">${nutr.cal}</div><div class="stat-label">鍗冨崱</div></div>
        <div class="stat-item"><div class="stat-value pro">${nutr.pro}g</div><div class="stat-label">铔嬬櫧璐?/div></div>
        <div class="stat-item"><div class="stat-value fat">${nutr.fat}g</div><div class="stat-label">鑴傝偑</div></div>
        <div class="stat-item"><div class="stat-value carb">${nutr.carb}g</div><div class="stat-label">纰虫按</div></div>
      </div>

      <div class="profile-section" style="padding:16px 20px">
        <div class="section-title" style="margin-bottom:10px"><span class="icon">馃泲锔?/span>韬虹槮7澶ф硶鍒?/div>
        ${LYING_SLIM_RULES.map(r => `<div style="font-size:12px;color:var(--text-secondary);padding:4px 0;line-height:1.6">${r}</div>`).join('')}
      </div>

      ${renderAutoOrderPanel()}

      ${meals.meals.map((m, idx) => renderMealCard(m, idx)).join('')}

      <div class="beauty-score">
        <svg width="0" height="0"><defs><linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#e8527a"/><stop offset="100%" stop-color="#a78bfa"/>
        </linearGradient></defs></svg>
        <div class="score-ring">
          <svg viewBox="0 0 120 120">
            <circle class="bg" cx="60" cy="60" r="52"/>
            <circle class="fill" cx="60" cy="60" r="52" stroke-dasharray="327" stroke-dashoffset="${327 - 327 * 0.82}"/>
          </svg>
          <div class="score-number">82</div>
        </div>
        <div class="score-label">浠婃棩缇庨鎸囨暟</div>
        <div class="score-items">
          <div class="score-item"><div class="score-item-val" style="color:var(--accent-rose)">浼?/div><div class="score-item-label">鎶楁哀鍖?/div></div>
          <div class="score-item"><div class="score-item-val" style="color:var(--accent-lavender)">鑹?/div><div class="score-item-label">鑳跺師铔嬬櫧</div></div>
          <div class="score-item"><div class="score-item-val" style="color:var(--accent-mint)">浼?/div><div class="score-item-label">鎺掓瘨鎸囨暟</div></div>
          <div class="score-item"><div class="score-item-val" style="color:var(--accent-peach)">涓?/div><div class="score-item-label">琛ヨ鍏绘皵</div></div>
        </div>
      </div>

      <!-- 缇庨鏃堕棿杞?-->
      <div class="profile-section">
        <div class="section-title"><span class="icon">鈴?/span>浠婃棩缇庨楗鏃堕棿杞?/div>
        <div style="font-size:11px;color:var(--text-secondary);margin-bottom:12px">绮剧‘鍒版瘡涓椂闂寸偣 路 璺熺潃鍚冨氨鑳藉彉缇庡彉鐦?/div>
        ${BEAUTY_TIMELINE.map((item, i) => {
          const now = new Date();
          const [h,m] = item.time.split(':').map(Number);
          const itemTime = new Date(); itemTime.setHours(h,m,0,0);
          const nextItem = BEAUTY_TIMELINE[i+1];
          const nextTime = nextItem ? (() => { const t=new Date(); const [nh,nm]=nextItem.time.split(':').map(Number); t.setHours(nh,nm,0,0); return t; })() : new Date(9999,1,1);
          const isPast = now > nextTime;
          const isCurrent = now >= itemTime && now < nextTime;
          const borderColor = isCurrent ? 'var(--accent-rose)' : isPast ? 'var(--accent-mint)' : 'rgba(255,255,255,0.06)';
          const statusIcon = isPast ? '鉁? : isCurrent ? '馃憠' : '鈴?;
          const opacity = isPast ? '0.5' : '1';
          const catColors = {drink:'#60a5fa',breakfast:'#fbbf24',snack:'#34d399',lunch:'#a78bfa',dinner:'#f472b6',bath:'#fb923c',night:'#818cf8',sleep:'#6b7280'};
          const catColor = catColors[item.cat] || '#e8527a';
          return `
          <div style="display:flex;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);opacity:${opacity};${isCurrent?'background:rgba(232,82,122,0.06);margin:0 -16px;padding:10px 16px;border-radius:12px;border:1px solid rgba(232,82,122,0.15)':''}">
            <div style="min-width:48px;text-align:center">
              <div style="font-size:13px;font-weight:700;color:${catColor}">${item.time}</div>
              <div style="font-size:16px;margin-top:2px">${statusIcon}</div>
            </div>
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                <span style="font-size:16px">${item.icon}</span>
                <span style="font-size:14px;font-weight:700">${item.title}</span>
                ${item.kcal > 0 ? `<span style="font-size:10px;padding:2px 8px;border-radius:10px;background:${catColor}22;color:${catColor};margin-left:auto">${item.kcal}kcal</span>` : ''}
              </div>
              <div style="font-size:12px;color:var(--accent-peach);margin-bottom:3px">${item.food}</div>
              <div style="font-size:11px;color:var(--text-secondary);line-height:1.5">${item.tip}</div>
            </div>
          </div>`;
        }).join('')}
        <div style="text-align:center;margin-top:12px;padding:10px;background:linear-gradient(135deg,rgba(232,82,122,0.08),rgba(167,139,250,0.05));border-radius:12px">
          <div style="font-size:13px;font-weight:700">馃搳 鍏ㄥぉ缇庨鎬绘憚鍏?/div>
          <div style="font-size:20px;font-weight:900;color:var(--accent-peach);margin-top:4px">${BEAUTY_TIMELINE.reduce((s,i)=>s+i.kcal,0)} <span style="font-size:12px">kcal</span></div>
          <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">鍚冮ケ+鍙樼編+鎺夌Г 涓夊悎涓€ 鉁?/div>
        </div>
      </div>
    ` : `
      <div class="profile-section">
        <div class="section-title"><span class="icon">馃懁</span>鍩烘湰淇℃伅</div>
        <div class="form-grid">
          <div class="form-group">
            <span class="form-label">骞撮緞</span>
            <input type="number" class="form-input" id="inputAge" value="${state.profile.age}" min="16" max="80"/>
          </div>
          <div class="form-group">
            <span class="form-label">韬珮(cm)</span>
            <input type="number" class="form-input" id="inputHeight" value="${state.profile.height}" min="140" max="200"/>
          </div>
          <div class="form-group">
            <span class="form-label">浣撻噸(kg)</span>
            <input type="number" class="form-input" id="inputWeight" value="${state.profile.weight}" min="35" max="150"/>
          </div>
          <div class="form-group">
            <span class="form-label">鐩爣</span>
            <select class="form-select" id="inputGoal">
              <option value="lose" ${state.profile.goal==='lose'?'selected':''}>鍑忚剛濉戝舰</option>
              <option value="maintain" ${state.profile.goal==='maintain'?'selected':''}>缁存寔浣撻噸</option>
              <option value="gain" ${state.profile.goal==='gain'?'selected':''}>澧炶倢澧為噸</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="profile-section">
        <div class="section-title"><span class="icon">馃拵</span>缇庡鐩爣 (鍙閫?</div>
        <div class="tag-group" id="skinTags">
          ${['缇庣櫧','鎶楄“','绁涚棙','琛ユ按','娣℃枒','绱ц嚧','绁涙箍','琛ヨ'].map(t =>
            `<div class="tag ${state.profile.skin.includes(t)?'selected':''}" data-tag="${t}">${t}</div>`
          ).join('')}
        </div>
      </div>
      
      <button class="btn-generate" onclick="handleGenerate()">
        <span class="shimmer"></span>
        鉁?涓€閿敓鎴愪粖鏃ラ璋?      </button>
    `}
  `;
}

function renderMealCard(meal, idx) {
  const totalKcal = meal.items.reduce((s,i) => s+i.kcal, 0);
  const tip = idx === 0 && state.todayMeals.beautyTip ? state.todayMeals.beautyTip : null;
  return `
    <div class="meal-card" style="animation-delay:${idx*0.1}s">
      <div class="meal-header">
        <div class="meal-type">
          <span class="meal-emoji">${meal.emoji}</span>
          <div><div class="meal-name">${meal.type}</div><div class="meal-time">${meal.time}</div></div>
        </div>
        <div class="meal-cal">${totalKcal} kcal</div>
      </div>
      <div class="meal-body">
        ${meal.items.map(item => `
          <div class="food-item">
            <div class="food-info">
              <span class="food-icon">${item.icon}</span>
              <div>
                <div class="food-name">${item.name}</div>
                <div class="food-amount">${item.amount}</div>
                ${item.satiety ? `<div style="font-size:10px;margin-top:2px"><span style="color:var(--accent-mint)">${item.satiety}</span> <span style="font-size:9px;padding:1px 6px;border-radius:8px;background:rgba(110,231,183,0.1);color:var(--accent-mint)">${item.vol}</span></div>` : ''}
              </div>
            </div>
            <div class="food-detail">
              <div class="food-kcal">${item.kcal} kcal</div>
              <div class="food-macro">铔嬬櫧${item.protein}g 路 鑴?{item.fat}g 路 纰?{item.carb}g</div>
            </div>
          </div>
          ${item.tip ? `<div style="font-size:11px;color:var(--accent-lavender);padding:0 0 6px 30px;opacity:0.8">馃挕 ${item.tip}</div>` : ''}
        `).join('')}
        ${tip ? `<div class="beauty-tip"><div class="beauty-tip-title">馃挕 ${tip.title}</div><div class="beauty-tip-text">${tip.text}</div></div>` : ''}
        <div class="order-actions">
          <button class="btn-order btn-meituan" onclick="openOrder('meituan','${meal.type}')">馃煛 缇庡洟澶栧崠</button>
          <button class="btn-order btn-eleme" onclick="openOrder('eleme','${meal.type}')">馃數 楗夸簡涔?/button>
        </div>
      </div>
    </div>
  `;
}

function renderAutoOrderPanel() {
  return `
    <div class="auto-order-panel">
      <div class="auto-order-header">
        <div class="auto-order-title">馃 鎳掍汉鑷姩鐐归</div>
        <button class="toggle-switch ${state.autoOrder?'on':''}" onclick="toggleAutoOrder()">
          <div class="toggle-dot"></div>
        </button>
      </div>
      <div class="auto-order-settings">
        <div class="auto-setting">
          <span class="auto-setting-label">榛樿骞冲彴</span>
          <span class="auto-setting-value">缇庡洟澶栧崠</span>
        </div>
        <div class="auto-setting">
          <span class="auto-setting-label">棰勭畻涓婇檺</span>
          <span class="auto-setting-value">楼50/椁?/span>
        </div>
        <div class="auto-setting">
          <span class="auto-setting-label">鑷姩涓嬪崟鏃堕棿</span>
          <span class="auto-setting-value">椁愬墠30鍒嗛挓</span>
        </div>
      </div>
      <div class="auto-order-status ${state.autoOrder?'active':'inactive'}">
        ${state.autoOrder ? '鉁?鑷姩鐐归宸插紑鍚紝灏嗗湪鐢ㄩ鍓?0鍒嗛挓鑷姩鎼滅储涓嬪崟' : '馃挙 寮€鍚悗灏嗘牴鎹璋辫嚜鍔ㄨ烦杞鍗栧钩鍙扮偣椁?}
      </div>
    </div>
  `;
}

function renderWeekTracker() {
  const days = getWeekDays();
  return `<div class="week-track">
    ${days.map(d => {
      const done = state.weekLog[d.date];
      return `<div class="week-day ${d.isToday?'today':''} ${done?'done':''}">
        <div class="day-label">${d.label}</div>
        <div class="day-cal">${done ? '鉁? : d.isToday ? '浠? : '路'}</div>
      </div>`;
    }).join('')}
  </div>`;
}

// ===== BATH TAB =====
function renderBathTab() {
  const schedule = getBathSchedule(10);
  const current = schedule[0];
  const cycleName = ['娲荤粶绁涢鈶?,'娲荤粶绁涢鈶?,'鎺掓睏鍏婚鈶?,'鎺掓睏鍏婚鈶?,'濡囧仴淇鈶?,'濡囧仴淇鈶?,'娓╄偩鍥哄厓鈶?,'娓╄偩鍥哄厓鈶?,'娓呰偆淇濆仴鈶?,'娓呰偆淇濆仴鈶?];
  
  return `
    <div class="hero-card" style="margin-top:8px">
      <img src="foods.png" class="hero-img" alt="bath"/>
      <div class="hero-overlay">
        <div class="hero-date">鐟舵荡鍏荤敓 路 10鍖呭惊鐜?/div>
        <div class="hero-title">鐟舵荡<em>鎺掓瘨</em>璁″垝</div>
        <div class="hero-sub">娲荤粶绁涢鈫掓帓姹楀吇棰溾啋濡囧仴淇鈫掓俯鑲惧浐鍏冣啋娓呰偆淇濆仴</div>
      </div>
    </div>

    <div class="profile-section" style="background:linear-gradient(145deg,rgba(${hexToRgb(current.color)},0.15),rgba(${hexToRgb(current.color)},0.03)); border-color:${current.color}33">
      <div class="section-title" style="font-size:18px">
        <span style="font-size:32px">${current.icon}</span>
        浠婃棩鎺ㄨ崘锛?{current.name}
      </div>
      <div style="display:grid;gap:10px;margin-bottom:16px">
        <div class="auto-setting"><span class="auto-setting-label">鍔熸晥</span><span class="auto-setting-value" style="color:${current.color}">${current.desc}</span></div>
        <div class="auto-setting"><span class="auto-setting-label">鏁堟灉</span><span class="auto-setting-value" style="color:${current.color}">${current.effect}</span></div>
        <div class="auto-setting"><span class="auto-setting-label">姘存俯</span><span class="auto-setting-value">${current.temp}</span></div>
        <div class="auto-setting"><span class="auto-setting-label">鏃堕暱</span><span class="auto-setting-value">${current.duration}</span></div>
      </div>
      <div class="beauty-tip">
        <div class="beauty-tip-title">馃泚 娉℃荡灏忚创澹?/div>
        <div class="beauty-tip-text">鈶?楗悗1灏忔椂鍐嶆场 鈶?姘翠綅涓嶈秴杩囧績鑴?鈶?娉″悗鍙婃椂琛ユ按 鈶?缁忔湡/瀛曟湡鏆傚仠</div>
      </div>
      <button class="btn-generate" onclick="completeBath()" style="margin-top:16px">
        <span class="shimmer"></span>
        鉁?瀹屾垚浠婃棩鐟舵荡
      </button>
    </div>

    <div class="profile-section">
      <div class="section-title"><span class="icon">馃搮</span>寰幆鎺掔▼ 路 鏈潵10娆?/div>
      ${schedule.map((b,i) => `
        <div class="auto-setting" style="margin-bottom:8px;border-left:3px solid ${b.color};${i===0?'background:rgba(255,255,255,0.04)':''}">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:18px">${b.icon}</span>
            <div>
              <div style="font-size:13px;font-weight:600;color:${b.color}">${cycleName[(state.bathIndex+i)%10]}</div>
              <div style="font-size:11px;color:var(--text-secondary)">${b.date.toLocaleDateString('zh-CN',{month:'short',day:'numeric',weekday:'short'})}</div>
            </div>
          </div>
          <span style="font-size:12px;color:var(--text-secondary)">${i===0?'猬?浠婂ぉ':'绗?+(i+1)+'娆?}</span>
        </div>
      `).join('')}
    </div>

    <div class="profile-section">
      <div class="section-title"><span class="icon">馃搳</span>宸插畬鎴愯繘搴?/div>
      <div style="display:flex;gap:4px;flex-wrap:wrap">
        ${YAO_BATH_CYCLE.map((b,i) => `
          <div style="flex:1;min-width:45px;text-align:center;padding:8px 4px;border-radius:8px;background:${i<state.bathIndex?b.color+'22':'rgba(255,255,255,0.03)'};border:1px solid ${i<state.bathIndex?b.color+'44':'rgba(255,255,255,0.06)'};font-size:10px;color:${i<state.bathIndex?b.color:'var(--text-secondary)'}">
            <div style="font-size:16px">${b.icon}</div>
            ${i<state.bathIndex ? '鉁? : i===state.bathIndex ? '鈫? : '路'}
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

// ===== DATA: Lazy Beauty Methods (researched) =====
const LAZY_METHODS = [
  { rank:1, name:'璋冩暣杩涢椤哄簭', icon:'馃', tag:'馃弳 鎺掑悕绗竴', tagColor:'#fbbf24',
    desc:'鎸?姘粹啋铔嬬櫧璐?鑲夆啋钄彍鈫掔⒊姘?楗?椤哄簭杩涢',
    detail:'鍏堟憚鍏ヨ泲鐧借川鍜岀氦缁村鍔犻ケ瓒虫劅锛岀ǔ瀹氶鍚庤绯栵紝鑷劧鍑忓皯纰虫按鎽勫叆閲忋€傞浂闂ㄦ锛屼粖澶╁氨鑳藉紑濮嬶紒',
    effort:'猸?, effect:'猸愨瓙猸愨瓙猸? },
  { rank:2, name:'椁愬墠涓€鏉按浠紡', icon:'馃挧', tag:'闆舵垚鏈?, tagColor:'#60a5fa',
    desc:'楗墠20-30鍒嗛挓鍠濅竴澶ф澂娓╂按(300ml)',
    detail:'澧炲姞鑳冮儴瀹圭Н鎰燂紝闄嶄綆澶ц剳楗ラタ淇″彿锛岄槻姝㈡棤鎰忚瘑杩囬噺杩涢銆傞厤鍚堟繁鍛煎惛鏁堟灉鏇翠匠銆?,
    effort:'猸?, effect:'猸愨瓙猸愨瓙' },
  { rank:3, name:'16/8闂存瓏鎬ц交鏂', icon:'鈴?, tag:'缁嗚優鑷櫖', tagColor:'#a78bfa',
    desc:'姣忓ぉ鍙湪8灏忔椂绐楀彛鍐呰繘椋?濡?0:00-18:00)',
    detail:'婵€娲荤粏鑳炶嚜鍣?Autophagy)锛屾竻鐞嗗彈鎹熺粏鑳炴垚鍒嗭紝寤剁紦琛拌€?鏀瑰杽鑳板矝绱犳晱鎰熸€с€傛搷浣滅畝鍗曪紝璺宠繃鏃╅鍗冲彲銆?,
    effort:'猸愨瓙', effect:'猸愨瓙猸愨瓙猸? },
  { rank:4, name:'鍦颁腑娴烽ギ椋熸硶', icon:'馃珤', tag:'鏈€鍋ュ悍楗', tagColor:'#34d399',
    desc:'澶氶奔绫?姗勬娌?鍧氭灉+钄灉+鍏ㄨ胺鐗?,
    detail:'瀵屽惈Omega-3銆佸閰氥€佺淮E绛夋姉姘у寲鎴愬垎锛屽噺杞诲叏韬參鎬х値鐥囷紝缁存寔鐨偆鍏夋辰锛屽叕璁ゆ渶鍙寔缁殑鎶楄“楗銆?,
    effort:'猸愨瓙', effect:'猸愨瓙猸愨瓙猸? },
  { rank:5, name:'鎴掗浂椋?鍚硸楗枡', icon:'馃毇', tag:'闅愬舰鏉€鎵?, tagColor:'#ef4444',
    desc:'鐜鎺у埗娉曪細瀹堕噷涓嶄拱闆堕锛屾兂鍚冩椂鍒风墮/鍠濊尪',
    detail:'闆堕涓庡惈绯栭ギ鏂欐槸鐑噺"闅愬舰鐐稿脊"锛屾垝闄ゅ悗姣忔棩鍙交鏉剧渷涓?00-500鍗冨崱锛佺敤鏃犵硸鑼舵按鏇夸唬銆?,
    effort:'猸愨瓙', effect:'猸愨瓙猸愨瓙' },
  { rank:6, name:'灏忓垎瀛愯兌鍘熻泲鐧借偨', icon:'鉁?, tag:'2026鏂拌秼鍔?, tagColor:'#e8527a',
    desc:'閫夋嫨鍒嗗瓙閲?1000閬撳皵椤跨殑鑳跺師铔嬬櫧鑲藉彛鏈?,
    detail:'姣旂尓韫勯浮鐖惛鏀剁巼楂樻暟鍗佸€嶃€傞厤鍚堢淮C鍚屾湇淇冭繘鑷韩鑳跺師鍚堟垚锛屽悓鏃跺仛濂介槻鏅掑噺灏戣兌鍘熼檷瑙ｃ€?,
    effort:'猸?, effect:'猸愨瓙猸愨瓙' },
  { rank:7, name:'鐟舵荡鎺掓瘨寰幆', icon:'馃泚', tag:'浼犵粺鍏荤敓', tagColor:'#fb923c',
    desc:'5绉嶅姛鏁堢懚娴村寘脳2寰幆锛岄殧1-2澶╂场涓€娆?,
    detail:'娓╃儹鎵╁紶姣涘瓟锛屼腑鑽夎嵂鎴愬垎淇冭繘琛€娑插惊鐜拰姹楄吅鍒嗘硨锛屽姞閫熶唬璋㈠簾鐗╂帓鍑恒€傞厤鍚堥鐤楁晥鏋滅炕鍊嶃€?,
    effort:'猸愨瓙', effect:'猸愨瓙猸愨瓙' },
  { rank:8, name:'7-8灏忔椂浼樿川鐫＄湢', icon:'馃槾', tag:'缇庡瑙?, tagColor:'#8b5cf6',
    desc:'淇濊瘉鐫＄湢璐ㄩ噺锛岀潯鍓?灏忔椂涓嶈繘椋?,
    detail:'鐔澧炲姞楗ラタ绱犲垎娉屸啋绗簩澶╂毚椋熼珮鐑噺銆傚厖瓒崇潯鐪犳槸鎵€鏈夊彉缇庡彉鐦︽柟妗堢殑鍩虹锛?,
    effort:'猸?, effect:'猸愨瓙猸愨瓙猸? },
];

// ===== HISTORY TAB =====
function renderHistoryTab() {
  const daysLogged = Object.keys(state.weekLog).length;
  return `
    <div class="profile-section" style="margin-top:8px">
      <div class="section-title"><span class="icon">馃搱</span>鏈懆姒傝</div>
      <div class="stats-bar">
        <div class="stat-item"><div class="stat-value cal">${daysLogged}</div><div class="stat-label">鎵撳崱澶╂暟</div></div>
        <div class="stat-item"><div class="stat-value pro">-0.8</div><div class="stat-label">浣撻噸鍙樺寲kg</div></div>
        <div class="stat-item"><div class="stat-value fat">${state.bathIndex}</div><div class="stat-label">鐟舵荡娆℃暟</div></div>
        <div class="stat-item"><div class="stat-value carb">82</div><div class="stat-label">缇庨鎸囨暟</div></div>
      </div>
    </div>

    <div class="profile-section">
      <div class="section-title" style="font-size:17px"><span class="icon">馃憫</span>2026 鎳掍汉鍙樼編鍙樼槮鏀荤暐</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6">
        缁煎悎鍏ㄧ綉鏈€鏂扮爺绌讹紝涓轰綘绮鹃€?澶ф渶鏈夋晥鐨勬噿浜虹編瀹瑰噺鑴傛硶锛屾寜鏁堟灉鎺掑悕锛?      </div>
      ${LAZY_METHODS.map((m,i) => `
        <div class="meal-card" style="margin-bottom:12px;animation-delay:${i*0.05}s">
          <div class="meal-header" style="border:none">
            <div class="meal-type">
              <span class="meal-emoji">${m.icon}</span>
              <div>
                <div class="meal-name" style="display:flex;align-items:center;gap:6px">
                  ${m.name}
                  <span style="font-size:10px;padding:2px 8px;border-radius:10px;background:${m.tagColor}22;color:${m.tagColor};border:1px solid ${m.tagColor}44">${m.tag}</span>
                </div>
                <div class="meal-time">${m.desc}</div>
              </div>
            </div>
          </div>
          <div class="meal-body" style="padding-top:0">
            <div style="font-size:13px;color:var(--text-secondary);line-height:1.7;margin-bottom:8px">${m.detail}</div>
            <div style="display:flex;gap:16px;font-size:11px">
              <span style="color:var(--accent-mint)">闅惧害: ${m.effort}</span>
              <span style="color:var(--accent-peach)">鏁堟灉: ${m.effect}</span>
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="profile-section">
      <div class="section-title"><span class="icon">馃挕</span>姣忔棩缇庨璐村＋</div>
      ${BEAUTY_TIPS.map(t => `
        <div class="beauty-tip" style="margin-bottom:8px">
          <div class="beauty-tip-title">馃挕 ${t.title}</div>
          <div class="beauty-tip-text">${t.text}</div>
        </div>
      `).join('')}
    </div>
  `;
}

// ===== PROFILE TAB =====
function renderProfileTab() {
  return `
    <div class="profile-section" style="margin-top:8px">
      <div class="section-title"><span class="icon">馃懁</span>涓汉璁剧疆</div>
      <div class="form-grid">
        <div class="form-group">
          <span class="form-label">骞撮緞</span>
          <input type="number" class="form-input" id="inputAge" value="${state.profile.age}"/>
        </div>
        <div class="form-group">
          <span class="form-label">韬珮(cm)</span>
          <input type="number" class="form-input" id="inputHeight" value="${state.profile.height}"/>
        </div>
        <div class="form-group">
          <span class="form-label">浣撻噸(kg)</span>
          <input type="number" class="form-input" id="inputWeight" value="${state.profile.weight}"/>
        </div>
        <div class="form-group">
          <span class="form-label">鐩爣</span>
          <select class="form-select" id="inputGoal">
            <option value="lose" ${state.profile.goal==='lose'?'selected':''}>鍑忚剛濉戝舰</option>
            <option value="maintain" ${state.profile.goal==='maintain'?'selected':''}>缁存寔浣撻噸</option>
            <option value="gain" ${state.profile.goal==='gain'?'selected':''}>澧炶倢澧為噸</option>
          </select>
        </div>
      </div>
      <button class="btn-generate" onclick="saveProfile()" style="margin-top:16px">馃捑 淇濆瓨璁剧疆</button>
    </div>
    <div class="profile-section">
      <div class="section-title"><span class="icon">馃攧</span>鏁版嵁绠＄悊</div>
      <button class="btn-generate" onclick="resetMeals()" style="background:rgba(255,255,255,0.1);box-shadow:none;margin-top:0">馃攧 閲嶆柊鐢熸垚浠婃棩椋熻氨</button>
    </div>
  `;
}

function renderBottomNav() {
  const tabs = [
    { id:'home', icon:'馃彔', label:'椋熻氨' },
    { id:'photo', icon:'馃摳', label:'鎷嶇収' },
    { id:'chat', icon:'馃', label:'AI闂? },
    { id:'history', icon:'馃搳', label:'鏀荤暐' },
    { id:'profile', icon:'馃懁', label:'鎴戠殑' },
  ];
  return `<nav class="bottom-nav">
    ${tabs.map(t => `
      <button class="nav-item ${state.currentTab===t.id?'active':''}" onclick="switchTab('${t.id}')">
        <span class="nav-icon">${t.icon}</span>
        <span>${t.label}</span>
      </button>
    `).join('')}
  </nav>`;
}

function renderOrderModal() {
  return `<div class="modal-overlay" id="orderModal">
    <div class="modal" style="position:relative">
      <button class="btn-close" onclick="closeOrderModal()">鉁?/button>
      <h3>馃摫 璺宠浆澶栧崠骞冲彴</h3>
      <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px" id="orderDesc">姝ｅ湪涓轰綘鎼滅储椋熸潗...</p>
      <div id="orderContent"></div>
    </div>
  </div>`;
}

// ===== EVENT HANDLERS =====
function bindEvents() {
  document.querySelectorAll('#skinTags .tag').forEach(tag => {
    tag.addEventListener('click', () => {
      tag.classList.toggle('selected');
      const val = tag.dataset.tag;
      if (state.profile.skin.includes(val)) {
        state.profile.skin = state.profile.skin.filter(s => s !== val);
      } else {
        state.profile.skin.push(val);
      }
      saveState();
    });
  });
}

function switchTab(tab) {
  state.currentTab = tab;
  renderApp();
  window.scrollTo(0,0);
}

function handleGenerate() {
  // Collect form data
  const age = document.getElementById('inputAge');
  const height = document.getElementById('inputHeight');
  const weight = document.getElementById('inputWeight');
  const goal = document.getElementById('inputGoal');
  if (age) state.profile.age = parseInt(age.value);
  if (height) state.profile.height = parseInt(height.value);
  if (weight) state.profile.weight = parseInt(weight.value);
  if (goal) state.profile.goal = goal.value;
  saveState();
  
  // Show loading
  document.getElementById('loadingOverlay').classList.add('show');
  
  setTimeout(() => {
    generateDayMeals();
    state.weekLog[new Date().toDateString()] = true;
    saveState();
    document.getElementById('loadingOverlay').classList.remove('show');
    renderApp();
  }, 1500);
}

function toggleAutoOrder() {
  state.autoOrder = !state.autoOrder;
  saveState();
  renderApp();
}

function completeBath() {
  markBathDone();
  renderApp();
  // Simple celebration
  const main = document.querySelector('.main');
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(52,211,153,0.2);border:1px solid #34d399;color:#34d399;padding:20px 40px;border-radius:16px;font-size:18px;font-weight:700;z-index:999;backdrop-filter:blur(10px);animation:modalIn 0.3s ease';
  toast.textContent = '馃帀 鐟舵荡瀹屾垚锛佽韩浣撴妫掞紒';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function openOrder(platform, mealType) {
  const modal = document.getElementById('orderModal');
  modal.classList.add('show');
  
  const desc = document.getElementById('orderDesc');
  const content = document.getElementById('orderContent');
  
  const platformName = platform === 'meituan' ? '缇庡洟澶栧崠' : '楗夸簡涔?;
  const platformColor = platform === 'meituan' ? '#ffc700' : '#0091ff';
  
  // Get meal items for search
  const meal = state.todayMeals?.meals.find(m => m.type === mealType);
  const searchTerms = meal ? meal.items.map(i => i.name).join(' ') : mealType;
  
  desc.textContent = `姝ｅ湪涓恒€?{mealType}銆嶆悳绱? ${searchTerms}`;
  
  // Build deeplink URLs
  const meituanUrl = `https://waimai.meituan.com/search?query=${encodeURIComponent(searchTerms)}`;
  const elemeUrl = `https://www.ele.me/search?query=${encodeURIComponent(searchTerms)}`;
  const targetUrl = platform === 'meituan' ? meituanUrl : elemeUrl;
  
  content.innerHTML = `
    <div style="text-align:center;padding:20px 0">
      <div style="font-size:48px;margin-bottom:12px">${platform==='meituan'?'馃煛':'馃數'}</div>
      <div style="font-size:16px;font-weight:700;color:${platformColor};margin-bottom:8px">${platformName}</div>
      <div style="font-size:12px;color:var(--text-secondary);margin-bottom:20px">鎼滅储鍏抽敭璇? ${searchTerms}</div>
      <a href="${targetUrl}" target="_blank" style="display:inline-block;padding:12px 32px;background:${platformColor}22;border:1px solid ${platformColor}44;color:${platformColor};border-radius:12px;text-decoration:none;font-weight:700;font-size:14px">
        馃殌 鎵撳紑${platformName}鎼滅储
      </a>
      <div style="margin-top:16px;font-size:11px;color:var(--text-secondary)">
        鎵嬫満绔皢鑷姩鍞よ捣${platformName}APP<br/>
        鐢佃剳绔皢鎵撳紑缃戦〉鐗?      </div>
    </div>
  `;
}

function closeOrderModal() {
  document.getElementById('orderModal').classList.remove('show');
}

function saveProfile() {
  const age = document.getElementById('inputAge');
  const height = document.getElementById('inputHeight');
  const weight = document.getElementById('inputWeight');
  const goal = document.getElementById('inputGoal');
  if (age) state.profile.age = parseInt(age.value);
  if (height) state.profile.height = parseInt(height.value);
  if (weight) state.profile.weight = parseInt(weight.value);
  if (goal) state.profile.goal = goal.value;
  saveState();
  
  const toast = document.createElement('div');
  toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(232,82,122,0.2);border:1px solid var(--accent-rose);color:var(--accent-rose);padding:20px 40px;border-radius:16px;font-size:16px;font-weight:700;z-index:999;backdrop-filter:blur(10px);animation:modalIn 0.3s ease';
  toast.textContent = '鉁?璁剧疆宸蹭繚瀛?;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 1500);
}

function resetMeals() {
  state.todayMeals = null;
  saveState();
  state.currentTab = 'home';
  renderApp();
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  renderApp();
});



