var PWD="zmqawqw1314",API=window.location.origin;
var BN=["乾","兑","离","震","巽","坎","艮","坤"],BW=["金","金","火","木","木","水","土","土"],BG=["☰","☱","☲","☳","☴","☵","☶","☷"];
var BY={0:[1,1,1],1:[1,1,0],2:[1,0,1],3:[1,0,0],4:[0,1,1],5:[0,1,0],6:[0,0,1],7:[0,0,0]};
var cur=null,stk=[],lyC=0,lyD=[];
var SYS="你是西河派神霄宫嫡传法师，精通正一道全部体系。知识覆盖：数术(梅花易数/六爻纳甲/四柱八字/奇门遁甲/大六壬/小六壬)、符箓(正一符箓画法/符头符胆符脚/各类功用符)、科仪(早晚课/净坛/开坛/步罡踏斗)、雷法(神霄五雷)、内丹(筑基/周天)、经典(道德经/清静经/黄庭经/北斗经)。教学要求：1.纯实干不讲废话 2.直接教操作 3.口诀咒语给完整原文 4.画符精确到每一笔 5.排盘给完整步骤 6.各术可交叉印证 7.禁止客套。";
var C=[
{id:"mh",icon:"🌺",name:"梅花易数",desc:"象数起卦·体用断卦",g:"meihua",
know:["先天八卦数与方位","后天八卦与五行属性","年月日时起卦法(农历)","三数起卦法(上卦÷8下卦÷8动爻÷6)","声音起卦与物占","字占与拆字法","体用关系与生克","互卦变卦推算","卦气旺衰与月建","外应与三要灵应","天时占断法","人事占断法","家宅风水占","婚姻感情占","求财事业占","疾病灾厄占","万物类象赋","观物洞玄歌"]},
{id:"ly",icon:"🎯",name:"六爻纳甲",desc:"铜钱摇卦·六亲断事",g:"liuyao",
know:["装卦与纳甲法","六十四卦归宫","世应安法","六亲(父母兄弟子孙妻财官鬼)","六神(青龙朱雀勾陈腾蛇白虎玄武)","用神取法","原神忌神仇神","日建月建对爻的作用","动爻与变爻","六合六冲","进神退神","飞神伏神","反吟伏吟","测财运详法","测婚姻详法","测疾病详法","测官讼详法","测出行详法","测失物详法","测天气详法"]},
{id:"bz",icon:"📅",name:"四柱八字",desc:"命理推算·运势分析",g:"bazi",
know:["天干(甲乙丙丁戊己庚辛壬癸)","地支(子丑寅卯辰巳午未申酉戌亥)","干支纪年法与排四柱","十神体系(正偏官印财杀枭劫比食伤)","五行旺衰与十二长生","格局分类(正官格/七杀格/正印格等)","用神喜忌判断","大运排法与流年","刑冲合害破","天乙贵人驿马桃花等神煞","婚姻宫与配偶星","财星与财运断法","官星与事业断法","印星与学业断法","食伤与才华断法"]},
{id:"qm",icon:"🔮",name:"奇门遁甲",desc:"三盘推演·趋吉避凶",g:"qimen",
know:["三奇(乙丙丁)六仪(戊己庚辛壬癸)","九宫八卦方位","九星(天蓬天芮天冲天辅天禽天心天柱天任天英)","八门(休生伤杜景死惊开)","八神(值符腾蛇太阴六合白虎玄武九地九天)","阳遁阴遁判断","定局与起局步骤","天地人三盘排法","值符值使确定","十干克应","奇门格局(吉格凶格)","用神取法与断事","出行择吉","求财方位","婚姻合作"]},
{id:"lr",icon:"⏳",name:"大六壬",desc:"三传四课·百占之首",g:"liuren",
know:["天地十二盘","十二天将(贵人腾蛇朱雀六合勾陈青龙天空白虎太常玄武太阴天后)","月将与时辰","起课方法(日干寄宫)","四课排法","三传(初传中传末传)","课格分类","六壬断事要诀","六壬测来意","六壬测吉凶"]},
{id:"xl",icon:"🔑",name:"小六壬",desc:"掌中速断·简易实用",g:"xliuren",
know:["六宫详解：大安(身不动/属木/青龙)","留连(卒未归/属水/玄武)","速喜(人即至/属火/朱雀)","赤口(官事/属金/白虎)","小吉(人来喜/属水/六合)","空亡(音信稀/属土/勾陈)","月上起日日上起时","分类断法与组合","小六壬与梅花结合"]},
{id:"fl",icon:"📿",name:"符箓",desc:"画符用符·开光加持",g:"fulu",
know:["符箓基础：笔墨纸砚朱砂黄纸","画符前准备：沐浴斋戒净手焚香","净坛咒(太上台星应变无停...)","净口神咒(丹朱口神吐秽除氛...)","净身神咒(灵宝天尊安慰身形...)","净心神咒(太上台星应变无停...)","金光神咒(天地玄宗万气本根...)","安土地神咒(元始安镇普告万灵...)","符头画法(三清符头/天罡符头)","符胆画法(敕令/急急如律令)","符脚画法(煞笔封口)","镇宅平安符(完整画法)","催财招财符(完整画法)","护身保命符(完整画法)","姻缘和合符(完整画法)","五雷镇煞符(完整画法)","开光点眼法诀","用符方法(佩戴/焚化/贴用)"]},
{id:"ls",icon:"⚡",name:"雷法",desc:"神霄五雷·驱邪镇煞",g:"leifa",
know:["神霄雷法源流(神霄九辰六天)","五雷正法基础理论","雷祖宝诰(九天应元雷声普化天尊)","行雷步罡法","召将遣兵诀(请神咒语)","雷法驱邪实操","五雷掌诀(手印)","雷法与符箓结合"]},
{id:"nd",icon:"🔥",name:"内丹",desc:"炼精化气·性命双修",g:"neidan",
know:["内丹基础(精气神三宝)","百日筑基功法","静坐入定方法","呼吸吐纳(调息)","炼精化气","小周天运转(任督二脉)","大周天运转","丹田守意与观想"]},
{id:"ky",icon:"🎭",name:"科仪",desc:"朝科晚课·经韵步虚",g:"keyi",
know:["科仪概论与礼仪","早坛功课经(全文及唱诵)","晚坛功课经(全文及唱诵)","净坛科仪(全套流程)","开坛请神科(全套流程)","上香叩拜法(三叩九拜)","祝文疏表写法","供品摆放与禁忌"]},
{id:"bg",icon:"👣",name:"步罡踏斗",desc:"禹步罡步·通天达地",g:"bugang",
know:["禹步三步九迹(详细步法)","北斗七星罡(步法口诀)","天罡步(三十六步)","地罡步(七十二步)","河图洛书罡","存思观想配合","步罡与科仪结合实操"]},
{id:"jg",icon:"📖",name:"经典",desc:"道德经·清静经·黄庭经",g:"jingdian",
know:["道德经核心章节实修应用","清静经逐句解析与打坐配合","黄庭经内景篇(存思身神)","黄庭经外景篇","北斗经(延生保命)","心印妙经(上药三品)","玉皇心印妙经","高上玉皇本行集经"]}
];
function doLogin(){if(document.getElementById("lp").value.trim()===PWD){localStorage.setItem("sx_auth","1");showApp()}else document.getElementById("lerr").textContent="口令错误"}
function showApp(){document.getElementById("loginP").classList.add("hide");document.getElementById("appMain").style.display="";renderHome()}
document.getElementById("lp").onkeydown=function(e){if(e.key==="Enter")doLogin()};
if(localStorage.getItem("sx_auth")==="1")showApp();

