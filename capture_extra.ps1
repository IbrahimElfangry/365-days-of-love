$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
Start-Process -FilePath $edge -ArgumentList "--headless=new", "--disable-gpu", "--screenshot=C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-favorites.png", "--window-size=1440,900", "http://localhost:8080/index.html?view=favorites" -Wait
Start-Process -FilePath $edge -ArgumentList "--headless=new", "--disable-gpu", "--screenshot=C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-messages.png", "--window-size=1440,900", "http://localhost:8080/index.html?view=messages" -Wait
Write-Host "Favorites & Messages captured"
