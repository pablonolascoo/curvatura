# Windows: programa la vigilancia diaria a las 03:30 con el Programador de tareas.
# Quitarla: Unregister-ScheduledTask -TaskName CurvaturaVigilar -Confirm:$false
$raiz = Resolve-Path "$PSScriptRoot\.."
$bin = Join-Path $raiz "ia\.venv\Scripts\curvatura-ia.exe"
$accion = New-ScheduledTaskAction -Execute $bin -Argument "vigilar" -WorkingDirectory $raiz
$hora = New-ScheduledTaskTrigger -Daily -At 3:30am
Register-ScheduledTask -TaskName "CurvaturaVigilar" -Action $accion -Trigger $hora -Description "Curvatura: papers, patentes y vectores" -Force
Write-Host "Vigilancia diaria programada (03:30)."
