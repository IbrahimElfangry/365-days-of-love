import subprocess
import time
import urllib.request
import json
import asyncio
import websockets
import base64

targets = [
    ("http://localhost:8080/index.html", r"C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-mobile-home.png"),
    ("http://localhost:8080/index.html?openDay=1", r"C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-mobile-message.png"),
    ("http://localhost:8080/index.html?view=archive", r"C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-mobile-archive.png"),
    ("http://localhost:8080/index.html?view=streak", r"C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-mobile-streak.png"),
    ("http://localhost:8080/index.html?view=profile", r"C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-mobile-profile.png"),
]

async def capture_all():
    for url, outfile in targets:
        proc = subprocess.Popen([
            r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
            "--headless=new",
            "--remote-debugging-port=9444",
            "--window-size=390,844",
            url
        ])
        await asyncio.sleep(2)
        try:
            tabs = json.loads(urllib.request.urlopen("http://localhost:9444/json").read())
            page_tab = next(t for t in tabs if "localhost" in t.get("url", ""))
            ws_url = page_tab["webSocketDebuggerUrl"]

            async with websockets.connect(ws_url) as ws:
                # Force exact mobile viewport
                await ws.send(json.dumps({
                    "id": 1,
                    "method": "Emulation.setDeviceMetricsOverride",
                    "params": {"width": 390, "height": 844, "deviceScaleFactor": 1, "mobile": True}
                }))
                await ws.recv()

                # Small delay for CSS transitions/animations
                await asyncio.sleep(0.5)

                # Capture screenshot
                await ws.send(json.dumps({"id": 2, "method": "Page.captureScreenshot"}))
                shot = json.loads(await ws.recv())
                with open(outfile, "wb") as f:
                    f.write(base64.b64decode(shot["result"]["data"]))
                print(f"Captured {outfile}")
        finally:
            proc.terminate()
            await asyncio.sleep(0.5)

asyncio.run(capture_all())
