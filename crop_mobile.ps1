Add-Type -AssemblyName System.Drawing
Copy-Item 'C:\Users\amazon\Desktop\365_Days_Of_Love\assets\backgrounds\mobile-background.png' 'C:\Users\amazon\Desktop\365_Days_Of_Love\assets\backgrounds\mobile-background-raw.png' -Force
$src = [System.Drawing.Bitmap]::FromFile('C:\Users\amazon\Desktop\365_Days_Of_Love\assets\backgrounds\mobile-background-raw.png')
$rect = New-Object System.Drawing.Rectangle(496, 0, 680, 941)
$cropped = $src.Clone($rect, $src.PixelFormat)
$src.Dispose()
$cropped.Save('C:\Users\amazon\Desktop\365_Days_Of_Love\assets\backgrounds\mobile-background.png', [System.Drawing.Imaging.ImageFormat]::Png)
$cropped.Dispose()
Write-Output 'Cropped mobile-background.png successfully to 680x941'