// === 导航函数 ===
function ssc(n,t){document.querySelectorAll(".scr").forEach(function(x){x.classList.remove("on")});document.getElementById("s"+n).classList.add("on");document.getElementById("ht").textContent=t||"";document.getElementById("hb").style.display=n>1?"":"none"}
function goBack(){if(stk.length){var p=stk.pop();ssc(p.s,p.t)}else ssc(1,"神霄宫 · 道法实修")}
function switchTab(tab){document.querySelectorAll(".tab-btn").forEach(function(x){x.classList.remove("on")});document.querySelector('[data-tab="'+tab+'"]').classList.add("on");document.querySelectorAll(".tab-pane").forEach(function(x){x.classList.remove("on")});document.getElementById("tp_"+tab).classList.add("on");if(tab==="know")renderKnow();if(tab==="gua")renderGua()}

function renderHome(){var h="";C.forEach(function(c){h+='<div class="ci2" onclick="oc(\''+c.id+'\')"><div style="font-size:28px;margin-bottom:4px">'+c.icon+'</div><div style="font-size:11px;font-weight:700;color:#d4a843">'+c.name+'</div><div style="font-size:8px;color:#8a8070;margin-top:2px">'+c.desc+'</div></div>'});document.getElementById("cg").innerHTML=h}

