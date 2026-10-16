// GitHub 저장소 목록을 서버에서 대신 불러와 캐시합니다.
// 방문자가 아무리 많아도 GitHub 호출은 몇 분에 한 번만 나가서, 브라우저에서 직접 부를 때 생기던
// 시간당 60회 한도(403 rate limit)에 걸리지 않습니다.
// Vercel 환경 변수에 GITHUB_TOKEN 을 넣으면 한도가 시간당 5000회로 늘어납니다. (선택)
const OWNER = 'Junghan0329';

module.exports = async (req, res) => {
    const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'my-works' };
    if (process.env.GITHUB_TOKEN) headers.Authorization = 'Bearer ' + process.env.GITHUB_TOKEN;
    try {
        const r = await fetch('https://api.github.com/users/' + OWNER + '/repos?per_page=100&sort=pushed', { headers });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const data = await r.json();
        res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
        res.status(200).json(data);
    } catch (e) {
        res.setHeader('Cache-Control', 'no-store');
        res.status(502).json({ error: String(e.message || e) });
    }
};
