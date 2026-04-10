/* ============================================
   DIVINATION.JS — 占卜系统 v2.0
   三牌阵：过去 · 现在 · 未来
   ────────────────────────────────────
   核心改动：
   1. 科目精准 — 政治牌占政治、英语牌占英语
   2. 翻牌出题 — 每翻一张牌触发该科目答题
   3. 业力录联动 — 过去牌优先从错题本抽题
   ============================================ */

class DivinationSystem {
    constructor() {
        this.slots = [null, null, null];
        this.revealed = [false, false, false];
        this.slotLabels = ['过去', '现在', '未来'];
        this.prophecies = [];
        this.divinationResults = [null, null, null]; // 每张牌的答题结果
        this.targetSubject = null; // 占卜指定科目
    }

    /**
     * 生成科目精准的三牌阵
     * @param {number|null} subject - 指定科目(101/201/301/408)，null则根据手牌分析
     */
    generateSpread(subject = null) {
        this.targetSubject = subject;

        // ═══ 科目精准匹配 ═══
        let pool;
        if (subject) {
            // 指定科目：从该科目的大阿尔卡那+小阿尔卡那中抽
            const majorPool = MAJOR_ARCANA.filter(c => c.subject === subject);
            const suitKey = Object.entries(SUIT_CONFIG).find(([_, v]) => v.subject === subject)?.[0];
            const minorPool = suitKey ? MINOR_ARCANA.filter(c => c.suit === suitKey) : [];
            pool = [...majorPool, ...minorPool];
        } else {
            // 未指定：根据手牌中最多的科目来分配
            if (typeof game !== 'undefined' && game.hand.length > 0) {
                const subjectCounts = {};
                game.hand.forEach(c => {
                    subjectCounts[c.subject] = (subjectCounts[c.subject] || 0) + 1;
                });
                const topSubject = parseInt(Object.entries(subjectCounts)
                    .sort((a, b) => b[1] - a[1])[0][0]);
                this.targetSubject = topSubject;

                const majorPool = MAJOR_ARCANA.filter(c => c.subject === topSubject);
                const suitKey = Object.entries(SUIT_CONFIG).find(([_, v]) => v.subject === topSubject)?.[0];
                const minorPool = suitKey ? MINOR_ARCANA.filter(c => c.suit === suitKey) : [];
                pool = [...majorPool, ...minorPool];
            } else {
                pool = [...MAJOR_ARCANA];
            }
        }

        // 确保池子有足够的牌
        if (pool.length < 3) {
            pool = [...MAJOR_ARCANA, ...pool];
        }

        const shuffled = pool.sort(() => Math.random() - 0.5);

        // ═══ 过去牌优先业力录科目 ═══
        let pastCard = shuffled[0];
        if (typeof game !== 'undefined' && game.battle.karmaBook.length > 0) {
            const karmaSubjects = [...new Set(game.battle.karmaBook.map(q => q.subject))];
            if (karmaSubjects.length > 0) {
                const karmaSubject = karmaSubjects[Math.floor(Math.random() * karmaSubjects.length)];
                const karmaCards = [...MAJOR_ARCANA, ...MINOR_ARCANA].filter(c => c.subject === karmaSubject);
                if (karmaCards.length > 0) {
                    pastCard = karmaCards[Math.floor(Math.random() * karmaCards.length)];
                }
            }
        }

        this.slots = [
            { ...pastCard, orientation: getOrientation(), slotRole: '过去' },
            { ...shuffled[1], orientation: getOrientation(), slotRole: '现在' },
            { ...shuffled[2], orientation: getOrientation(), slotRole: '未来' }
        ];

        // 确保三张牌不重复
        const usedIds = new Set();
        for (let i = 0; i < 3; i++) {
            while (usedIds.has(this.slots[i].id)) {
                const replacement = [...MAJOR_ARCANA, ...MINOR_ARCANA]
                    .filter(c => !usedIds.has(c.id))
                    .sort(() => Math.random() - 0.5)[0];
                if (replacement) {
                    this.slots[i] = { ...replacement, orientation: getOrientation(), slotRole: this.slotLabels[i] };
                } else break;
            }
            usedIds.add(this.slots[i].id);
        }

        this.revealed = [false, false, false];
        this.divinationResults = [null, null, null];
    }

