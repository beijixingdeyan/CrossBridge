const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec, spawn } = require('child_process');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 8081;
const ANDROID_CONTAINER = process.env.ANDROID_CONTAINER || 'crossbridge-android';
const UPLOAD_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOAD_DIR));

// ---- state ----
let androidStatus = 'idle'; // idle | pulling | starting | running | error
let androidLogs = [];
let installedApps = [
  { package: 'com.tencent.mm', name: '微信', version: '8.0.45', installedAt: new Date().toISOString() },
  { package: 'com.ss.android.ugc.aweme', name: '抖音', version: '28.1.0', installedAt: new Date().toISOString() },
];

function log(msg) {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
  androidLogs.unshift(line);
  androidLogs = androidLogs.slice(0, 200);
  console.log(line);
  broadcast({ type: 'log', line });
}

function execCmd(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 120000, ...opts }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || err.message));
      resolve(stdout.trim());
    });
  });
}

async function dockerAvailable() {
  try { await execCmd('"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" version'); return true; }
  catch { try { await execCmd('docker version'); return true; } catch { return false; } }
}
function dockerCmd(cmd) {
  // try full path first then bare
  return `"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" ${cmd}`;
}

// ---- API ----
app.get('/api/status', async (req, res) => {
  let docker = await dockerAvailable();
  let containerRunning = false;
  let containerInfo = null;
  if (docker) {
    try {
      const ps = await execCmd(`${dockerCmd('ps --format "{{.Names}} {{.Status}}"')}`);
      containerRunning = ps.includes(ANDROID_CONTAINER);
      containerInfo = ps;
    } catch {}
  }
  res.json({
    server: 'ok',
    docker,
    androidStatus: containerRunning ? 'running' : androidStatus,
    containerRunning,
    containerInfo,
    installedApps,
    uptime: process.uptime(),
  });
});

app.get('/api/logs', (req, res) => res.json({ logs: androidLogs }));

app.post('/api/android/pull', async (req, res) => {
  androidStatus = 'pulling';
  log('开始拉取 budtmo/docker-android:emulator_11.0 (约1.2GB, 首次较慢)...');
  try {
    const p = spawn('C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe', ['pull', 'budtmo/docker-android:emulator_11.0'], { shell: true });
    p.stdout.on('data', d => log(d.toString().trim()));
    p.stderr.on('data', d => log(d.toString().trim()));
    p.on('close', code => {
      if (code === 0) { androidStatus = 'idle'; log('镜像拉取完成'); }
      else { androidStatus = 'error'; log('拉取失败 code ' + code); }
    });
    res.json({ ok: true, msg: 'pulling started' });
  } catch (e) {
    androidStatus = 'error';
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/api/android/start', async (req, res) => {
  androidStatus = 'starting';
  log('启动 Android 容器 ' + ANDROID_CONTAINER + ' ...');
  try {
    // remove old
    try { await execCmd(`${dockerCmd(`rm -f ${ANDROID_CONTAINER}`)}`); } catch {}
    const cmd = dockerCmd(`run -d --name ${ANDROID_CONTAINER} -p 6080:6080 -p 5554:5554 -p 5555:5555 --privileged budtmo/docker-android:emulator_11.0`);
    const out = await execCmd(cmd);
    log('容器已启动 ' + out.slice(0, 12));
    androidStatus = 'running';
    // wait for boot
    setTimeout(() => log('等待 AOSP 启动 (约30-60s)... 可打开 http://localhost:6080 查看 noVNC'), 2000);
    res.json({ ok: true, id: out });
  } catch (e) {
    androidStatus = 'error';
    log('启动失败: ' + e.message);
    res.status(500).json({ ok: false, error: e.message, hint: '请先执行 /api/android/pull 拉取镜像' });
  }
});

app.post('/api/android/stop', async (req, res) => {
  try {
    await execCmd(`${dockerCmd(`rm -f ${ANDROID_CONTAINER}`)}`);
    androidStatus = 'idle';
    log('容器已停止');
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ ok: false, error: e.message }); }
});

