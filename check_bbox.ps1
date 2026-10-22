Add-Type -AssemblyName System.Drawing
$bmp = [System.Drawing.Bitmap]::FromFile('C:\Users\amazon\Desktop\365_Days_Of_Love\assets\backgrounds\mobile-background.png')
$minX = $bmp.Width
$maxX = 0
for ($x = 0; $x -lt $bmp.Width; $x += 4) {
    for ($y = 100; $y -lt $bmp.Height - 100; $y += 40) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 20 -or $c.G -gt 20 -or $c.B -gt 20) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
        }
    }
}
$bmp.Dispose()
Write-Output "Artwork X: $minX to $maxX, Width: $($maxX - $minX), Height: 941"