    /**
     * 翻牌 + 出题
     */
    revealCard(index) {
        if (this.revealed[index]) return;
        this.revealed[index] = true;

        const card = this.slots[index];
        const slot = document.getElementById(`div-slot-${index}`);
        const front = document.getElementById(`div-front-${index}`);

        if (!slot || !front || !card) return;

        const isReversed = card.orientation === 'reversed';
        const subjectName = getSubjectName(card.subject);
        const subjectIcon = getSubjectIcon(card.subject);

        front.innerHTML = `
            <div class="div-card-icon" style="${isReversed ? 'transform:rotate(180deg)' : ''}">${card.icon}</div>
            <div class="div-card-name">${card.nameEn.toUpperCase()}</div>
            <div class="div-card-name-cn">${card.nameCn}</div>
            <div class="div-card-position ${card.orientation}">${isReversed ? 'REVERSED 逆位' : 'UPRIGHT 正位'}</div>
            <div class="div-card-meaning">${subjectIcon} ${subjectName}<br>${card.topic}</div>
        `;

        slot.classList.add('revealed');

        if (typeof particleEngine !== 'undefined') {
            const rect = slot.getBoundingClientRect();
            particleEngine.burst(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                card.color,
                20
            );
        }

        // ═══ 翻牌后触发答题 ═══
        setTimeout(() => this.askDivinationQuestion(index, card), 800);
    }

    /**
     * 占卜答题 — 翻牌即答题
     */
    askDivinationQuestion(index, card) {
        let question = null;

        // 过去牌优先从业力录抽
        if (index === 0 && typeof game !== 'undefined' && game.battle.karmaBook.length > 0) {
            question = game.battle.getKarmaQuestion(card.subject);
        }

        // 如果业力录没得抽，从题库抽
        if (!question) {
            question = getRandomQuestion(card.subject);
        }

        if (!question) {
            // 没有对应科目的题，直接给buff
            this.divinationResults[index] = { correct: true, card };
            this.checkAllRevealed();
            return;
        }

        // 弹出答题Modal（复用战斗的question modal）
        this._showDivinationQuestion(index, card, question);
    }

    _showDivinationQuestion(index, card, question) {
        const modal = document.getElementById('question-modal');
        const subjectEl = document.getElementById('modal-subject');
        const cardInfoEl = document.getElementById('modal-card-info');
        const textEl = document.getElementById('question-text');
        const optionsEl = document.getElementById('question-options');
        const diffEl = document.getElementById('question-diff');
        const resultEl = document.getElementById('question-result');

        const roleLabel = this.slotLabels[index];
        subjectEl.innerHTML = `<span class="subject-icon">${getSubjectIcon(card.subject)}</span><span>【${roleLabel}】${card.subject} - ${getSubjectName(card.subject)}</span>`;
        cardInfoEl.innerHTML = `<span>🔮 占卜 · ${card.nameCn} · ${card.topic}</span>`;

        diffEl.innerHTML = `<span>${getDifficultyStars(question.difficulty)}</span><span class="diff-label">${getDifficultyLabel(question.difficulty)}</span>`;
        textEl.textContent = question.text;

        optionsEl.innerHTML = '';
        for (const [letter, text] of Object.entries(question.options)) {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.dataset.option = letter;
            btn.innerHTML = `<span class="option-letter">${letter}</span><span class="option-text">${text}</span>`;
            btn.addEventListener('click', () => this._answerDivinationQuestion(index, card, question, letter));
            optionsEl.appendChild(btn);
        }

        resultEl.style.display = 'none';
        modal.classList.add('active');

        // 占卜答题也有计时（20秒，比战斗短）
        if (typeof game !== 'undefined') {
            game.battle.startTimer(20);
            // 超时处理
            const originalAnswer = game.battle.answerQuestion.bind(game.battle);
            game.battle._divTimerCallback = () => {
                this._answerDivinationQuestion(index, card, question, null);
            };
        }
    }

