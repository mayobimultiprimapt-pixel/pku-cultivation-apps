@echo off
echo ==========================================
echo Deploying Tianji Mega Dashboard to GitHub
echo ==========================================
echo.

git add .
git commit -m "feat(tianji): Rebuild Mega Dashboard and Vault"
git push

echo.
echo ==========================================
echo Deployment successful!
echo Please wait 10-20 seconds for GitHub Pages.
echo ==========================================
pause
