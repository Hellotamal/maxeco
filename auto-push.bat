@echo off
setlocal enabledelayedexpansion

:: ============================================================================
:: MaxEco Energy & Tech - Automated Git Push Script
:: Location: Maligaon, Guwahati, Assam
:: Remote: https://github.com/Hellotamal/maxeco.git
:: ============================================================================

title MaxEco - Automated GitHub Push Utility
color 0B

echo.
echo ============================================================================
echo   MAXECO ENERGY ^& TECH -- AUTOMATED GITHUB SYNC
echo ============================================================================
echo.

:: 1. Navigate to the folder where this batch file is located
cd /d "%~dp0"
echo [*] Working Directory: %CD%

:: 2. Check if git is installed and in PATH
where git >nul 2>&1
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [!] ERROR: Git command line tool is not found in your system PATH.
    echo Please install Git for Windows or add it to your environment variables.
    echo.
    pause
    exit /b 1
)

:: 3. Check for any uncommitted or untracked changes
echo [*] Checking for modified, new, or deleted files...
for /f "delims=" %%i in ('git status --porcelain') do set HAS_CHANGES=1

if not defined HAS_CHANGES (
    echo.
    echo [*] Checking remote branch status...
    git fetch origin main >nul 2>&1
    for /f "delims=" %%j in ('git status -uno ^| findstr /C:"Your branch is ahead"') do set NEEDS_PUSH=1
    
    if not defined NEEDS_PUSH (
        color 0A
        echo [OK] Everything is already up to date. Working tree clean.
        echo No changes to commit or push to GitHub.
        echo.
        pause
        exit /b 0
    ) else (
        echo [*] Local unpushed commits detected. Pushing to GitHub...
        goto DO_PUSH
    )
)

:: 4. Display changed files
echo.
echo Changes detected:
git status -s
echo.

:: 5. Get or generate commit message
set "CUSTOM_MSG=%~1"

if "%CUSTOM_MSG%"=="" (
    set /p "USER_INPUT=Enter commit description (Press ENTER for auto-timestamp): "
    if not "!USER_INPUT!"=="" (
        set "COMMIT_MSG=!USER_INPUT!"
    )
) else (
    set "COMMIT_MSG=%CUSTOM_MSG%"
)

if "%COMMIT_MSG%"=="" (
    set "COMMIT_MSG=auto-sync: %date% %time%"
)

:: 6. Stage files
echo.
echo [*] Staging all files (git add .)...
git add .
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [!] ERROR: git add failed.
    echo.
    pause
    exit /b 1
)

:: 7. Commit changes
echo [*] Creating commit with message: "!COMMIT_MSG!"
git commit -m "!COMMIT_MSG!"
if %ERRORLEVEL% neq 0 (
    color 0C
    echo [!] ERROR: git commit failed.
    echo.
    pause
    exit /b 1
)

:DO_PUSH
:: 8. Push to GitHub remote main branch
echo.
echo [*] Pushing to GitHub (origin main)...
git push origin main
if %ERRORLEVEL% neq 0 (
    color 0C
    echo.
    echo [!] PUSH FAILED:
    echo Please check:
    echo  1. Your internet connection.
    echo  2. Your GitHub write permissions or credentials.
    echo  3. If remote has newer changes, run: git pull --rebase origin main
    echo.
    pause
    exit /b 1
)

:: 9. Success message
color 0A
echo.
echo ============================================================================
echo   SUCCESS! All changes have been pushed to GitHub:
echo   https://github.com/Hellotamal/maxeco.git
echo ============================================================================
echo.

pause
exit /b 0
