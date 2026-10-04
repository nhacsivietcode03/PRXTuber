const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');
const BUILD_DIR = path.join(PROJECT_ROOT, 'build');
const CERTS_DIR = path.join(SCRIPT_DIR, '.certs');

// Ensure build directory exists
if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
}

// Configurable ports
const HTTP_PORT = parseInt(process.env.PORT || '8080', 10);
const HTTPS_PORT = parseInt(process.env.HTTPS_PORT || '8443', 10);

// Get LAN IPv4 addresses
function getLanIps() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  return ips.length > 0 ? ips : ['127.0.0.1'];
}

// Read App Info from app.json
function getAppMetadata() {
  const appJsonPath = path.join(PROJECT_ROOT, 'app.json');
  let appName = 'PrxTuber';
  let version = '1.0.0';
  let bundleId = 'com.bidv.cdonline';

  if (fs.existsSync(appJsonPath)) {
    try {
      const appData = JSON.parse(fs.readFileSync(appJsonPath, 'utf8')).expo || {};
      appName = appData.name || appName;
      version = appData.version || version;
      if (appData.ios && appData.ios.bundleIdentifier) {
        bundleId = appData.ios.bundleIdentifier;
      }
    } catch (e) {
      // fallback to defaults
    }
  }
  return { appName, version, bundleId };
}

// Generate or retrieve SSL certificates using OpenSSL
function getOrGenerateCerts(lanIps) {
  const keyPath = path.join(CERTS_DIR, 'server.key');
  const certPath = path.join(CERTS_DIR, 'server.crt');

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
      certPath
    };
  }

  if (!fs.existsSync(CERTS_DIR)) {
    fs.mkdirSync(CERTS_DIR, { recursive: true });
  }

  const altNames = ['IP:127.0.0.1', 'DNS:localhost', ...lanIps.map(ip => `IP:${ip}`)].join(',');

  try {
    const cmd = `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 3650 -nodes -subj "/CN=PRXTuber Local Distribution/O=PRXTuber/OU=Development" -addext "subjectAltName=${altNames}"`;
    execSync(cmd, { stdio: 'ignore' });
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
      certPath
    };
  } catch (err) {
    try {
      const fallbackCmd = `openssl req -x509 -newkey rsa:2048 -keyout "${keyPath}" -out "${certPath}" -days 3650 -nodes -subj "/CN=PRXTuber Local Server"`;
      execSync(fallbackCmd, { stdio: 'ignore' });
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
        certPath
      };
    } catch (e) {
      return null;
    }
  }
}

// Static file server with range request support
function serveStaticFile(req, res, filePath) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.ipa': 'application/octet-stream',
    '.apk': 'application/vnd.android.package-archive',
    '.plist': 'application/x-plist',
    '.pem': 'application/x-x509-ca-cert',
    '.crt': 'application/x-x509-ca-cert'
  };

  const contentType = mimeTypes[ext] || 'application/octet-stream';

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    });
    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes'
    });
    fs.createReadStream(filePath).pipe(res);
  }
}