function oc(id){cur=C.find(c=>c.id===id);if(!cur)return;stk.push({s:1,t:"神霄宫 · 道法实修"});document.getElementById("subIcon").textContent=cur.icon;document.getElementById("subName").textContent=cur.name;document.getElementById("subDesc").textContent=cur.desc;ssc(2,cur.icon+" "+cur.name);switchTab("ask")}

// === 问道 ===
function doAsk(){var q=document.getElementById("askQ").value.trim();if(!q||!cur)return;out("askOut","请教师父中...");askAI(cur.name,q).then(t=>document.getElementById("askOut").innerHTML=fm(t))}
function askAI(t,q){return ds(SYS+"\n学生在【"+t+"】请教："+q)}

// === 典籍 ===
function renderKnow(){if(!cur)return;var IC=["📖","📐","🔮","⚡","🌟","💫","🎯","📿","🔑","☯️","🌙","⭐","🏮","🧿","💠","🪷","📜","🔆"];var h="";cur.know.forEach((k,i)=>{h+='<div class="ti2" onclick="learnTopic('+i+')"><span style="font-size:16px">'+IC[i%IC.length]+'</span><div><div style="font-weight:600;font-size:12px">'+k+'</div><div style="font-size:9px;color:#8a8070">第'+(i+1)+'课</div></div></div>'});document.getElementById("knowList").innerHTML=h}
function learnTopic(i){if(!cur)return;var t=cur.know[i];stk.push({s:2,t:cur.icon+" "+cur.name});out("learnOut","备课中...");ssc(3,t.substring(0,8));askAI(cur.name+"·"+t,"详细教我【"+t+"】的全部内容，要完整口诀原文和实操步骤").then(t=>document.getElementById("learnOut").innerHTML=fm(t))}
function ld(){out("learnOut","深入...");ds(SYS+"\n继续深入刚才的内容，给更多细节口诀注意事项实战经验").then(t=>document.getElementById("learnOut").innerHTML=fm(t))}
function le(){out("learnOut","举例...");ds(SYS+"\n给一个完整实操案例从头到尾演示，要有具体数据和推演过程").then(t=>document.getElementById("learnOut").innerHTML=fm(t))}

