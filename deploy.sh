#!/bin/bash

echo "🚀 Деплой AllO_G на GitHub Pages..."

git add .
git commit -m "🔄 AllO_G update $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

echo "✅ Деплой завершен!"
echo "📱 Откройте: https://zoland.github.io/AllO_G/"
