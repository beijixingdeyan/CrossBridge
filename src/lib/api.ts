// 自动识别后端地址：Capacitor 真机用局域网IP，浏览器用 localhost
export function getApiBase(): string {
  // 局域网调试时可改成你电脑IP，例如 http://192.168.1.5:8081
  const override = localStorage.getItem('CROSSBRIDGE_API');
  if (override) return override.replace(/\/$/, '');
  // 如果是 capacitor 原生壳，window.location 是 capacitor://，此时回退到局域网需用户配置
  if (window.location.protocol === 'capacitor:') {
    return 'http://localhost:8081';
  }
  return 'http://localhost:8081';
}

export async function apiFetch(path: string, init?: RequestInit) {
  const base = getApiBase();
  const url = base + path;
  const r = await fetch(url, init);
  if (!r.ok) {
    const txt = await r.text().catch(() => '');
    throw new Error(txt || `HTTP ${r.status}`);
  }
  return r.json();
}

export type ServerStatus = {
  server: string;
  docker: boolean;
  androidStatus: string;
  containerRunning: boolean;
  installedApps: any[];
};