    _answerDivinationQuestion(index, card, question, selectedOption) {
        // 停止计时
        if (typeof game !== 'undefined' && game.battle.timerInterval) {
            clearInterval(game.battle.timerInterval);
        }

        const isCorrect = selectedOption === question.answer;

        // 更新统计
        if (typeof game !== 'undefined') {
            game.battle.totalAnswered++;
            if (isCorrect) game.battle.totalCorrect++;

            // 错题管理
            if (!isCorrect) {
                game.battle.addToKarmaBook(question, card.subject);
            } else {
                game.battle.removeFromKarmaBook(question.id);
            }
            game.battle.saveProgress();
        }

        // 显示答题结果
        const optionBtns = document.querySelectorAll('#question-options .option-btn');
        optionBtns.forEach(btn => {
            btn.disabled = true;
            btn.style.pointerEvents = 'none';
            if (btn.dataset.option === question.answer) btn.classList.add('correct');
            else if (btn.dataset.option === selectedOption && !isCorrect) btn.classList.add('wrong');
        });

        const resultEl = document.getElementById('question-result');
        const resultIcon = document.getElementById('result-icon');
        const resultText = document.getElementById('result-text');
        const resultDmg = document.getElementById('result-damage');

        if (isCorrect) {
            resultIcon.textContent = '✓';
            resultIcon.className = 'result-icon success';
            resultText.textContent = `占卜成功！${card.nameCn}之力已觉醒`;
            resultDmg.textContent = `+增益 BUFF`;
            resultDmg.className = 'result-damage positive';
        } else {
            resultIcon.textContent = '✗';
            resultIcon.className = 'result-icon failure';
            resultText.textContent = selectedOption === null
                ? `时间耗尽！答案是 ${question.answer}。${question.explain || ''}`
                : `答错了！答案是 ${question.answer}。${question.explain || ''}`;
            resultDmg.textContent = '已记入业力录';
            resultDmg.className = 'result-damage negative';
        }
        resultEl.style.display = 'block';

        this.divinationResults[index] = { correct: isCorrect, card };

        // 关闭答题Modal，检查是否全部翻完
        setTimeout(() => {
            document.getElementById('question-modal').classList.remove('active');
            this.checkAllRevealed();
        }, 2000);
    }

    checkAllRevealed() {
        if (this.revealed.every(r => r)) {
            setTimeout(() => this.showProphecy(), 500);
        }
    }

    showProphecy() {
        const prophecy = this.generateProphecyText();
        const container = document.getElementById('divination-prophecy');
        const text = document.getElementById('prophecy-text');

        if (container && text) {
            text.textContent = '';
            container.style.display = 'block';

            const fullText = prophecy;
            let charIndex = 0;
            const typeWriter = () => {
                if (charIndex < fullText.length) {
                    text.textContent += fullText[charIndex];
                    charIndex++;
                    setTimeout(typeWriter, 30);
                }
            };
            typeWriter();
        }
    }

