git ls-files --modified --others --exclude-standard | ForEach-Object { git add $_; git commit -m "updated $_" }


