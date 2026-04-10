/* ============================================
   APP.JS v2 — 赛博塔罗占卜台
   核心循环：选科目 → 占卜抽签 → 翻牌 → 答题 → 循环
   ============================================ */

class ArcanaGame {
    constructor() {
        this.selectedSubject = 0; // 0=random
        this.currentCard = null;
        this.currentQuestion = null;
        this.isFlipped = false;
        this.isAnswering = false;
        this.timerInterval = null;
        this.timeLeft = 25;

        // Stats
        this.totalAnswered = parseInt(localStorage.getItem('arcana_totalAnswered') || '0');
        this.totalCorrect = parseInt(localStorage.getItem('arcana_totalCorrect') || '0');
        this.streak = 0;
        this.maxStreak = parseInt(localStorage.getItem('arcana_maxStreak') || '0');

        // Karma Book
        this.karmaBook = JSON.parse(localStorage.getItem('arcana_karma_book') || '[]');

        this.updateStats();
        this.updateTitleVer();
    }

    // ═══ Start ═══
    start() {
        document.getElementById('title-screen').classList.remove('active');
        const totalQ = Object.values(QUESTION_BANK).reduce((s, a) => s + a.length, 0);
        console.log(`🃏 Arcana Academy v2 — ${totalQ} questions loaded`);
    }

