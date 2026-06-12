/* ============================================================
   百大科创 H5 —— 交互逻辑层（修复版）
   ============================================================ */

console.log('🚀 AI奇妙之旅 H5 启动中...');

// ── 全局状态 ──
var STATE = {
  currentStation: 'home',
  quizIndex: 0,
  quizScore: 0,
  preTestScore: 0,
  preTestIndex: 0,
  postTestScore: 0,
  earnedBadges: [],
  feedingLevel: 0,
  decisionStep: 0,
  biasTrained: { a: false, b: false },
  aiLabUsed: false
};

// ── 页面导航 ──
function navigateTo(stationId) {
  console.log('导航到:', stationId);
  try {
    // 隐藏所有页面
    var pages = document.querySelectorAll('.page');
    for (var i = 0; i < pages.length; i++) {
      pages[i].classList.remove('active');
    }
    // 取消所有导航高亮
    var navs = document.querySelectorAll('.nav-station');
    for (var j = 0; j < navs.length; j++) {
      navs[j].classList.remove('active');
    }
    // 显示目标页面
    var targetPage = document.getElementById('page-' + stationId);
    if (targetPage) {
      targetPage.classList.add('active');
    } else {
      console.warn('页面未找到: page-' + stationId);
    }
    // 高亮导航按钮
    var targetNav = document.querySelector('[data-station="' + stationId + '"]');
    if (targetNav) {
      targetNav.classList.add('active');
    }
    STATE.currentStation = stationId;
    // 初始化各站内容
    if (stationId === 'station1') initStation1();
    if (stationId === 'station2') initStation2();
    if (stationId === 'station3') initStation3();
    if (stationId === 'station4') initStation4();
    if (stationId === 'station5') initStation5();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch(e) {
    console.error('导航错误:', e);
  }
}

// ── 前测弹窗 ──
function showPreTest() {
  console.log('打开前测');
  STATE.preTestScore = 0;
  STATE.preTestIndex = 0;
  showPreTestQuestion();
  var modal = document.getElementById('modal-preTest');
  if (modal) modal.classList.add('show');
}

function showPreTestQuestion() {
  var container = document.getElementById('preTest-content');
  if (!container) return;
  var idx = STATE.preTestIndex;
  if (idx >= PRE_TEST.length) {
    container.innerHTML = '<h3>前测完成！</h3>'
      + '<p style="font-size:18px;margin:20px 0;">你的基线得分：<strong>' + STATE.preTestScore + ' / ' + PRE_TEST.length + '</strong></p>'
      + '<p style="color:#666;">别担心，这只是起点。完成学习后你会看到自己的进步！</p>'
      + '<button class="btn btn-primary" onclick="closePreTest()" style="margin-top:20px;">✨ 开始探索AI世界</button>';
    return;
  }
  var q = PRE_TEST[idx];
  var html = '<p style="color:#999;font-size:13px;">前测 ' + (idx + 1) + ' / ' + PRE_TEST.length + '</p>';
  html += '<p style="font-size:18px;font-weight:700;margin:16px 0;">' + q.question + '</p>';
  html += '<div style="display:flex;flex-direction:column;gap:10px;">';
  for (var i = 0; i < q.options.length; i++) {
    var isMultiStr = q.multi ? 'true' : 'false';
    html += '<button class="quiz-option" onclick="answerPreTest(' + i + ', ' + isMultiStr + ')">' + q.options[i] + '</button>';
  }
  html += '</div>';
  container.innerHTML = html;
}

function answerPreTest(index, isMulti) {
  var q = PRE_TEST[STATE.preTestIndex];
  var correct = false;
  if (isMulti) {
    correct = (q.correct.indexOf(index) !== -1);
  } else {
    correct = (index === q.correct);
  }
  if (correct) STATE.preTestScore++;
  STATE.preTestIndex++;
  showPreTestQuestion();
}

function closePreTest() {
  var modal = document.getElementById('modal-preTest');
  if (modal) modal.classList.remove('show');
  navigateTo('station1');
}

// ── 第一站：AI的时间轴 ──
function initStation1() {
  var grid = document.getElementById('timeline-grid');
  if (!grid || grid.children.length > 0) return;
  var html = '';
  for (var i = 0; i < TIMELINE.length; i++) {
    var era = TIMELINE[i];
    html += '<div class="card" onclick="selectTimelineCard(this, \'' + era.id + '\')" data-era="' + era.id + '">';
    html += '<div class="card-year">' + era.image + ' ' + era.year + '</div>';
    html += '<div class="card-title">' + era.title + '</div>';
    html += '<div class="card-desc">' + era.event + '</div>';
    html += '<div style="margin-top:10px;font-size:14px;color:#555;">' + era.story + '</div>';
    html += '<div class="card-easter">' + era.easter + '</div>';
    html += '</div>';
  }
  grid.innerHTML = html;
  var xiaod = document.getElementById('xiaod-station1');
  if (xiaod) xiaod.textContent = XIAOD_DIALOGUES.station1;
}

function selectTimelineCard(card, eraId) {
  var wasSelected = card.classList.contains('selected');
  var cards = document.querySelectorAll('#timeline-grid .card');
  for (var i = 0; i < cards.length; i++) cards[i].classList.remove('selected');
  if (!wasSelected) card.classList.add('selected');
}

// ── 第二站：AI的大脑 ──
function initStation2() {
  var xiaod = document.getElementById('xiaod-station2');
  if (xiaod) xiaod.textContent = XIAOD_DIALOGUES.station2;
  STATE.feedingLevel = 0;
  STATE.decisionStep = 0;
  STATE.biasTrained = { a: false, b: false };
  updateFeedingDisplay();
  resetDecisionTree();
  resetBiasLab();
}

function feedData(level) {
  STATE.feedingLevel = level;
  updateFeedingDisplay();
}

function updateFeedingDisplay() {
  var data = FEEDING_DATA[STATE.feedingLevel];
  var modelEl = document.getElementById('feeding-model');
  if (!modelEl) return;
  modelEl.innerHTML = '<div class="model-icon">' + data.icon + '</div>'
    + '<div class="accuracy">' + data.accuracy + '%</div>'
    + '<div class="accuracy-label">识别准确率</div>'
    + '<div class="model-msg">' + data.msg + '</div>';
  var items = document.querySelectorAll('.data-item');
  for (var i = 0; i < items.length; i++) {
    items[i].style.background = (i === STATE.feedingLevel) ? '#E8F0FF' : '#fff';
    items[i].style.borderColor = (i === STATE.feedingLevel) ? '#2B579A' : '#E8EFF8';
  }
  if (STATE.feedingLevel >= 3) {
    var insight = document.getElementById('feeding-insight');
    if (insight) insight.style.display = 'block';
  }
}

// 决策树
function resetDecisionTree() {
  STATE.decisionStep = 0;
  var qEl = document.getElementById('tree-question');
  if (qEl) qEl.textContent = '第1步：天气怎么样？';
  var optsEl = document.getElementById('tree-options');
  if (optsEl) optsEl.innerHTML = '<button class="tree-option" onclick="decideTree(0)">☀️ 晴天（继续判断）</button>'
    + '<button class="tree-option" onclick="decideTree(1)">🌧️ 下雨 → 不适合</button>';
  var resEl = document.getElementById('tree-result');
  if (resEl) resEl.style.display = 'none';
  var vizEl = document.getElementById('tree-viz');
  if (vizEl) vizEl.innerHTML = '<p style="text-align:center;color:#999;">🌳 决策树将在这里动态生长...</p>';
  var insEl = document.getElementById('tree-insight');
  if (insEl) insEl.style.display = 'none';
}

function decideTree(choice) {
  var step = STATE.decisionStep;
  var question, optionsHtml, result;
  if (step === 0) {
    if (choice === 1) {
      result = { type: 'bad', text: '🌧️ 下雨天公园变泥坑，不适合去！在家看书吧~' };
    } else {
      question = '第2步：温度多少？';
      optionsHtml = '<button class="tree-option" onclick="decideTree(0)">🔥 太热（>35°C）→ 不适合</button>'
        + '<button class="tree-option" onclick="decideTree(1)">😊 温暖（15-30°C）→ 继续</button>'
        + '<button class="tree-option" onclick="decideTree(2)">🥶 太冷（<5°C）→ 不适合</button>';
    }
  } else if (step === 1) {
    if (choice === 0 || choice === 2) {
      result = { type: 'bad', text: choice === 0 ? '🔥 太热了！容易中暑，不适合户外活动。' : '🥶 太冷了！公园里没什么好玩的，不适合。' };
    } else {
      question = '第3步：湿度大吗？';
      optionsHtml = '<button class="tree-option" onclick="decideTree(0)">💧 湿度>80%（闷热）→ 不太适合</button>'
        + '<button class="tree-option" onclick="decideTree(1)">🌤️ 湿度<80%（舒适）→ 继续</button>';
    }
  } else if (step === 2) {
    if (choice === 0) {
      result = { type: 'bad', text: '💧 空气太潮湿了，闷热难受，不太适合户外活动。' };
    } else {
      question = '第4步：风力如何？';
      optionsHtml = '<button class="tree-option" onclick="decideTree(0)">💨 大风（>5级）→ 不太适合</button>'
        + '<button class="tree-option" onclick="decideTree(1)">🍃 微风（<5级）→ 完美！</button>';
    }
  } else if (step === 3) {
    if (choice === 0) {
      result = { type: 'bad', text: '💨 风太大了，小心被吹走！今天更适合室内活动。' };
    } else {
      result = { type: 'good', text: '🎉 完美的公园日！晴天、温暖、舒适、微风——带上零食和水，约上朋友出发吧！' };
    }
  }
  if (result) {
    showTreeResult(result);
  } else {
    STATE.decisionStep++;
    var qEl = document.getElementById('tree-question');
    if (qEl) qEl.textContent = question;
    var optsEl = document.getElementById('tree-options');
    if (optsEl) optsEl.innerHTML = optionsHtml;
    updateTreeViz();
  }
}

function showTreeResult(result) {
  var optsEl = document.getElementById('tree-options');
  if (optsEl) optsEl.innerHTML = '';
  var resEl = document.getElementById('tree-result');
  if (resEl) {
    resEl.style.display = 'block';
    var cls = (result.type === 'good') ? 'result-good' : 'result-bad';
    var symbol = (result.type === 'good') ? '✓' : '✗';
    resEl.innerHTML = '<div class="tree-node ' + cls + '"><strong>' + symbol + '</strong> ' + result.text + '</div>'
      + '<button class="btn btn-outline btn-small" onclick="resetDecisionTree()" style="margin-top:16px;">🔄 换一个场景再试试</button>';
  }
  var insEl = document.getElementById('tree-insight');
  if (insEl) insEl.style.display = 'block';
}

function updateTreeViz() {
  var steps = ['天气判断', '温度判断', '湿度判断', '风力判断'];
  var vizEl = document.getElementById('tree-viz');
  if (!vizEl) return;
  var html = '<div style="display:flex;align-items:center;gap:8px;justify-content:center;flex-wrap:wrap;">';
  for (var i = 0; i <= STATE.decisionStep; i++) {
    html += '<span style="background:#4A90D9;color:#fff;padding:4px 12px;border-radius:12px;font-size:12px;">' + steps[i] + '</span>';
    if (i < STATE.decisionStep) html += '<span>→</span>';
  }
  html += '</div>';
  vizEl.innerHTML = html;
}

// 偏见实验室
function resetBiasLab() {
  STATE.biasTrained = { a: false, b: false };
  var ra = document.getElementById('bias-result-a');
  var rb = document.getElementById('bias-result-b');
  if (ra) ra.classList.remove('show');
  if (rb) rb.classList.remove('show');
  var ins = document.getElementById('bias-insight');
  if (ins) ins.style.display = 'none';
}

function trainBias(set) {
  STATE.biasTrained[set] = true;
  var resultEl = document.getElementById('bias-result-' + set);
  if (!resultEl) return;
  resultEl.classList.add('show');
  if (set === 'a') {
    resultEl.className = 'bias-result show biased';
    resultEl.innerHTML = '⚠️ <strong>数据组A训练结果：</strong><br>"程序员都是男的"——女程序员识别准确率仅 12%。<br>这就是数据偏见！';
  } else {
    resultEl.className = 'bias-result show fair';
    resultEl.innerHTML = '✅ <strong>数据组B训练结果：</strong><br>"程序员可以是男的也可以是女的"——女程序员识别准确率 89%。<br>多样化的数据 = 公平的AI！';
  }
  if (STATE.biasTrained.a && STATE.biasTrained.b) {
    var ins = document.getElementById('bias-insight');
    if (ins) ins.style.display = 'block';
  }
}

// ── 第三站：AI实验室 ──
function initStation3() {
  var xiaod = document.getElementById('xiaod-station3');
  if (xiaod) xiaod.textContent = XIAOD_DIALOGUES.station3;
}

function openLabModule(labId) {
  var lab = null;
  for (var i = 0; i < AI_LABS.length; i++) {
    if (AI_LABS[i].id === labId) { lab = AI_LABS[i]; break; }
  }
  if (!lab) return;
  // 取消所有选中
  var modules = document.querySelectorAll('.lab-module');
  for (var j = 0; j < modules.length; j++) modules[j].style.borderColor = 'transparent';
  var targetModule = document.querySelector('[data-lab="' + labId + '"]');
  if (targetModule) targetModule.style.borderColor = '#2B579A';
  // 渲染活动区域
  var area = document.getElementById('lab-active-area');
  if (!area) return;
  var html = '<div class="lab-area"><h3>' + lab.icon + ' ' + lab.title + '</h3>';
  html += '<p class="lab-desc">' + lab.desc + '</p>';
  html += '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">';
  for (var k = 0; k < lab.quickPrompts.length; k++) {
    html += '<button class="btn-outline btn-small" onclick="quickPrompt(\'' + lab.quickPrompts[k] + '\')" style="font-size:12px;">' + lab.quickPrompts[k] + '</button>';
  }
  html += '</div>';
  html += '<div class="lab-input-area">';
  html += '<input type="text" id="lab-input" placeholder="' + lab.placeholder + '" onkeydown="if(event.key===\'Enter\')submitLab(\'' + labId + '\')">';
  html += '<button class="btn btn-primary btn-small" onclick="submitLab(\'' + labId + '\')">发送</button>';
  html += '</div><div class="lab-response" id="lab-response"></div></div>';
  area.innerHTML = html;
}

function quickPrompt(text) {
  var input = document.getElementById('lab-input');
  if (input) input.value = text;
}

function submitLab(labId) {
  var input = document.getElementById('lab-input');
  var response = document.getElementById('lab-response');
  if (!input || !response) return;
  var text = input.value.trim();
  if (!text) return;
  var mockResponses = {
    qa: '🤖 关于"' + text + '"：这是一个很好的问题！让我用简单的方式解释——这背后涉及数据训练和模式识别的原理。简单来说，AI通过分析大量类似数据，学会了其中的规律，所以能回答你的问题。如果你想深入了解，可以试试换个角度再问我~',
    poem: '✍️ 关于"' + text + '"，AI为你创作了一首诗：\n\n《' + text + '》\n数据流转似星河，\n算法织就智慧梭。\n莫道AI是魔法，\n科学深处有清歌。\n\n🌟 你觉得怎么样？试试换个主题，AI还能写出不同风格的诗哦！',
    classify: '🔍 AI识别结果：\n\n这是一张关于"' + text + '"的图片。\n我看到了：形状特征、颜色分布、纹理模式。\n识别置信度：87%\n\n💡 AI通过分析图片中的像素模式来做判断，就像一个超级细心的观察者！',
    game: '🎮 AI模型训练报告：\n\n📊 训练数据已接收：关于"' + text + '"\n🌳 决策树关键分裂点：首先生成根节点，然后根据特征逐层分裂\n📈 预估准确率：约75-85%\n💡 优化建议：增加训练数据量可以进一步提高准确率！\n\n这是你亲手训练的AI模型——感觉怎么样？',
    life: '💡 关于"' + text + '"\n\n📌 首先我理解你的问题是——如何更好地处理这个情况。\n\n📌 建议一：把这个大目标拆成小步骤，一步步来\n📌 建议二：找一个已经做过类似事情的人请教\n📌 建议三：给自己设一个容易达成的小目标，完成后奖励自己\n\n💬 记住：每一个厉害的人，都是从"不知道怎么办"开始的。你已经迈出了第一步！'
  };
  response.classList.add('show');
  response.innerHTML = '<p style="color:#999;">🤖 AI正在思考...</p>';
  var theText = text;
  setTimeout(function() {
    var reply = mockResponses[labId] || mockResponses.qa;
    response.innerHTML = '<p style="white-space:pre-line">' + reply + '</p>';
    STATE.aiLabUsed = true;
  }, 800);
  input.value = '';
}

// ── 第四站：AI大挑战 ──
var QUESTIONS = []; // 选5道题

function initStation4() {
  var xiaod = document.getElementById('xiaod-station4');
  if (xiaod) xiaod.textContent = XIAOD_DIALOGUES.station4;
  if (QUESTIONS.length === 0) {
    // 从题库选5道：第1,4,7,10,14题（每个级别各1题）
    QUESTIONS = [QUIZ_BANK[0], QUIZ_BANK[3], QUIZ_BANK[6], QUIZ_BANK[9], QUIZ_BANK[13]];
  }
  STATE.quizIndex = 0;
  STATE.quizScore = 0;
  STATE.earnedBadges = [];
  updateBadgeWall();
  loadQuizQuestion();
}

function loadQuizQuestion() {
  var container = document.getElementById('quiz-container');
  if (!container) return;
  if (STATE.quizIndex >= QUESTIONS.length) {
    showQuizComplete();
    return;
  }
  var q = QUESTIONS[STATE.quizIndex];
  var html = '<div class="quiz-card">';
  html += '<div class="quiz-level">第 ' + (STATE.quizIndex + 1) + ' 关 / ' + QUESTIONS.length + ' 关 | ' + q.type + '</div>';
  html += '<div class="quiz-question">' + q.question + '</div>';
  html += '<div class="quiz-options">';
  for (var i = 0; i < q.options.length; i++) {
    html += '<button class="quiz-option" onclick="answerQuiz(' + i + ')" id="opt-' + i + '">' + q.options[i] + '</button>';
  }
  html += '</div>';
  html += '<div class="quiz-feedback" id="quiz-feedback"></div>';
  html += '<div class="quiz-next" id="quiz-next" style="display:none;">';
  var nextLabel = (STATE.quizIndex < QUESTIONS.length - 1) ? '下一关 →' : '查看结果 ✨';
  html += '<button class="btn btn-primary" onclick="nextQuiz()">' + nextLabel + '</button>';
  html += '</div></div>';
  container.innerHTML = html;
}

function answerQuiz(chosen) {
  var q = QUESTIONS[STATE.quizIndex];
  var isCorrect = (chosen === q.correct);
  // 禁用所有选项
  for (var i = 0; i < q.options.length; i++) {
    var optBtn = document.getElementById('opt-' + i);
    if (optBtn) optBtn.style.pointerEvents = 'none';
  }
  // 高亮正确答案
  var correctBtn = document.getElementById('opt-' + q.correct);
  if (correctBtn) correctBtn.classList.add('correct');
  if (!isCorrect) {
    var wrongBtn = document.getElementById('opt-' + chosen);
    if (wrongBtn) wrongBtn.classList.add('wrong');
  }
  // 反馈
  var fb = document.getElementById('quiz-feedback');
  if (!fb) return;
  fb.classList.add('show');
  if (isCorrect) {
    STATE.quizScore++;
    STATE.earnedBadges.push(BADGES[STATE.quizIndex].id);
    fb.className = 'quiz-feedback correct show';
    fb.innerHTML = '✅ ' + (XIAOD_DIALOGUES.quizCorrect[STATE.quizScore - 1] || '答对了！');
  } else {
    fb.className = 'quiz-feedback wrong show';
    fb.innerHTML = '❌ 没关系，看看正确答案：<br><br>' + q.explain;
  }
  document.getElementById('quiz-next').style.display = 'block';
  updateBadgeWall();
}

function nextQuiz() {
  STATE.quizIndex++;
  if (STATE.quizIndex >= QUESTIONS.length) {
    showQuizComplete();
  } else {
    loadQuizQuestion();
  }
}

function showQuizComplete() {
  STATE.postTestScore = POST_TEST.length; // 模拟后测满分
  var growth = Math.round((STATE.postTestScore - STATE.preTestScore) / Math.max(STATE.preTestScore, 1) * 100);
  if (STATE.preTestScore === 0) growth = 100;
  var container = document.getElementById('quiz-container');
  if (!container) return;
  var html = '<div class="quiz-card">';
  html += '<h2 style="font-size:28px;color:#1A3A6B;">🎉 恭喜通关！</h2>';
  html += '<p style="font-size:16px;color:#666;margin:12px 0;">' + XIAOD_DIALOGUES.quizComplete + '</p>';
  html += '<div class="growth-display">';
  html += '<div class="growth-title">📊 你的AI知识成长曲线</div>';
  html += '<div class="growth-bars">';
  html += '<div class="growth-bar-wrap"><div class="growth-bar pre" style="height:' + (STATE.preTestScore / 3 * 140) + 'px;"></div><div class="growth-label">前测</div><div class="growth-score">' + STATE.preTestScore + '/3</div></div>';
  html += '<div class="growth-bar-wrap"><div class="growth-bar post" style="height:' + (STATE.postTestScore / 3 * 140) + 'px;"></div><div class="growth-label">后测</div><div class="growth-score">' + STATE.postTestScore + '/3</div></div>';
  html += '</div>';
  html += '<p style="margin-top:16px;font-size:16px;font-weight:700;color:#27AE60;">⬆️ 知识增长：+' + growth + '%！</p>';
  html += '</div>';
  // 徽章墙
  html += '<div class="badge-wall" style="margin:24px 0;">';
  for (var b = 0; b < BADGES.length; b++) {
    html += '<div class="badge-item earned"><div class="badge-icon">' + BADGES[b].icon + '</div><div class="badge-name">' + BADGES[b].name + '</div><div class="badge-desc">' + BADGES[b].desc + '</div></div>';
  }
  html += '</div>';
  // 专属AI伙伴
  html += '<div style="margin-top:24px;padding:24px;background:linear-gradient(135deg,#F5F9FF,#FFF3E6);border-radius:12px;">';
  html += '<h3 style="margin-bottom:12px;">🤖 你的专属AI伙伴</h3>';
  html += '<p style="font-size:14px;color:#666;">选择你最需要的功能：</p>';
  html += '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:16px 0;" id="partner-opts">';
  var partnerOpts = ['帮我整理笔记','给我出数学题','教我写诗','给我推荐书籍','做我的学习闹钟','陪我聊天'];
  for (var p = 0; p < partnerOpts.length; p++) {
    html += '<label style="padding:8px 14px;background:#fff;border-radius:20px;cursor:pointer;font-size:13px;border:1px solid #E8EFF8;"><input type="checkbox" onchange="updatePartner()"> ' + partnerOpts[p] + '</label>';
  }
  html += '</div><div id="partner-card" style="margin-top:16px;"></div></div>';
  html += '</div>';
  container.innerHTML = html;
}

function updatePartner() {
  var card = document.getElementById('partner-card');
  if (!card) return;
  var checked = [];
  var inputs = document.querySelectorAll('#partner-opts input:checked');
  for (var i = 0; i < inputs.length; i++) {
    checked.push(inputs[i].parentElement.textContent.trim());
  }
  if (checked.length === 0) { card.innerHTML = ''; return; }
  card.innerHTML = '<div style="background:#fff;border-radius:12px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);text-align:center;">'
    + '<div style="font-size:48px;">🤖</div>'
    + '<div style="font-size:18px;font-weight:700;color:#1A3A6B;">你的专属AI伙伴：<strong style="color:#2B579A;">小智</strong></div>'
    + '<div style="font-size:13px;color:#666;margin-top:8px;">它最擅长：' + checked.slice(0,3).join('、') + '</div>'
    + '<div style="font-size:14px;color:#666;margin-top:8px;font-style:italic;">"嗨！我是小智，你的学习好伙伴。让我们一起进步吧！"</div></div>';
}

function updateBadgeWall() {
  var wall = document.getElementById('badge-wall');
  if (!wall) return;
  var html = '';
  for (var i = 0; i < BADGES.length; i++) {
    var earned = (STATE.earnedBadges.indexOf(BADGES[i].id) !== -1);
    html += '<div class="badge-item' + (earned ? ' earned' : '') + '">';
    html += '<div class="badge-icon">' + (earned ? BADGES[i].icon : '🔒') + '</div>';
    html += '<div class="badge-name">' + BADGES[i].name + '</div>';
    html += '<div class="badge-desc">' + BADGES[i].desc + '</div>';
    html += '</div>';
  }
  wall.innerHTML = html;
}

// ── 第五站：资源库 ──
function initStation5() {
  var xiaod = document.getElementById('xiaod-station5');
  if (xiaod) xiaod.textContent = XIAOD_DIALOGUES.station5;
}

// ── 初始化入口 ──
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ DOM加载完成');

  // 绑定导航按钮
  var navBtns = document.querySelectorAll('.nav-station');
  for (var i = 0; i < navBtns.length; i++) {
    navBtns[i].addEventListener('click', function() {
      var station = this.getAttribute('data-station');
      if (station) navigateTo(station);
    });
  }

  // 绑定开始按钮
  var btnStart = document.getElementById('btn-start');
  if (btnStart) {
    btnStart.addEventListener('click', function() {
      showPreTest();
    });
    console.log('✅ 开始按钮已绑定');
  } else {
    console.error('❌ 未找到 btn-start 元素');
  }

  // 显示首页
  navigateTo('home');
  console.log('✅ 初始化完成');
});