// === 起卦/实操 ===
function renderGua(){if(!cur)return;var g=cur.g,h="";
if(g==="meihua")h=`<div class="gc"><div class="gt">梅花易数 · 起卦</div><div id="guaVis"></div><input type="text" id="mhQ" placeholder="心中所问..." class="qi"><div class="qa"><button onclick="mhTime()">🕐 时间卦</button><button onclick="mhNum()">🔢 三数卦</button><button onclick="mhRand()">🎲 随机卦</button><button onclick="mhChar()">✏️ 字占</button></div></div>`;
else if(g==="liuyao")h=`<div class="gc"><div class="gt">六爻 · 摇卦</div><div style="font-size:11px;color:#8a8070;text-align:center">心中默念所问 连摇六次铜钱</div><input type="text" id="lyQ" placeholder="心中所问..." class="qi"><div id="lyLines" style="text-align:center;margin:8px 0;font-size:13px"></div><div class="qa"><button onclick="lyShake()">🪙 摇一爻</button><button onclick="lyAuto()">⚡ 自动摇</button><button onclick="lyReset()">🔄 重摇</button></div></div>`;
else if(g==="bazi")h=`<div class="gc"><div class="gt">四柱八字 · 排盘</div><div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;margin:8px"><input type="number" id="bzY" placeholder="年" class="qi" style="width:65px"><input type="number" id="bzM" placeholder="月" class="qi" style="width:55px"><input type="number" id="bzD" placeholder="日" class="qi" style="width:55px"><input type="number" id="bzH" placeholder="时(0-23)" class="qi" style="width:75px"></div><div class="qa"><button onclick="bzNow()">📅 排当前</button><button onclick="bzCustom()">🎯 排指定</button></div></div>`;
else if(g==="qimen")h=`<div class="gc"><div class="gt">奇门遁甲 · 起局</div><input type="text" id="qmQ" placeholder="所测之事..." class="qi"><div class="qa"><button onclick="qmNow()">🔮 当前时间起局</button></div></div>`;
else if(g==="liuren"||g==="xliuren")h=`<div class="gc"><div class="gt">`+(g==="liuren"?"大六壬":"小六壬")+` · 起课</div><input type="text" id="lrQ" placeholder="所问之事..." class="qi"><div class="qa"><button onclick="lrNow('`+g+`')">🕐 时间起课</button><button onclick="lrRand('`+g+`')">🎲 随机起课</button></div></div>`;
else if(g==="fulu")h=`<div class="gc"><div class="gt">符箓 · 画符实操</div><div class="qa"><button onclick="fuluDraw('镇宅平安符')">🏠 镇宅符</button><button onclick="fuluDraw('催财招财符')">💰 催财符</button><button onclick="fuluDraw('护身保命符')">🛡️ 护身符</button><button onclick="fuluDraw('姻缘和合符')">💕 姻缘符</button><button onclick="fuluDraw('五雷镇煞符')">⚡ 五雷符</button></div><input type="text" id="flQ" placeholder="或输入要画的符名..." class="qi"><div class="qa"><button onclick="fuluCustom()">📿 查画法</button></div></div>`;
else h=`<div class="gc"><div class="gt">`+cur.name+` · 实操</div><input type="text" id="genQ" placeholder="想练习什么..." class="qi"><div class="qa"><button onclick="genPractice()">🎯 开始实操</button></div></div>`;
document.getElementById("guaArea").innerHTML=h+'<div class="ao3" id="guaOut">操作后查看结果...</div>'}

