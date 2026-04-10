/* ============================================
   BATTLE.JS — 战斗引擎
   ============================================ */

class BattleEngine {
    constructor() {
        this.playerHP = 5000;
        this.playerMaxHP = 5000;
        this.playerSanity = 1110;
        this.playerMaxSanity = 1110;

        this.bossHP = 150000;
        this.bossMaxHP = 150000;
        this.bossName = 'THE ALIGNMENT TAX WATCHDOG';
        this.bossNameCn = '對齊性稅犬';

        this.chain = [];
        this.maxChain = 3;
        this.turn = 0;
        this.selectedCard = null;
        this.isAnswering = false;
        this.currentQuestion = null;
        this.timerInterval = null;
        this.timeLeft = 30;

        this.totalCorrect = parseInt(localStorage.getItem('arcana_totalCorrect') || '0');
        this.totalAnswered = parseInt(localStorage.getItem('arcana_totalAnswered') || '0');

        this.instability = 78;

        // ═══ 业力录 (Karma Book / 错题本) ═══
        this.karmaBook = JSON.parse(localStorage.getItem('arcana_karma_book') || '[]');
    }

    saveProgress() {
        localStorage.setItem('arcana_totalCorrect', this.totalCorrect);
        localStorage.setItem('arcana_totalAnswered', this.totalAnswered);
        localStorage.setItem('arcana_karma_book', JSON.stringify(this.karmaBook));
    }

    // ═══ 错题管理 ═══
    addToKarmaBook(question, subject) {
        // 避免重复
        if (this.karmaBook.find(q => q.id === question.id)) return;
        this.karmaBook.push({ ...question, subject, addedAt: Date.now() });
        // 最多保留 200 题
        if (this.karmaBook.length > 200) this.karmaBook.shift();
        this.saveProgress();
    }

    removeFromKarmaBook(questionId) {
        this.karmaBook = this.karmaBook.filter(q => q.id !== questionId);
        this.saveProgress();
    }

