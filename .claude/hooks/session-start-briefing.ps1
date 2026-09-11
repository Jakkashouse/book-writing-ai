# SessionStart 훅 — 작가의집 아침 브리핑
#
# Claude Code를 열 때 어제 남긴 미처리 항목을 화면에 띄웁니다.
# /일간보고·/주간보고 명령에 적혀 있던 "Cron 23:50 자동 실행"은
# 세션이 끝나면 사라져 실제로 동작하지 않았습니다. 그래서 스케줄러 대신
# 사장님이 Claude를 여는 순간에만 조용히 알려주는 방식으로 바꿨습니다.
#
# 하는 일은 읽기뿐입니다. 파일을 만들거나 고치지 않습니다.

$ErrorActionPreference = 'SilentlyContinue'

$dl = "C:\Users\JUN\Downloads"
$lines = @()

# 1) 안내 못 받은 결제자 — /결제대조 결과물이 남아 있으면 알립니다
$pending = Get-ChildItem $dl -Filter "결제대조_미발송_*.csv" -File |
           Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($pending) {
    $age = [int]((Get-Date) - $pending.LastWriteTime).TotalDays
    $rows = 0
    try { $rows = (Import-Csv $pending.FullName | Measure-Object).Count } catch { }
    if ($rows -gt 0) {
        $lines += "  결제 안내 미발송 {0}건 — {1} ({2}일 전)" -f $rows, $pending.Name, $age
        $lines += "     → /결제확인 으로 문안을 만드십시오"
    }
}

# 2) 오늘 아직 일간보고가 없으면 짚어 줍니다
$today = Get-Date -Format "yyyyMMdd"
$todayReport = Get-ChildItem $dl -Filter "*일간보고*$today*" -File
if (-not $todayReport) {
    $yesterday = (Get-Date).AddDays(-1).ToString("yyyyMMdd")
    $ydayReport = Get-ChildItem $dl -Filter "*일간보고*$yesterday*" -File
    if ($ydayReport) {
        $lines += "  어제 일간보고: $($ydayReport[0].Name)"
    }
    $lines += "  오늘 일간보고 아직 없음 — /일간보고 또는 /아침"
}

# 3) 주간보고는 월요일에만 확인합니다
if ((Get-Date).DayOfWeek -eq 'Monday') {
    $weekAgo = (Get-Date).AddDays(-7)
    $recentWeekly = Get-ChildItem $dl -Filter "*주간보고*" -File |
                    Where-Object { $_.LastWriteTime -gt $weekAgo }
    if (-not $recentWeekly) {
        $lines += "  월요일입니다. 지난주 주간보고가 없습니다 — /주간보고"
    }
}

if ($lines.Count -gt 0) {
    Write-Output ""
    Write-Output "[작가의집 브리핑]"
    $lines | ForEach-Object { Write-Output $_ }
    Write-Output ""
}

exit 0
