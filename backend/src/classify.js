const CATEGORIES = ['AI', 'Security', 'Trading', 'Others'];

const KEYWORDS = {
  AI: [
    'ai', 'ml', 'llm', 'gpt', 'claude', 'neural', 'deep learning', 'machine learning',
    'transformer', 'diffusion', 'langchain', 'openai', 'huggingface', 'hugging face',
    'model', 'agent', 'rag', 'embedding', 'chatbot', 'generative', 'stable diffusion',
    'whisper', 'vector', 'pytorch', 'tensorflow', 'computer vision', 'nlp',
    'large language', 'inference', 'training', 'fine-tun', 'prompt', 'copilot',
  ],
  Security: [
    'security', 'vulnerability', 'exploit', 'pentest', 'malware', 'firewall',
    'encryption', 'oauth', 'cve', 'scanner', 'auth', 'jwt', 'xss', 'sql injection',
    'zero-day', 'threat', 'cyber', 'pentesting', 'hardening', 'secrets',
  ],
  Trading: [
    'trading', 'crypto', 'finance', 'stock', 'market', 'defi', 'blockchain',
    'bitcoin', 'ethereum', 'exchange', 'portfolio', 'forex', 'algorithmic trading',
    'quant', 'wallet', 'token', 'nft', 'binance', 'web3', 'solana', 'arbitrage',
  ],
};

function classify(repo) {
  const text = [repo.name, repo.full_name, repo.description, ...(repo.topics || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  for (const cat of ['AI', 'Security', 'Trading']) {
    if (KEYWORDS[cat].some((kw) => text.includes(kw))) return cat;
  }
  return 'Others';
}

module.exports = { CATEGORIES, classify };
