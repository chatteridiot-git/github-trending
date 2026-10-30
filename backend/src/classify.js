const CATEGORIES = ['AI', 'Security', 'Trading', 'DevTools', 'Web', 'Data', 'Mobile', 'Gaming', 'Education', 'Others'];

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
  DevTools: [
    'cli', 'devtool', 'developer tool', 'linter', 'formatter', 'build tool', 'bundler',
    'compiler', 'debugger', 'ide', 'plugin', 'extension', 'vscode', 'neovim', 'terminal',
    'git', 'docker', 'kubernetes', 'ci/cd', 'testing', 'test framework', 'package manager',
    'monorepo', 'scaffold', 'boilerplate', 'template', 'lint', 'prettier', 'eslint',
  ],
  Web: [
    'react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs', 'nuxt', 'astro',
    'frontend', 'web app', 'website', 'css', 'tailwind', 'html', 'dom', 'browser',
    'fullstack', 'full-stack', 'web framework', 'http server', 'api framework',
  ],
  Data: [
    'database', 'sql', 'nosql', 'postgres', 'mysql', 'mongodb', 'redis', 'analytics',
    'data pipeline', 'etl', 'warehouse', 'big data', 'visualization', 'chart',
    'dashboard', 'bi ', 'spark', 'kafka', 'airflow', 'dbt', 'olap',
  ],
  Mobile: [
    'ios', 'android', 'flutter', 'react native', 'swift', 'kotlin', 'mobile app',
    'xcode', 'apk', 'iphone', 'tablet',
  ],
  Gaming: [
    'game', 'gaming', 'unity', 'unreal', 'godot', 'pygame', 'engine', 'rpg',
    'fps', 'multiplayer', 'steam', 'playstation', 'xbox',
  ],
  Education: [
    'education', 'tutorial', 'course', 'learn', 'teach', 'school', 'university',
    'curriculum', 'study', 'lesson', 'training course',
  ],
};

function classify(repo) {
  const text = [repo.name, repo.full_name, repo.description, ...(repo.topics || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat === 'Others') continue;
    if (KEYWORDS[cat].some((kw) => text.includes(kw))) return cat;
  }
  return 'Others';
}

module.exports = { CATEGORIES, classify };