// 梅花 - 时间
function mhTime(){var n=new Date(),y=n.getFullYear(),m=n.getMonth()+1,d=n.getDate(),h=n.getHours();var u=(y+m+d)%8||8,l=(y+m+d+h)%8||8,dg=(y+m+d+h)%6||6;mhShow(u,l,dg,"时间卦："+y+"年"+m+"月"+d+"日"+h+"时")}
// 梅花 - 三数
function mhNum(){var n=prompt("输入三个数字(逗号分隔)如 5,3,7：\n第一数÷8=上卦 第二数÷8=下卦 第三数÷6=动爻");if(!n)return;var p=n.split(/[,，\s]+/);if(p.length<3)return alert("需要三个数字");var a=+p[0],b=+p[1],c=+p[2];if(isNaN(a)||isNaN(b)||isNaN(c))return alert("格式错");mhShow(a%8||8,b%8||8,c%6||6,"三数卦："+a+","+b+","+c)}
// 梅花 - 随机
function mhRand(){mhShow(Math.floor(Math.random()*8)||8,Math.floor(Math.random()*8)||8,Math.floor(Math.random()*6)+1,"随机起卦")}
// 梅花 - 字占
function mhChar(){var s=prompt("输入汉字（1字=笔画÷8得卦÷6得动爻，2字=各取上下卦，多字=前后分）：");if(!s)return;out("guaOut","字占分析中...");askAI("梅花易数·字占","学生写了【"+s+"】字，请按梅花易数字占法：1.数笔画 2.分上下卦 3.定动爻 4.排本卦互卦变卦 5.体用分析 6.断吉凶").then(t=>document.getElementById("guaOut").innerHTML=fm(t))}
function mhShow(u,l,d,info){var g=calcGua(u-1,l-1,d);var vis='<div style="text-align:center;margin:8px 0"><div style="display:flex;justify-content:center;gap:20px;flex-wrap:wrap">';vis+='<div><div style="color:#d4a843;font-size:11px;margin-bottom:4px">本卦</div>'+drawGua(g.ben,d)+'<div style="font-size:11px;color:#8a8070;margin-top:2px">'+BN[u-1]+"上"+BN[l-1]+"下</div></div>";vis+='<div><div style="color:#5bc0be;font-size:11px;margin-bottom:4px">互卦</div>'+drawGua(g.hu,0)+'<div style="font-size:11px;color:#8a8070;margin-top:2px">'+g.huName+"</div></div>";vis+='<div><div style="color:#c23b22;font-size:11px;margin-bottom:4px">变卦</div>'+drawGua(g.bian,0)+'<div style="font-size:11px;color:#8a8070;margin-top:2px">'+g.bianName+"</div></div>";vis+="</div><div style='font-size:10px;color:#8a8070;margin-top:6px'>"+info+" | 体"+BN[l-1]+"("+BW[l-1]+") 用"+BN[u-1]+"("+BW[u-1]+")</div></div>";document.getElementById("guaVis").innerHTML=vis;var q=document.getElementById("mhQ").value.trim()||"问事";out("guaOut","断卦中...");askAI("梅花易数",""+info+"。上卦"+BN[u-1]+"("+BW[u-1]+")下卦"+BN[l-1]+"("+BW[l-1]+")动爻"+d+"。本卦"+BN[u-1]+"上"+BN[l-1]+"下，互卦"+g.huName+"，变卦"+g.bianName+"。所问："+q+"。按步骤断：1.定体用 2.五行生克 3.互卦参考 4.变卦趋势 5.综合吉凶方位时间 6.行动建议").then(t=>document.getElementById("guaOut").innerHTML=fm(t))}

// 六爻
function lyReset(){lyC=0;lyD=[];document.getElementById("lyLines").innerHTML="";document.getElementById("guaOut").innerHTML="开始摇卦..."}
function lyShake(){if(lyC>=6)return alert("已满六爻");var coins=[Math.random()>.5?3:2,Math.random()>.5?3:2,Math.random()>.5?3:2];var s=coins[0]+coins[1]+coins[2];var faces=coins.map(c=>c===3?"⚪":"⚫").join(" ");var tp=s===6?"老阴 ━✖━":s===7?"少阳 ━━━":s===8?"少阴 ━ ━":"老阳 ━○━";lyD.push({sum:s,type:tp,faces:faces});lyC++;var h="";lyD.forEach((d,i)=>{h+="<div>"+["初","二","三","四","五","上"][i]+"爻："+d.faces+" = "+d.sum+" "+d.type+"</div>"});document.getElementById("lyLines").innerHTML=h;if(lyC===6)lyAnalyze()}
function lyAuto(){lyReset();for(var i=0;i<6;i++)lyShake()}
function lyAnalyze(){var q=document.getElementById("lyQ").value.trim()||"问事";var info=lyD.map((d,i)=>["初","二","三","四","五","上"][i]+"爻:"+d.type+"("+d.sum+")").join("，");out("guaOut","六爻断卦中...");askAI("六爻纳甲","摇出六爻："+info+"。所问："+q+"。请：1.装卦(确定是哪卦，归哪宫) 2.安世应 3.配六亲 4.安六神 5.纳甲(配天干地支) 6.找用神 7.看日月建对用神的作用 8.分析动爻变爻 9.综合断语").then(t=>document.getElementById("guaOut").innerHTML=fm(t))}

