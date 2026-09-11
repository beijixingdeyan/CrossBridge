export function getApiBase(): string {
  const override = localStorage.getItem('CROSSBRIDGE_API');
  if (override) return override.replace(/\/$/, '');
  if (window.location.protocol === 'capacitor:') {
    // 打包到手机上时，localhost 指的就是手机自己，所以要改成电脑的局域网ip
    // 我自己调试用的是 192.168.1.10，记得改
    return 'http://localhost:8081';
  }
  return 'http://localhost:8081';
}

export async function apiFetch(path: string, init?: RequestInit) {
  const base = getApiBase();
  const r = await fetch(base + path, init);
  if (!r.ok) throw new Error(await r.text().catch(() => `HTTP ${r.status}`));
  return r.json();
}

export type ServerStatus = {
  server: string;
  docker: boolean;
  androidStatus: string;
  containerRunning: boolean;
  installedApps: any[];
};