// Request handler
function createRequestHandler(lanIps, certs) {
  const metadata = getAppMetadata();

  return (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // Route: /api/info
    if (pathname === '/api/info') {
      const ipaPath = path.join(BUILD_DIR, 'PrxTuber.ipa');
      const apkPath = path.join(BUILD_DIR, 'PrxTuber.apk');
      const ipaExists = fs.existsSync(ipaPath);
      const apkExists = fs.existsSync(apkPath);

      const info = {
        appName: metadata.appName,
        version: metadata.version,
        bundleId: metadata.bundleId,
        lanIps: lanIps,
        lanIp: lanIps[0],
        httpPort: HTTP_PORT,
        httpsPort: certs ? HTTPS_PORT : null,
        hasCert: !!certs,
        ipa: {
          exists: ipaExists,
          name: 'PrxTuber.ipa',
          size: ipaExists ? fs.statSync(ipaPath).size : 0,
          mtime: ipaExists ? fs.statSync(ipaPath).mtime : null
        },
        apk: {
          exists: apkExists,
          name: 'PrxTuber.apk',
          size: apkExists ? fs.statSync(apkPath).size : 0,
          mtime: apkExists ? fs.statSync(apkPath).mtime : null
        }
      };

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(info, null, 2));
      return;
    }

    // Route: /manifest.plist (Dynamic iOS OTA manifest)
    if (pathname === '/manifest.plist') {
      const manifestTemplatePath = path.join(BUILD_DIR, 'manifest.plist');
      let manifestContent = '';
      if (fs.existsSync(manifestTemplatePath)) {
        manifestContent = fs.readFileSync(manifestTemplatePath, 'utf8');
      } else {
        manifestContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>items</key>
	<array>
		<dict>
			<key>assets</key>
			<array>
				<dict>
					<key>kind</key>
					<key>software-package</key>
					<key>url</key>
					<string>__IPA_URL__</string>
				</dict>
			</array>
			<key>metadata</key>
			<dict>
				<key>bundle-identifier</key>
				<string>${metadata.bundleId}</string>
				<key>bundle-version</key>
				<string>${metadata.version}</string>
				<key>kind</key>
				<string>software</string>
				<key>title</key>
				<string>${metadata.appName}</string>
			</dict>
		</dict>
	</array>
</dict>
</plist>`;
      }

      // Determine correct hosts for manifest and IPA URL
      const requestHost = req.headers.host || `${lanIps[0]}:${HTTP_PORT}`;
      const hostWithoutPort = requestHost.split(':')[0];
      
      // Plist can specify http:// for software-package URL so iOS doesn't reject self-signed SSL certs
      const ipaUrl = `http://${hostWithoutPort}:${HTTP_PORT}/PrxTuber.ipa`;
      const iconUrl = `http://${hostWithoutPort}:${HTTP_PORT}/app-icon.png`;

      manifestContent = manifestContent
        .replace(/__IPA_URL__/g, ipaUrl)
        .replace(/__ICON_URL__/g, iconUrl);

      res.writeHead(200, { 'Content-Type': 'application/x-plist; charset=utf-8' });
      res.end(manifestContent);
      return;
    }

    // Route: /cert.pem or /ca.crt
    if ((pathname === '/cert.pem' || pathname === '/ca.crt') && certs) {
      serveStaticFile(req, res, certs.certPath);
      return;
    }

    // Default static file serving from BUILD_DIR
    let relPath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    let targetFilePath = path.join(BUILD_DIR, relPath);

    // Security check against directory traversal
    if (!targetFilePath.startsWith(BUILD_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    serveStaticFile(req, res, targetFilePath);
  };
}

// Start Server
function main() {
  const lanIps = getLanIps();
  const primaryIp = lanIps[0];
  const certs = getOrGenerateCerts(lanIps);
  const handler = createRequestHandler(lanIps, certs);

  // HTTP Server
  const httpServer = http.createServer(handler);
  httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    console.clear();
    console.log('=========================================================');
    console.log('   PRXTUBER - LAN DISTRIBUTION WEB SERVER');
    console.log('=========================================================');
    console.log(`📂 Build Directory:  ${BUILD_DIR}`);
    console.log(`🌐 Primary LAN IP:   ${primaryIp}`);
    console.log(`---------------------------------------------------------`);
    console.log(`🔗 HTTP Web Portal:   http://${primaryIp}:${HTTP_PORT}`);
    
    if (certs) {
      const httpsServer = https.createServer({ key: certs.key, cert: certs.cert }, handler);
      httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
        console.log(`🔒 HTTPS Web Portal:  https://${primaryIp}:${HTTPS_PORT}`);
        console.log(`📲 iOS OTA Manifest:  itms-services://?action=download-manifest&url=https://${primaryIp}:${HTTPS_PORT}/manifest.plist`);
        console.log(`---------------------------------------------------------`);
        printServerFooter(primaryIp, HTTP_PORT, HTTPS_PORT);
      });
    } else {
      console.log(`---------------------------------------------------------`);
      printServerFooter(primaryIp, HTTP_PORT, null);
    }
  });
}

function printServerFooter(ip, httpPort, httpsPort) {
  const ipaPath = path.join(BUILD_DIR, 'PrxTuber.ipa');
  if (fs.existsSync(ipaPath)) {
    const sizeMb = (fs.statSync(ipaPath).size / (1024 * 1024)).toFixed(1);
    console.log(`✅ Status: PrxTuber.ipa available (${sizeMb} MB)`);
  } else {
    console.log(`⚠️ Warning: PrxTuber.ipa not found in build directory.`);
    console.log(`   Run 'script/build_ipa.command' to compile an IPA.`);
  }

  console.log(`---------------------------------------------------------`);
  console.log(`📱 Connect your iPhone or Android to the same WiFi network.`);
  console.log(`   Open browser at: http://${ip}:${httpPort}`);
  if (httpsPort) {
    console.log(`   Or for iOS Safari OTA: https://${ip}:${httpsPort}`);
  }
  console.log(`=========================================================`);
  console.log(`Press Ctrl+C to stop the server.`);
}

main();