    getKarmaQuestion(subject) {
        const pool = subject
            ? this.karmaBook.filter(q => q.subject === subject)
            : this.karmaBook;
        if (pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    // ---- HP / Sanity Management ----
    damagePlayer(amount) {
        this.playerHP = Math.max(0, this.playerHP - amount);
        this.updatePlayerUI();
        if (this.playerHP <= 0) this.gameOver();
    }

    healPlayer(amount) {
        this.playerHP = Math.min(this.playerMaxHP, this.playerHP + amount);
        this.updatePlayerUI();
    }

    drainSanity(amount) {
        this.playerSanity = Math.max(0, this.playerSanity - amount);
        this.updatePlayerUI();
    }

    damageBoss(amount) {
        this.bossHP = Math.max(0, this.bossHP - amount);
        this.updateBossUI();
        this.showDamagePopup(amount);

        document.getElementById('game-container').classList.add('screen-shake');
        setTimeout(() => document.getElementById('game-container').classList.remove('screen-shake'), 400);

        const bossEl = document.getElementById('boss-character');
        if (bossEl && typeof particleEngine !== 'undefined') {
            const rect = bossEl.getBoundingClientRect();
            particleEngine.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, '#ff2d55', 25);
        }

        if (this.bossHP <= 0) this.victory();
    }

    // ---- UI Updates ----
    updatePlayerUI() {
        const hpPct = (this.playerHP / this.playerMaxHP * 100).toFixed(1);
        const sanPct = (this.playerSanity / this.playerMaxSanity * 100).toFixed(1);

        const hpFill = document.getElementById('player-hp-fill');
        const sanFill = document.getElementById('player-sanity-fill');
        const hpText = document.getElementById('player-hp-text');
        const sanText = document.getElementById('player-sanity-text');
        const topSanity = document.getElementById('top-sanity-fill');

        if (hpFill) hpFill.style.width = hpPct + '%';
        if (sanFill) sanFill.style.width = sanPct + '%';
        if (hpText) hpText.textContent = `${this.playerHP.toLocaleString()} / ${this.playerMaxHP.toLocaleString()}`;
        if (sanText) sanText.textContent = `${this.playerSanity.toLocaleString()} / ${this.playerMaxSanity.toLocaleString()}`;
        if (topSanity) topSanity.style.width = sanPct + '%';
    }

    updateBossUI() {
        const pct = (this.bossHP / this.bossMaxHP * 100).toFixed(1);
        const fill = document.getElementById('boss-hp-fill');
        const text = document.getElementById('boss-hp-text');
        if (fill) fill.style.width = pct + '%';
        if (text) text.textContent = `${this.bossHP.toLocaleString()} / ${this.bossMaxHP.toLocaleString()} HP`;

        this.instability = Math.round((1 - this.bossHP / this.bossMaxHP) * 100);
        const instEl = document.getElementById('instability-val');
        if (instEl) instEl.textContent = this.instability + '%';
    }

    updateChainUI() {
        const chainEl = document.getElementById('chain-cards');
        if (!chainEl) return;
        if (this.chain.length === 0) {
            chainEl.innerHTML = '<span style="color:var(--text-secondary);font-size:10px">无激活链</span>';
        } else {
            chainEl.innerHTML = this.chain.map((c, i) =>
                `<span class="chain-card">${c.nameCn}</span>${i < this.chain.length - 1 ? '<span class="chain-arrow">→</span>' : ''}`
            ).join('');
        }
    }

    showDamagePopup(amount, isCrit = false) {
        const popup = document.createElement('div');
        popup.className = `damage-popup${isCrit ? ' crit' : ''}`;
        popup.textContent = `-${amount.toLocaleString()}`;
        popup.style.color = isCrit ? '#ffd700' : '#ff2d55';

        const bossEl = document.getElementById('boss-character');
        if (bossEl) {
            const rect = bossEl.getBoundingClientRect();
            popup.style.left = (rect.left + rect.width / 2 - 50 + Math.random() * 60) + 'px';
            popup.style.top = (rect.top + Math.random() * 50) + 'px';
        } else {
            popup.style.left = '60%';
            popup.style.top = '30%';
        }

        document.body.appendChild(popup);
        setTimeout(() => popup.remove(), 1200);
    }

    // ---- Battle Log ----
    addLog(message, type = '') {
        const log = document.getElementById('battle-log');
        if (!log) return;
        const now = new Date();
        const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
        const entry = document.createElement('div');
        entry.className = `log-entry${type ? ' log-' + type : ''}`;
        entry.innerHTML = `<span class="log-time">[${time}]</span> ${message}`;
        log.appendChild(entry);
        log.scrollTop = log.scrollHeight;
    }

    // ---- Card Play ----
    playCard(cardData) {
        if (this.isAnswering) return;
        this.isAnswering = true;
        this.selectedCard = cardData;

        this.chain.push(cardData);
        if (this.chain.length > this.maxChain) this.chain.shift();
        this.updateChainUI();

        const orientation = getOrientation();
        const effect = orientation === 'upright' ? cardData.upright : cardData.reversed;

        this.addLog(`<span class="log-player">You:</span> DEPLOYED ${cardData.nameEn.toUpperCase()} (${cardData.numeral}).`);

        this.currentQuestion = getRandomQuestion(cardData.subject);
        this.currentOrientation = orientation;
        this.currentEffect = effect;

        if (this.currentQuestion) {
            this.showQuestionModal(cardData, this.currentQuestion);
        } else {
            this.resolveCardEffect(true, effect);
        }
    }

    // ---- Question Modal ----
    showQuestionModal(cardData, question) {
        const modal = document.getElementById('question-modal');
        const subjectEl = document.getElementById('modal-subject');
        const cardInfoEl = document.getElementById('modal-card-info');
        const textEl = document.getElementById('question-text');
        const optionsEl = document.getElementById('question-options');
        const diffEl = document.getElementById('question-diff');
        const resultEl = document.getElementById('question-result');

        subjectEl.innerHTML = `<span class="subject-icon">${getSubjectIcon(cardData.subject)}</span><span>${cardData.subject} - ${getSubjectName(cardData.subject)}</span>`;
        cardInfoEl.innerHTML = `<span>${cardData.nameEn.toUpperCase()} / ${cardData.nameCn}</span>`;

        diffEl.innerHTML = `<span>${getDifficultyStars(question.difficulty)}</span><span class="diff-label">${getDifficultyLabel(question.difficulty)}</span>`;

        textEl.textContent = question.text;

        optionsEl.innerHTML = '';
        for (const [letter, text] of Object.entries(question.options)) {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.dataset.option = letter;
            btn.innerHTML = `<span class="option-letter">${letter}</span><span class="option-text">${text}</span>`;
            btn.addEventListener('click', () => this.answerQuestion(letter));
            optionsEl.appendChild(btn);
        }

        resultEl.style.display = 'none';
        modal.classList.add('active');
        this.startTimer(30);
    }

    startTimer(seconds) {
        this.timeLeft = seconds;
        const display = document.getElementById('timer-display');
        const circle = document.getElementById('timer-circle');
        const circumference = 2 * Math.PI * 18;

        if (this.timerInterval) clearInterval(this.timerInterval);

        // ═══ FIX P1-6: 重置计时器UI ═══
        if (display) display.textContent = seconds;
        if (circle) {
            circle.style.strokeDashoffset = '0';
            circle.style.stroke = '#00d4ff';
        }

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (display) display.textContent = this.timeLeft;
            if (circle) {
                const offset = circumference * (1 - this.timeLeft / seconds);
                circle.style.strokeDashoffset = offset;
                if (this.timeLeft <= 10) circle.style.stroke = '#ff2d55';
                else circle.style.stroke = '#00d4ff';
            }
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                // 检查是否在占卜答题中
                if (this._divTimerCallback) {
                    this._divTimerCallback();
                    this._divTimerCallback = null;
                } else {
                    this.answerQuestion(null);
                }
            }
        }, 1000);
    }

    answerQuestion(selectedOption) {
        if (!this.isAnswering || !this.currentQuestion) return;
        clearInterval(this.timerInterval);

        const question = this.currentQuestion;
        const isCorrect = selectedOption === question.answer;
        this.totalAnswered++;
        if (isCorrect) this.totalCorrect++;

        // ═══ 错题录入业力录 ═══
        if (!isCorrect && this.selectedCard) {
            this.addToKarmaBook(question, this.selectedCard.subject);
        } else if (isCorrect) {
            // 答对从业力录移除
            this.removeFromKarmaBook(question.id);
        }

        this.saveProgress();

        const optionBtns = document.querySelectorAll('#question-options .option-btn');
        optionBtns.forEach(btn => {
            btn.disabled = true;
            btn.style.pointerEvents = 'none';
            if (btn.dataset.option === question.answer) {
                btn.classList.add('correct');
            } else if (btn.dataset.option === selectedOption && !isCorrect) {
                btn.classList.add('wrong');
            }
        });

        const resultEl = document.getElementById('question-result');
        const resultIcon = document.getElementById('result-icon');
        const resultText = document.getElementById('result-text');
        const resultDmg = document.getElementById('result-damage');

        if (isCorrect) {
            resultIcon.textContent = '✓';
            resultIcon.className = 'result-icon success';
            if (this.currentOrientation === 'upright') {
                resultText.textContent = `正位激活！${this.currentEffect.desc}`;
            } else {
                resultText.textContent = `逆位触发！${this.currentEffect.desc}`;
            }
            const dmg = this.currentEffect.dmg;
            resultDmg.textContent = `-${dmg.toLocaleString()} HP`;
            resultDmg.className = 'result-damage positive';
        } else {
            resultIcon.textContent = '✗';
            resultIcon.className = 'result-icon failure';
            resultText.textContent = selectedOption === null
                ? `时间耗尽！答案是 ${question.answer}。${question.explain}`
                : `答错了！答案是 ${question.answer}。${question.explain}`;
            resultDmg.textContent = '反噬 -500 HP';
            resultDmg.className = 'result-damage negative';
        }

        resultEl.style.display = 'block';

        setTimeout(() => {
            this.resolveCardEffect(isCorrect, this.currentEffect);
            document.getElementById('question-modal').classList.remove('active');
        }, 2500);
    }

    resolveCardEffect(isCorrect, effect) {
        if (isCorrect) {
            const dmg = effect.dmg;
            this.damageBoss(dmg);
            this.addLog(`对 ${this.bossNameCn} 造成 ${dmg.toLocaleString()} 点伤害！`, 'chain');

            if (this.chain.length >= 3) {
                const chainBonus = Math.floor(effect.dmg * 0.5);
                this.damageBoss(chainBonus);
                this.addLog(`链式加成！额外 ${chainBonus.toLocaleString()} 点伤害！`, 'chain');
            }
        } else {
            this.damagePlayer(500);
            this.drainSanity(50);
            this.addLog('牌面反噬！受到 500 点伤害，理智 -50。', 'system');
        }

        this.turn++;
        // ═══ FIX P1-7: Boss已死就不攻击 ═══
        if (this.bossHP > 0) {
            setTimeout(() => this.bossAttack(), 800);
        }
    }

    // ---- Boss AI ----
    bossAttack() {
        const attacks = [
            { name: 'ALIGNMENT CHECK', dmg: 300, msg: 'WatchDog: ALIGNMENT CHECK 发动！' },
            { name: 'RULE ENFORCEMENT', dmg: 500, msg: 'WatchDog: RULE ENFORCEMENT 执行！' },
            { name: 'SANITY DRAIN', dmg: 0, sanity: 100, msg: 'WatchDog: SANITY DRAIN 侵蚀理智！' },
            { name: 'SYSTEM PURGE', dmg: 800, msg: 'WatchDog: SYSTEM PURGE 全面清洗！' }
        ];

        const idx = this.bossHP < this.bossMaxHP * 0.3
            ? Math.floor(Math.random() * 2) + 2
            : Math.floor(Math.random() * attacks.length);

        const attack = attacks[idx];

        if (attack.dmg > 0) this.damagePlayer(attack.dmg);
        if (attack.sanity) this.drainSanity(attack.sanity);

        this.addLog(attack.msg, 'system');
        this.isAnswering = false;
    }

    // ---- Win/Lose ---- ═══ FIX P3-11: 自定义Modal替代alert ═══
    victory() {
        this.addLog('=== BOSS DEFEATED! 胜利！===', 'chain');
        const rate = this.totalAnswered > 0 ? Math.round(this.totalCorrect / this.totalAnswered * 100) : 0;
        setTimeout(() => {
            this._showEndModal('victory',
                '🎉 修 炼 大 成',
                `击败了 ${this.bossNameCn}！`,
                [
                    { label: '答题正确率', value: `${rate}%` },
                    { label: '总答题数', value: this.totalAnswered },
                    { label: '业力录(错题)', value: `${this.karmaBook.length} 题` }
                ]
            );
        }, 1000);
    }

    gameOver() {
        this.addLog('=== GAME OVER ===', 'system');
        const rate = this.totalAnswered > 0 ? Math.round(this.totalCorrect / this.totalAnswered * 100) : 0;
        setTimeout(() => {
            this._showEndModal('defeat',
                '💀 修 炼 失 败',
                '理智或生命耗尽，修炼中断...',
                [
                    { label: '答题正确率', value: `${rate}%` },
                    { label: '总答题数', value: this.totalAnswered },
                    { label: '业力录(错题)', value: `${this.karmaBook.length} 题` }
                ]
            );
        }, 1000);
    }

    _showEndModal(type, title, subtitle, stats) {
        const isVictory = type === 'victory';
        const color = isVictory ? 'var(--neon-gold)' : 'var(--neon-red)';
        const glow = isVictory ? 'var(--glow-gold)' : 'var(--glow-red)';

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay active';
        overlay.style.zIndex = '150';
        overlay.innerHTML = `
            <div class="modal-content" style="max-width:500px;padding:40px 30px;text-align:center;border-color:${color}">
                <div style="font-size:64px;margin-bottom:16px;text-shadow:${glow}">${isVictory ? '🏆' : '💀'}</div>
                <h2 style="font-family:var(--font-cn);font-size:28px;font-weight:900;color:${color};letter-spacing:8px;margin-bottom:8px">${title}</h2>
                <p style="font-family:var(--font-cn);font-size:14px;color:var(--text-secondary);margin-bottom:24px">${subtitle}</p>
                <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:30px">
                    ${stats.map(s => `
                        <div style="display:flex;justify-content:space-between;padding:10px 16px;background:var(--bg-glass);border:var(--border-dim);border-radius:var(--radius-sm)">
                            <span style="font-family:var(--font-display);font-size:10px;color:var(--text-secondary);letter-spacing:1px">${s.label.toUpperCase()}</span>
                            <span style="font-family:var(--font-display);font-size:14px;color:${color};font-weight:700">${s.value}</span>
                        </div>
                    `).join('')}
                </div>
                <button class="action-btn" style="width:100%;justify-content:center;border-color:${color}" onclick="this.closest('.modal-overlay').remove();location.reload();">
                    <span class="btn-icon">${isVictory ? '⚔️' : '🔄'}</span>
                    <span class="btn-label">${isVictory ? '继续挑战' : '重新修炼'}</span>
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
    }
}