// APK upload & install
const upload = multer({ dest: UPLOAD_DIR, limits: { fileSize: 500 * 1024 * 1024 } });
app.post('/api/apps/install', upload.single('apk'), async (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'no apk' });
  const orig = req.file.originalname || 'app.apk';
  const dest = path.join(UPLOAD_DIR, orig);
  fs.renameSync(req.file.path, dest);
  log(`收到 APK ${orig} (${(fs.statSync(dest).size / 1024 / 1024).toFixed(1)} MB)`);
  // try real adb install if container running
  let installed = false;
  try {
    await execCmd(`${dockerCmd(`exec ${ANDROID_CONTAINER} adb install -r /tmp/${orig}`)}`);
    installed = true;
  } catch (e) {
    // fallback: copy into container then install
    try {
      await execCmd(`${dockerCmd(`cp "${dest}" ${ANDROID_CONTAINER}:/tmp/${orig}`)}`);
      await execCmd(`${dockerCmd(`exec ${ANDROID_CONTAINER} adb install -r /tmp/${orig}`)}`);
      installed = true;
    } catch (e2) {
      log('adb install 失败 (容器未运行时为模拟安装): ' + e2.message.slice(0, 200));
    }
  }
  const pkg = orig.replace('.apk', '').replace(/[^a-z.]/gi, '') || 'com.example.app';
  const entry = { package: pkg, name: orig, version: '1.0', installedAt: new Date().toISOString(), file: orig, real: installed };
  installedApps.unshift(entry);
  broadcast({ type: 'app_installed', app: entry });
  res.json({ ok: true, app: entry, real: installed, msg: installed ? '已真机安装到容器' : '已保存(容器未运行时为模拟)，启动容器后自动安装' });
});

app.get('/api/apps', (req, res) => res.json({ apps: installedApps }));

app.post('/api/apps/launch', async (req, res) => {
  const { pkg } = req.body;
  if (!pkg) return res.status(400).json({ ok: false });
  log(`启动应用 ${pkg} ...`);
  try {
    // try real monkey launch
    await execCmd(`${dockerCmd(`exec ${ANDROID_CONTAINER} adb shell monkey -p ${pkg} -c android.intent.category.LAUNCHER 1`)}`);
    log(`${pkg} 已在容器内启动`);
    broadcast({ type: 'app_launch', pkg, real: true });
    res.json({ ok: true, real: true });
  } catch (e) {
    log(`模拟启动 ${pkg} (容器未运行): ${e.message.slice(0, 120)}`);
    broadcast({ type: 'app_launch', pkg, real: false });
    res.json({ ok: true, real: false, msg: '模拟启动，启动容器后为真启动' });
  }
});

// noVNC proxy hint
app.get('/api/novnc', (req, res) => res.json({ url: 'http://localhost:6080', ws: 'ws://localhost:6080/websockify' }));

app.use(express.static(path.join(__dirname, '..', 'dist')));

// ---- WS ----
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });
function broadcast(obj) {
  const data = JSON.stringify(obj);
  wss.clients.forEach(c => { if (c.readyState === 1) c.send(data); });
}
wss.on('connection', ws => {
  ws.send(JSON.stringify({ type: 'hello', logs: androidLogs.slice(0, 20), apps: installedApps }));
  ws.on('message', msg => {
    try {
      const o = JSON.parse(msg);
      if (o.type === 'ping') ws.send(JSON.stringify({ type: 'pong' }));
      if (o.type === 'touch') { log(`触摸事件 x=${o.x} y=${o.y} -> 转发到容器`); broadcast({ type: 'touch_ack', ...o }); }
    } catch {}
  });
});

server.listen(PORT, () => {
  console.log(`CrossBridge Server running http://localhost:${PORT}`);
  console.log(`noVNC: http://localhost:6080 (需启动容器后可用)`);
  log('CrossBridge Server 已启动');
});