    generateProphecyText() {
        const past = this.slots[0];
        const present = this.slots[1];
        const future = this.slots[2];

        const correctCount = this.divinationResults.filter(r => r && r.correct).length;
        const resultPrefix = correctCount === 3
            ? '🌟 三牌全通！命运之力全面觉醒！'
            : correctCount === 2
                ? '✨ 双牌觉醒，命运指引清晰。'
                : correctCount === 1
                    ? '⚡ 单牌觉醒，仍需精进。'
                    : '💫 虽未觉醒，占卜依然揭示真相。';

        const prophecyTemplates = [
            `「${past.nameCn}」揭示你在${getSubjectName(past.subject)}·${past.topic}中的根基。「${present.nameCn}」指引当前应专注于${getSubjectName(present.subject)}·${present.topic}的修炼。而「${future.nameCn}」预言——若能突破${getSubjectName(future.subject)}·${future.topic}的壁障，命运将为你开启通往彼岸的道路。`,
            `过去之牌「${past.nameCn}」暗示你在${getSubjectName(past.subject)}领域的${past.topic}积累将成为基石。此刻「${present.nameCn}」${present.orientation === 'reversed' ? '以逆位降临，警告你需要直面' : '以正位守护你，坚定'}${getSubjectName(present.subject)}·${present.topic}的方向。未来的「${future.nameCn}」预示着${getSubjectName(future.subject)}·${future.topic}将是你突破的关键。`,
            `命运之轮显示：你曾在「${past.nameCn}」(${getSubjectName(past.subject)})的试练中${past.orientation === 'reversed' ? '经历挫折' : '获得启示'}。当下「${present.nameCn}」的力量正在苏醒——${getSubjectName(present.subject)}·${present.topic}将是你今日的战场。而「${future.nameCn}」的${future.orientation === 'reversed' ? '逆位预兆着风暴将至' : '正位预示着胜利的光芒'}，${getSubjectName(future.subject)}·${future.topic}的奥秘等待你去解开。`
        ];

        // 业力录提示
        let karmaHint = '';
        if (typeof game !== 'undefined' && game.battle.karmaBook.length > 0) {
            const bySubject = {};
            game.battle.karmaBook.forEach(q => {
                const name = getSubjectName(q.subject);
                bySubject[name] = (bySubject[name] || 0) + 1;
            });
            const breakdown = Object.entries(bySubject).map(([k, v]) => `${k}:${v}题`).join('、');
            karmaHint = `\n\n📖 业力录：${breakdown}，共${game.battle.karmaBook.length}道错题等待清除。`;
        }

        const template = prophecyTemplates[Math.floor(Math.random() * prophecyTemplates.length)];
        return `${resultPrefix}\n\n${template}${karmaHint}`;
    }

    applyBuffs(battleEngine) {
        for (let i = 0; i < this.slots.length; i++) {
            const card = this.slots[i];
            const result = this.divinationResults[i];
            if (!card || !result) continue;

            // 只有答对才给buff
            if (result.correct) {
                const effect = card.orientation === 'upright' ? card.upright : card.reversed;
                switch (effect.effect) {
                    case 'heal':
                    case 'hope':
                        battleEngine.healPlayer(Math.floor(battleEngine.playerMaxHP * 0.1));
                        battleEngine.addLog(`占卜增益：「${card.nameCn}」恢复 10% HP`, 'chain');
                        break;
                    case 'power':
                    case 'precise':
                        battleEngine.addLog(`占卜增益：「${card.nameCn}」下次攻击伤害+20%`, 'chain');
                        break;
                    case 'reveal':
                        battleEngine.addLog(`占卜增益：「${card.nameCn}」揭示 Boss 弱点科目`, 'chain');
                        break;
                    default:
                        battleEngine.healPlayer(Math.floor(battleEngine.playerMaxHP * 0.05));
                        battleEngine.addLog(`占卜增益：「${card.nameCn}」恢复 5% HP`, 'chain');
                }
            } else {
                battleEngine.addLog(`占卜未觉醒：「${card.nameCn}」答题失败，无增益。`, 'system');
            }
        }
    }

    reset() {
        this.slots = [null, null, null];
        this.revealed = [false, false, false];
        this.divinationResults = [null, null, null];

        for (let i = 0; i < 3; i++) {
            const slot = document.getElementById(`div-slot-${i}`);
            if (slot) slot.classList.remove('revealed');
        }
        const prophecy = document.getElementById('divination-prophecy');
        if (prophecy) prophecy.style.display = 'none';
    }
}