// 八字
function bzNow(){var n=new Date();out("guaOut","排八字中...");askAI("四柱八字","现在公历"+n.getFullYear()+"年"+(n.getMonth()+1)+"月"+n.getDate()+"日"+n.getHours()+"时。请：1.转农历 2.排年柱月柱日柱时柱(天干地支) 3.排纳音 4.定日主 5.排十神 6.看五行旺衰 7.简析格局 8.排大运").then(t=>document.getElementById("guaOut").innerHTML=fm(t))}
function bzCustom(){var y=document.getElementById("bzY").value,m=document.getElementById("bzM").value,d=document.getElementById("bzD").value,h=document.getElementById("bzH").value;if(!y||!m||!d)return alert("请填年月日");out("guaOut","排八字中...");askAI("四柱八字","出生公历"+y+"年"+m+"月"+d+"日"+(h||"未知")+"时。请排完整四柱八字：1.转农历 2.排年月日时四柱 3.纳音 4.十神 5.五行强弱 6.格局 7.用神 8.大运流年 9.婚姻财运事业简析").then(t=>document.getElementById("guaOut").innerHTML=fm(t))}

// 奇门
function qmNow(){var n=new Date();var q=document.getElementById("qmQ").value.trim()||"问事";out("guaOut","奇门起局中...");askAI("奇门遁甲","现在"+n.getFullYear()+"年"+(n.getMonth()+1)+"月"+n.getDate()+"日"+n.getHours()+"时"+n.getMinutes()+"分。请：1.定节气和阴阳遁 2.定局数 3.排天地人三盘(写出九宫格) 4.填九星八门八神 5.找值符值使 6.取用神。所测："+q).then(t=>document.getElementById("guaOut").innerHTML=fm(t))}

// 六壬
function lrNow(g){var n=new Date();var name=g==="liuren"?"大六壬":"小六壬";var q=document.getElementById("lrQ").value.trim()||"问事";out("guaOut",name+"起课中...");
if(g==="xliuren")askAI("小六壬","现在"+(n.getMonth()+1)+"月"+n.getDate()+"日"+n.getHours()+"时。请：1.月上起日(从大安开始数) 2.日上起时 3.落在哪宫 4.该宫详解(五行六神方位) 5.断："+q).then(t=>document.getElementById("guaOut").innerHTML=fm(t));
else askAI("大六壬","现在"+n.getFullYear()+"年"+(n.getMonth()+1)+"月"+n.getDate()+"日"+n.getHours()+"时。请：1.定月将 2.排天地盘 3.排四课 4.定三传(初中末) 5.安十二天将 6.断："+q).then(t=>document.getElementById("guaOut").innerHTML=fm(t))}
function lrRand(g){var name=g==="liuren"?"大六壬":"小六壬";var q=document.getElementById("lrQ").value.trim()||"问事";out("guaOut","随机起课...");askAI(name,"随机起一课。所问："+q+"。给完整推演过程和断语").then(t=>document.getElementById("guaOut").innerHTML=fm(t))}

