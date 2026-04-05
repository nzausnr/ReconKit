# ReconKit
OSINT &amp; Digital Privacy Analysis Toolkit

ReconKit is a browser-based tool that shows you exactly what every website can see about you — your IP address, device fingerprint, browser signals, installed fonts, GPU, and more — with zero permissions required.

Built for privacy awareness, security education, and digital self-defence.

---

## What it does

- **Digital Exposure scan** — reveals your public IP, WebRTC leak, browser fingerprint, canvas hash, audio fingerprint, installed fonts, and 40+ data points
- **IP Lookup** — query any IP address for geolocation, ISP, and abuse history
- **Domain & DNS** — WHOIS lookup, DNS records, MX/TXT inspection
- **SSL Inspector** — TLS certificate details and security grading
- **HTTP Headers** — security header analysis with recommendations
- **Breach Check** — check if an email has appeared in known data breaches
- **Username Search** — check a username across major platforms
- **Utilities** — password generator, hash tools, IP converter, JWT decoder
- **Learn & Protect** — educational guides on fingerprinting, VPNs, privacy tools

---

## Usage

No installation required. Open `index.html` in any modern browser.

```bash
git clone https://github.com/nzausnr/ReconKit.git
cd ReconKit
open index.html
```

Or visit the live version: *coming soon*

---

## API Keys (optional)

Some tools work without keys but are enhanced with them:

| Tool | API | Free tier |
|------|-----|-----------|
| IP Lookup | [AbuseIPDB](https://www.abuseipdb.com) | Yes |
| IP & Domain | [VirusTotal](https://www.virustotal.com) | Yes |
| Breach Check | [HaveIBeenPwned](https://haveibeenpwned.com/API/Key) | $3.50/mo |

Keys are stored locally in your browser. Never sent anywhere except the respective API.

---

## Stack

Pure HTML, CSS, and JavaScript. No frameworks, no build step, no dependencies.

---

## License

MIT — see [LICENSE](LICENSE) for details.

---

*No data is stored. Everything runs entirely in your browser.*
