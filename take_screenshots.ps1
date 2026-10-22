$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

# 1. Desktop Homepage (Day 1, Countdown, Pending Status)
Start-Process -FilePath $edge -ArgumentList "--headless=new", "--disable-gpu", "--screenshot=C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-desktop.png", "--window-size=1440,900", "http://localhost:8080/index.html" -Wait

# 2. Message Opened Dialog (Day 1)
Start-Process -FilePath $edge -ArgumentList "--headless=new", "--disable-gpu", "--screenshot=C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-message-opened.png", "--window-size=1440,900", "http://localhost:8080/index.html?openDay=1" -Wait

# 3. Consolidated Messages Modal (Archive & Blurred Teaser Card)
Start-Process -FilePath $edge -ArgumentList "--headless=new", "--disable-gpu", "--screenshot=C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-messages.png", "--window-size=1440,900", "http://localhost:8080/index.html?view=archive" -Wait

# 4. Favorites Tab
Start-Process -FilePath $edge -ArgumentList "--headless=new", "--disable-gpu", "--screenshot=C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-favorites.png", "--window-size=1440,900", "http://localhost:8080/index.html?view=favorites" -Wait

# 5. Streak Modal with Streak Freeze
Start-Process -FilePath $edge -ArgumentList "--headless=new", "--disable-gpu", "--screenshot=C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-streak.png", "--window-size=1440,900", "http://localhost:8080/index.html?view=streak" -Wait

# 6. Profile / Settings Modal with Avatar Upload
Start-Process -FilePath $edge -ArgumentList "--headless=new", "--disable-gpu", "--screenshot=C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-profile.png", "--window-size=1440,900", "http://localhost:8080/index.html?view=profile" -Wait

# 7. Mobile View Homepage
Start-Process -FilePath $edge -ArgumentList "--headless=new", "--disable-gpu", "--screenshot=C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-mobile-home.png", "--window-size=390,844", "http://localhost:8080/index.html" -Wait

# 8. Mobile Message Opened (Bottom Sheet)
Start-Process -FilePath $edge -ArgumentList "--headless=new", "--disable-gpu", "--screenshot=C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-mobile-message.png", "--window-size=390,844", "http://localhost:8080/index.html?openDay=1" -Wait

# 9. Mobile Archive Modal (Bottom Sheet)
Start-Process -FilePath $edge -ArgumentList "--headless=new", "--disable-gpu", "--screenshot=C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-mobile-archive.png", "--window-size=390,844", "http://localhost:8080/index.html?view=archive" -Wait

# 10. Mobile Streak Modal (Bottom Sheet)
Start-Process -FilePath $edge -ArgumentList "--headless=new", "--disable-gpu", "--screenshot=C:\Users\amazon\Desktop\365_Days_Of_Love\screenshot-mobile-streak.png", "--window-size=390,844", "http://localhost:8080/index.html?view=streak" -Wait

Write-Host "All screenshots captured successfully!"
