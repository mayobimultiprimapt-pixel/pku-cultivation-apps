/**
 * PKU Global Vault Loader v2.0
 * Monkey-patches game question functions to prioritize
 * dynamically generated questions from the Dark Web Foundry.
 * 
 * Include this script AFTER the game's main script.
 * It will automatically detect and patch:
 * - getRandomQuestion (ghost-dorm)
 * - askQuestion (siege)  
 * - sQ (battleground)
 */
(function() {
  'use strict';
  
  const SUBJECT_MAP = { 0: '101', 1: '201', 2: '301', 3: '408' };
  
  function getVaultQuestions(subjectId) {
    // Normalize subject ID to string format used in localStorage
    let key = String(subjectId);
    // Handle siege's 0-based indexing
    if (SUBJECT_MAP[key]) key = SUBJECT_MAP[key];
    
    try {
      const raw = localStorage.getItem('Global_Vault_' + key);
      if (!raw) return null;
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr) || arr.length === 0) return null;
      console.log('[VAULT] Loaded ' + arr.length + ' dynamic questions for subject ' + key);
      return arr;
    } catch(e) {
      console.warn('[VAULT] Parse error for subject ' + key + ':', e);
      return null;
    }
  }
  
  function vaultToGameFormat(vq) {
    // Convert vault format {q,o,a,type,difficulty,analysis,chapter,points}
    // to game format {q,opts/o,ans/a,kp,tip,star,type}
    return {
      q: vq.q || 'Unknown question',
      opts: vq.o || vq.opts || [],
      o: vq.o || vq.opts || [],
      ans: (typeof vq.a === 'number') ? vq.a : 0,
      a: (typeof vq.a === 'number') ? vq.a : 0,
      kp: vq.chapter || '',
      tip: vq.analysis || '',
      star: vq.difficulty || 2,
      type: vq.type || 'single',
      points: vq.points || 2
    };
  }
  
  // Wait for DOM and game scripts to load
  window.addEventListener('load', function() {
    
    // === PATCH 1: Ghost Dorm (getRandomQuestion) ===
    if (typeof window.getRandomQuestion === 'function') {
      const _origGRQ = window.getRandomQuestion;
      window.getRandomQuestion = function(subjectId, starRange) {
        const vault = getVaultQuestions(subjectId);
        if (vault) {
          const vq = vault[Math.floor(Math.random() * vault.length)];
          return vaultToGameFormat(vq);
        }
        return _origGRQ(subjectId, starRange);
      };
      console.log('[VAULT] Patched: getRandomQuestion (Ghost Dorm)');
    }
    
    // === PATCH 2: Siege (askQuestion) ===
    if (typeof window.askQuestion === 'function') {
      const _origAQ = window.askQuestion;
      window.askQuestion = function(type) {
        // Siege uses 0-based type index
        const subKey = SUBJECT_MAP[type] || String(type);
        const vault = getVaultQuestions(subKey);
        if (vault) {
          const vq = vault[Math.floor(Math.random() * vault.length)];
          const converted = vaultToGameFormat(vq);
          // Siege expects {q, o, a} format directly
          if (typeof window.showQuiz === 'function') {
            window.showQuiz(converted);
            return;
          }
        }
        return _origAQ(type);
      };
      console.log('[VAULT] Patched: askQuestion (Siege)');
    }
    
    // === PATCH 3: Battleground (QB injection) ===
    if (typeof window.QB !== 'undefined') {
      ['101','201','301','408'].forEach(function(sub) {
        const vault = getVaultQuestions(sub);
        if (vault) {
          const converted = vault.map(vaultToGameFormat);
          if (!window.QB[sub]) window.QB[sub] = [];
          // Prepend vault questions so they appear first
          window.QB[sub] = converted.concat(window.QB[sub]);
          console.log('[VAULT] Injected ' + converted.length + ' questions into QB[' + sub + ']');
        }
      });
    }
    
    console.log('[VAULT] Global Vault Loader v2.0 initialized');
  });
})();
