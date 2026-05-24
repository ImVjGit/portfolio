'use strict';

class RAGEngine {
  constructor(options = {}) {
    this.pipelineEl = options.pipelineEl || null;
    this.kb = [];
    this.qaMap = [];
    this.tfidfDocs = [];
    this.idf = {};
    this.vocab = new Set();
    this.ready = false;
  }

  async init() {
    try {
      const [kbRes, qaRes] = await Promise.all([
        fetch('api/knowledge-base.json'),
        fetch('api/qa-map.json')
      ]);
      const kbData = await kbRes.json();
      const qaData = await qaRes.json();
      this.kb = kbData.chunks;
      this.qaMap = qaData.qa;
      this.buildIndex();
      this.ready = true;
      return true;
    } catch (e) {
      console.error('RAG init failed:', e);
      return false;
    }
  }

  tokenize(text) {
    return text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1);
  }

  buildIndex() {
    const docTerms = this.kb.map(c => this.tokenize(c.text));
    const termDocs = {};
    for (let i = 0; i < docTerms.length; i++) {
      const terms = docTerms[i];
      const unique = new Set(terms);
      for (const t of unique) {
        if (!termDocs[t]) termDocs[t] = 0;
        termDocs[t]++;
      }
      this.vocab.add(...terms);
    }
    const N = this.kb.length;
    for (const [term, df] of Object.entries(termDocs)) {
      this.idf[term] = Math.log((N - df + 0.5) / (df + 0.5) + 1) + 1;
    }
    this.tfidfDocs = docTerms.map(terms => {
      const tf = {};
      for (const t of terms) tf[t] = (tf[t] || 0) + 1;
      const vec = {};
      for (const [t, count] of Object.entries(tf))
        vec[t] = (count / terms.length) * (this.idf[t] || 1);
      return vec;
    });
  }

  cosineSim(vecA, vecB) {
    let dot = 0, normA = 0, normB = 0;
    for (const [k, v] of Object.entries(vecA)) { dot += v * (vecB[k] || 0); normA += v * v; }
    for (const v of Object.values(vecB)) normB += v * v;
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  queryVector(query) {
    const terms = this.tokenize(query);
    const tf = {};
    for (const t of terms) tf[t] = (tf[t] || 0) + 1;
    const vec = {};
    for (const [t, count] of Object.entries(tf))
      vec[t] = (count / terms.length) * (this.idf[t] || 0.5);
    return vec;
  }

  findQAMatch(query) {
    const q = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    let best = null, bestScore = 0;
    for (const item of this.qaMap) {
      const qWords = new Set(item.q.toLowerCase().split(/\s+/));
      const queryWords = q.split(/\s+/);
      let matches = 0;
      for (const w of queryWords) if (qWords.has(w)) matches++;
      const score = matches / Math.max(queryWords.length, qWords.size);
      if (score > bestScore) { bestScore = score; best = item; }
    }
    return bestScore > 0.25 ? best : null;
  }

  async fallback(query) {
    const q = query.toLowerCase();
    const tagIndex = {};
    for (const chunk of this.kb) {
      for (const tag of chunk.tags) {
        const words = tag.split(/\s+/);
        for (const w of words) {
          if (!tagIndex[w]) tagIndex[w] = [];
          if (!tagIndex[w].find(c => c.id === chunk.id)) tagIndex[w].push(chunk);
        }
      }
    }
    const terms = q.replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(t => t.length > 1);
    const scored = {};
    for (const t of terms) {
      if (tagIndex[t]) {
        for (const chunk of tagIndex[t]) {
          scored[chunk.id] = (scored[chunk.id] || 0) + 1;
        }
      }
    }
    const sorted = Object.entries(scored).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const bestId = parseInt(sorted[0][0]);
      const chunk = this.kb.find(c => c.id === bestId);
      if (chunk) return [chunk];
    }
    return [];
  }

  async search(query, topK = 3) {
    if (!this.ready) return [];
    this.setStage('archive');
    await this.sleep(150);
    const qVec = this.queryVector(query);
    this.setStage('scanner');
    await this.sleep(150);
    const scored = this.kb.map((chunk, i) => ({
      ...chunk,
      score: this.cosineSim(qVec, this.tfidfDocs[i])
    }));
    scored.sort((a, b) => b.score - a.score);
    let top = scored.slice(0, topK).filter(c => c.score > 0.005);
    if (top.length === 0) {
      top = await this.fallback(query);
    }
    this.setStage('processor');
    await this.sleep(150);
    return top;
  }
  async answer(query) {
    if (!this.ready) return 'Still loading... Give me a moment.';
    this.setStage('question');
    await this.sleep(200);
    const qaHit = this.findQAMatch(query);
    if (qaHit) {
      this.setStage('done');
      await this.sleep(200);
      this.clearPipeline();
      return qaHit.a;
    }
    const results = await this.search(query);
    this.setStage('done');
    await this.sleep(200);
    this.clearPipeline();
    if (results.length === 0) {
      return "I couldn't find a match in Vijay's portfolio. Try asking about his skills, experience, projects, or contact info.";
    }
    return results.map(r => r.text).join('\n\n');
  }

  setStage(stage) {
    if (!this.pipelineEl) return;
    const stages = this.pipelineEl.querySelectorAll('.pipe-stage');
    for (const s of stages) s.classList.remove('pipe-active', 'pipe-done');
    let found = false;
    for (const s of stages) {
      if (found) break;
      s.classList.add('pipe-done');
      if (s.dataset.stage === stage) { s.classList.add('pipe-active'); found = true; }
    }
  }

  clearPipeline() {
    if (!this.pipelineEl) return;
    this.pipelineEl.querySelectorAll('.pipe-stage').forEach(s => s.classList.remove('pipe-active', 'pipe-done'));
  }

  sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
}

if (typeof window !== 'undefined') window.RAGEngine = RAGEngine;
