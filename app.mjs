import fetch from 'node-fetch';
import boring from 'boring';

const argv = boring();
const org = argv.org;
const user = argv.user;

if (!(org || user)) {
  console.error('You must specify --org or --user.');
  process.exit(1);
}

const owner = org || user;

const token = argv.token || process.env.TOKEN;

const repos = org ? await getRepos('orgs', org) : await getRepos('users', argv.user);

console.log('Scanning repos, this can take time...\n');
let irrelevant = 0;
let stable = 0;
let unstable = 0;
for (const repo of repos) {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/package.json`;
  const headers = {
    'User-Agent': 'alpha-beta-scanner'
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }
  const response = await fetch(url, { headers });
  if (response.status === 404) {
    // Not a relevant concept for all repos
    irrelevant++;
    continue;
  }
  if (response.status >= 400) {
    throw response;
  }
  const content = await response.json();
  const data = Buffer.from(content.content, 'base64').toString('utf8');
  const json = JSON.parse(data);
  if ((typeof json.version) === 'string') {
    if (json.version.match(/alpha|beta|^0./)) {
      console.log(`${owner}/${repo}: ${json.version}`);
      unstable++;
    } else {
      stable++;
    }
  }
}

console.log(`\nStable packages: ${stable}`);
console.log(`Unstable (alpha, beta, 0.x) packages: ${unstable}`);
console.log(`Repos with no package.json: ${irrelevant}`);

async function getRepos(type, owner) {
  console.log('Getting repo list, this can take time...');
  let repos = [];
  let page = 1;
  while (true) {
    const url = `https://api.github.com/${type}/${owner}/repos?page=${page}`;
    const headers = {
      'User-Agent': 'alpha-beta-scanner'
    };
    if (token) {
      headers.Authorization = `token ${token}`;
    }
    const response = await fetch(url, { headers });
    if (response.status === 404) {
      // They should handle it this way
      return repos;
    }
    const found = await response.json();
    if (!found.length) {
      // But they actually handle it this way
      return repos;
    }
    repos = [...repos, ...(found.map(repo => repo.name))];
    page++;
  }
}

