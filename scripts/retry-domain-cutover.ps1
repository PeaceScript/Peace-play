$ErrorActionPreference = 'Stop'

$project = 'peace-play-official'
$siteId = 'peace-play-official'

Write-Host "[1/4] Checking active firebase project..."
firebase use $project

Write-Host "[2/4] Attempting to create original Site ID..."
try {
  firebase hosting:sites:create $siteId --project $project --non-interactive
  Write-Host "Site ID created successfully." -ForegroundColor Green
} catch {
  Write-Host "Site ID still reserved. Try again later or submit support ticket." -ForegroundColor Yellow
  throw
}

Write-Host "[3/4] Reminder: update .firebaserc target to '$siteId' before deploy"
Write-Host "[4/4] Deploy command: firebase deploy --only hosting --project $project"