// 符箓
function fuluDraw(name){out("guaOut","查询【"+name+"】画法...");askAI("符箓","请教【"+name+"】的完整画法：1.用什么纸什么墨什么朱砂 2.画符前念什么咒(全文) 3.符头怎么画(第几笔写什么) 4.符胆怎么画 5.符身主体内容 6.符脚怎样收笔 7.开光点眼方法 8.使用方法(佩戴/贴/焚化) 9.注意事项禁忌").then(t=>document.getElementById("guaOut").innerHTML=fm(t))}
function fuluCustom(){var q=document.getElementById("flQ").value.trim();if(!q)return;out("guaOut","查询画法...");askAI("符箓","请教【"+q+"】的完整画法：包括需要的材料、画前念诵的咒语全文、符头符胆符身符脚的每一笔画法、开光和使用方法").then(t=>document.getElementById("guaOut").innerHTML=fm(t))}

// 通用实操
function genPractice(){var q=document.getElementById("genQ").value.trim()||cur.name+"基础实操";out("guaOut","准备实操...");askAI(cur.name,"学生要实操【"+q+"】。给完整步骤、口诀原文、手把手从头教到尾").then(t=>document.getElementById("guaOut").innerHTML=fm(t))}

// === 工具函数 ===
function out(id,msg){document.getElementById(id).innerHTML='<span class="sp"></span> '+msg}
function calcGua(u,l,d){u=((u%8)+8)%8;l=((l%8)+8)%8;d=d<1?1:(d>6?6:d);var bu=BY[u],bl=BY[l];var ben=[...bl,...bu];var hu=[ben[1],ben[2],ben[3],ben[2],ben[3],ben[4]];var bian=[...ben];bian[d-1]=bian[d-1]?0:1;return{ben:ben,hu:hu,bian:bian,huName:y2g(hu.slice(3))+"上"+y2g(hu.slice(0,3))+"下",bianName:y2g(bian.slice(3))+"上"+y2g(bian.slice(0,3))+"下"}}
function y2g(y){for(var i=0;i<8;i++){if(BY[i][0]===y[0]&&BY[i][1]===y[1]&&BY[i][2]===y[2])return BN[i]}return"?"}
function drawGua(yao,d){var h="";for(var i=5;i>=0;i--){var line=yao[i]?'<span style="color:#d4a843">━━━━</span>':'<span style="color:#5a5248">━━ ━━</span>';var mk=(i+1===d)?'<span style="color:#c23b22;font-size:9px"> ←动</span>':"";h+='<div style="font-family:monospace;font-size:12px;line-height:1.4">'+line+mk+"</div>"}return h}
function getKey(){var k=localStorage.getItem("openrouter_key");if(!k){k=prompt("请输入OpenRouter API Key (sk-or-v1-...)：");if(k)localStorage.setItem("openrouter_key",k)}return k}
function ds(p){var k=getKey();if(!k)return Promise.resolve("请先设置API Key");return fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+k},body:JSON.stringify({model:"deepseek/deepseek-r1",messages:[{role:"user",content:p}],max_tokens:4096})}).then(function(r){return r.json()}).then(function(d){if(d.choices&&d.choices[0])return d.choices[0].message.content;if(d.error)return "API错误: "+d.error.message;return "未知错误"}).catch(function(e){return fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+k},body:JSON.stringify({model:"deepseek/deepseek-chat",messages:[{role:"user",content:p}],max_tokens:4096})}).then(function(r){return r.json()}).then(function(d){return d.choices&&d.choices[0]?d.choices[0].message.content:"连接失败"}).catch(function(){return "网络错误，请检查网络连接"})})}
function fm(t){if(!t)return"";return t.replace(/\n/g,"<br>").replace(/^### (.+)/gm,'<h3 style="color:#d4a843;margin:6px 0">$1</h3>').replace(/^## (.+)/gm,'<h2 style="color:#d4a843;margin:6px 0">$1</h2>').replace(/^# (.+)/gm,'<h1 style="color:#d4a843;margin:6px 0">$1</h1>').replace(/\*\*(.+?)\*\*/g,'<strong style="color:#5bc0be">$1</strong>')}