    // ═══ Subject Selection ═══
    setSubject(code) {
        this.selectedSubject = code;
        document.querySelectorAll('.subj-pill').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.subject) === code);
        });
    }

    // ═══ DIVINE — Core Action ═══
    divine() {
        if (this.isFlipped || this.isAnswering) return;

        const card3d = document.getElementById('card-3d');
        const btn = document.getElementById('divine-btn');

        // Reset previous state
        card3d.classList.remove('correct', 'wrong', 'shake');
        document.getElementById('result-flash').className = 'result-flash';
        document.getElementById('card-whisper').textContent = '';
        document.getElementById('card-whisper').classList.remove('active');

        // Pick a card based on subject
        this.currentCard = this._pickCard();
        if (!this.currentCard) return;

        // Get question
        this.currentQuestion = this._pickQuestion(this.currentCard.subject);
        if (!this.currentQuestion) {
            document.getElementById('card-whisper').textContent = '该科目暂无题目...';
            return;
        }

        // Set front face content
        this._renderCardFront(this.currentCard);

        // Flip animation
        card3d.classList.add('flipped');
        this.isFlipped = true;
        btn.disabled = true;

        // Particle burst
        if (typeof particleEngine !== 'undefined') {
            const rect = document.getElementById('card-container').getBoundingClientRect();
            particleEngine.burst(
                rect.left + rect.width / 2,
                rect.top + rect.height / 2,
                this.currentCard.color || '#00d4ff',
                30
            );
        }

        // Show whisper
        setTimeout(() => {
            const whisper = document.getElementById('card-whisper');
            const orientation = this.currentCard._orientation;
            const desc = orientation === 'upright'
                ? this.currentCard.upright.desc
                : this.currentCard.reversed.desc;
            whisper.textContent = `${this.currentCard.nameCn} · ${desc}`;
            whisper.classList.add('active');
        }, 600);

        // Show question after flip completes
        setTimeout(() => {
            this._showQuestion(this.currentCard, this.currentQuestion);
        }, 1200);
    }

    _pickCard() {
        let pool;
        if (this.selectedSubject === 0) {
            pool = ALL_CARDS;
        } else {
            pool = ALL_CARDS.filter(c => c.subject === this.selectedSubject);
        }
        if (pool.length === 0) pool = ALL_CARDS;

        const card = { ...pool[Math.floor(Math.random() * pool.length)] };
        card._orientation = getOrientation();
        return card;
    }

    _pickQuestion(subject) {
        // 20% chance from karma book
        if (this.karmaBook.length > 0 && Math.random() < 0.2) {
            const karmaPool = subject
                ? this.karmaBook.filter(q => q.subject === subject)
                : this.karmaBook;
            if (karmaPool.length > 0) {
                return karmaPool[Math.floor(Math.random() * karmaPool.length)];
            }
        }
        return getRandomQuestion(subject);
    }

    _renderCardFront(card) {
        const isReversed = card._orientation === 'reversed';
        document.getElementById('front-numeral').textContent = card.numeral;
        document.getElementById('front-icon').textContent = card.icon;
        document.getElementById('front-icon').style.transform = isReversed ? 'rotate(180deg)' : '';
        document.getElementById('front-name-en').textContent = card.nameEn.toUpperCase();
        document.getElementById('front-name-cn').textContent = card.nameCn;

        const posEl = document.getElementById('front-position');
        posEl.textContent = isReversed ? 'REVERSED 逆位' : 'UPRIGHT 正位';
        posEl.className = `front-position ${card._orientation}`;

        document.getElementById('front-subject').textContent =
            `${getSubjectIcon(card.subject)} ${getSubjectName(card.subject)}`;
        document.getElementById('front-topic').textContent = card.topic || '';

        // Card border color
        const front = document.getElementById('card-front');
        front.style.borderColor = card.color ? card.color + '60' : 'rgba(0,212,255,.3)';
    }

    // ═══ Question Modal ═══
    _showQuestion(card, question) {
        this.isAnswering = true;
        const overlay = document.getElementById('q-overlay');
        const subjectEl = document.getElementById('q-subject');
        const cardInfo = document.getElementById('q-card-info');
        const diffEl = document.getElementById('q-diff');
        const textEl = document.getElementById('q-text');
        const optionsEl = document.getElementById('q-options');
        const resultEl = document.getElementById('q-result');

        subjectEl.textContent = `${getSubjectIcon(card.subject)} ${card.subject} - ${getSubjectName(card.subject)}`;
        cardInfo.textContent = `${card.nameCn} · ${card.topic}`;
        diffEl.textContent = `${getDifficultyStars(question.difficulty)} ${getDifficultyLabel(question.difficulty)}`;
        textEl.textContent = question.text;

        optionsEl.innerHTML = '';
        for (const [letter, text] of Object.entries(question.options)) {
            const btn = document.createElement('button');
            btn.className = 'opt-btn';
            btn.dataset.option = letter;
            btn.innerHTML = `<span class="opt-letter">${letter}</span><span class="opt-text">${text}</span>`;
            btn.addEventListener('click', () => this._answer(letter));
            optionsEl.appendChild(btn);
        }

        resultEl.style.display = 'none';
        overlay.classList.add('active');

        this._startTimer(25);
    }

    _startTimer(seconds) {
        this.timeLeft = seconds;
        const numEl = document.getElementById('timer-num');
        const circle = document.getElementById('timer-circle');
        const circ = 2 * Math.PI * 18;

        if (numEl) numEl.textContent = seconds;
        if (circle) { circle.style.strokeDashoffset = '0'; circle.style.stroke = '#00d4ff'; }

        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            if (numEl) numEl.textContent = this.timeLeft;
            if (circle) {
                circle.style.strokeDashoffset = circ * (1 - this.timeLeft / seconds);
                circle.style.stroke = this.timeLeft <= 8 ? '#ff2d55' : '#00d4ff';
            }
            if (this.timeLeft <= 0) {
                clearInterval(this.timerInterval);
                this._answer(null);
            }
        }, 1000);
    }

    // ═══ Answer ═══
    _answer(selected) {
        if (!this.isAnswering || !this.currentQuestion) return;
        clearInterval(this.timerInterval);
        this.isAnswering = false;

        const q = this.currentQuestion;
        const card = this.currentCard;
        const isCorrect = selected === q.answer;

        this.totalAnswered++;
        if (isCorrect) {
            this.totalCorrect++;
            this.streak++;
            if (this.streak > this.maxStreak) this.maxStreak = this.streak;
        } else {
            this.streak = 0;
        }

        // Karma book
        if (!isCorrect) {
            if (!this.karmaBook.find(k => k.id === q.id)) {
                this.karmaBook.push({ ...q, subject: card.subject, addedAt: Date.now() });
                if (this.karmaBook.length > 200) this.karmaBook.shift();
            }
        } else {
            this.karmaBook = this.karmaBook.filter(k => k.id !== q.id);
        }

        this._saveProgress();

        // Highlight options
        document.querySelectorAll('#q-options .opt-btn').forEach(btn => {
            btn.disabled = true;
            btn.style.pointerEvents = 'none';
            if (btn.dataset.option === q.answer) btn.classList.add('correct');
            else if (btn.dataset.option === selected && !isCorrect) btn.classList.add('wrong');
        });

        // Show result
        const resultEl = document.getElementById('q-result');
        const iconEl = document.getElementById('qr-icon');
        const textEl = document.getElementById('qr-text');
        const explainEl = document.getElementById('qr-explain');

        if (isCorrect) {
            iconEl.textContent = '✓';
            iconEl.className = 'qr-icon success';
            textEl.textContent = `正确！${card._orientation === 'upright' ? '正位觉醒' : '逆位感应'} — 连击 ×${this.streak}`;
            explainEl.textContent = q.explain || '';
        } else {
            iconEl.textContent = '✗';
            iconEl.className = 'qr-icon failure';
            textEl.textContent = selected === null
                ? `时间耗尽！正确答案是 ${q.answer}`
                : `答错了！正确答案是 ${q.answer}`;
            explainEl.textContent = q.explain || '';
        }
        resultEl.style.display = 'block';

        // Close question modal & show card result
        setTimeout(() => {
            document.getElementById('q-overlay').classList.remove('active');
            this._showCardResult(isCorrect);
        }, 2200);
    }

    _showCardResult(isCorrect) {
        const card3d = document.getElementById('card-3d');
        const flash = document.getElementById('result-flash');

        if (isCorrect) {
            card3d.classList.add('correct');
            flash.className = 'result-flash correct';
            if (typeof particleEngine !== 'undefined') {
                const rect = document.getElementById('card-container').getBoundingClientRect();
                particleEngine.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, '#00ff88', 40);
            }
        } else {
            card3d.classList.add('wrong', 'shake');
            flash.className = 'result-flash wrong';
            document.body.classList.add('screen-glitch');
            setTimeout(() => document.body.classList.remove('screen-glitch'), 400);
        }

        this.updateStats();
        this._updateStreak();

        // Auto-reset card after delay
        setTimeout(() => {
            this._resetCard();
        }, 1800);
    }

    _resetCard() {
        const card3d = document.getElementById('card-3d');
        card3d.classList.remove('flipped', 'correct', 'wrong', 'shake');
        document.getElementById('result-flash').className = 'result-flash';
        document.getElementById('card-whisper').textContent = '';
        document.getElementById('card-whisper').classList.remove('active');

        this.isFlipped = false;
        this.currentCard = null;
        this.currentQuestion = null;

        document.getElementById('divine-btn').disabled = false;
    }

    // ═══ UI Updates ═══
    updateStats() {
        document.getElementById('stat-total').textContent = this.totalAnswered;
        document.getElementById('stat-rate').textContent =
            this.totalAnswered > 0 ? Math.round(this.totalCorrect / this.totalAnswered * 100) + '%' : '0%';
        document.getElementById('stat-karma').textContent = this.karmaBook.length;
        document.getElementById('stat-max-streak').textContent = this.maxStreak;
    }

    _updateStreak() {
        const numEl = document.getElementById('streak-num');
        const fireEl = document.getElementById('streak-fire');
        const display = document.getElementById('streak-display');

        numEl.textContent = this.streak;

        if (this.streak >= 5) {
            display.classList.add('hot');
            fireEl.style.transform = 'scale(1.3)';
        } else if (this.streak >= 3) {
            display.classList.add('hot');
            fireEl.style.transform = 'scale(1.1)';
        } else {
            display.classList.remove('hot');
            fireEl.style.transform = 'scale(1)';
        }
    }

    updateTitleVer() {
        const totalQ = Object.values(QUESTION_BANK).reduce((s, a) => s + a.length, 0);
        const ver = document.getElementById('title-ver');
        if (ver) ver.textContent = `v2.0 | 78 ARCANA + ${totalQ} QUESTIONS`;
    }

    _saveProgress() {
        localStorage.setItem('arcana_totalAnswered', this.totalAnswered);
        localStorage.setItem('arcana_totalCorrect', this.totalCorrect);
        localStorage.setItem('arcana_maxStreak', this.maxStreak);
        localStorage.setItem('arcana_karma_book', JSON.stringify(this.karmaBook));
    }
}

// ═══ Initialize ═══
const game = new ArcanaGame();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    const qOverlay = document.getElementById('q-overlay');
    if (qOverlay && qOverlay.classList.contains('active')) return; // Don't interfere with question

    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const title = document.getElementById('title-screen');
        if (title && title.classList.contains('active')) {
            game.start();
        } else {
            game.divine();
        }
    }
    if (e.key >= '1' && e.key <= '5') {
        const subjects = [0, 101, 201, 301, 408];
        game.setSubject(subjects[parseInt(e.key) - 1]);
    }
});

// Click card to divine too
document.getElementById('card-container').addEventListener('click', () => {
    if (!game.isFlipped) game.divine();
});

console.log('🔮 Arcana Academy v2 — Cyber Divination Mode');
console.log('快捷键: Space/Enter=占卜 | 1=随机 2=政治 3=英语 4=数学 5=计算机');
