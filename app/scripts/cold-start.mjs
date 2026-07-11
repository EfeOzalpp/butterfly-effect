import { chromium } from "playwright";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const url = process.argv[2] ?? "https://www.butterflyeff3ct.online/";
const waitMs = Number(process.env.WAIT_MS ?? "8000");
const cpuThrottle = Number(process.env.CPU_THROTTLE ?? "1");
const browserChannel = process.env.PLAYWRIGHT_CHANNEL || undefined;
const recordVideo = process.env.RECORD_VIDEO === "1";
const profile = await mkdtemp(join(tmpdir(), "be-cold-"));

let context;

try {
  context = await chromium.launchPersistentContext(profile, {
    channel: browserChannel,
    headless: false,
    viewport: { width: 1440, height: 900 },
    recordVideo: recordVideo ? { dir: "cold-start-videos" } : undefined,
  });

  console.log(
    JSON.stringify(
      {
        url,
        waitMs,
        cpuThrottle,
        browser: browserChannel ?? "bundled-chromium",
        recordVideo,
      },
      null,
      2,
    ),
  );

  const page = await context.newPage();

  const client = await context.newCDPSession(page);
  await client.send("Network.enable");
  await client.send("Network.setCacheDisabled", { cacheDisabled: true });
  if (cpuThrottle > 1) {
    await client.send("Emulation.setCPUThrottlingRate", { rate: cpuThrottle });
  }

  page.on("console", (msg) => {
    console.log(`[console:${msg.type()}] ${msg.text()}`);
  });

  page.on("pageerror", (err) => {
    console.log("[pageerror]", err.message);
  });

  await page.addInitScript(() => {
    window.__longTasks = [];
    if (!("PerformanceObserver" in window)) return;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__longTasks.push({
          start: Math.round(entry.startTime),
          duration: Math.round(entry.duration),
        });
      }
    }).observe({ entryTypes: ["longtask"] });
  });

  await page.goto(url, { waitUntil: "load" });
  await page.waitForTimeout(waitMs);

  const longTasks = await page.evaluate(() => window.__longTasks ?? []);
  console.log("longTasks", longTasks);
} finally {
  if (context) {
    await context.close();
  }
  await rm(profile, { recursive: true, force: true });
}
