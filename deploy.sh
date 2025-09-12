#!/bin/bash

echo "🚀 Деплой AllO_G на GitHub Pages..."

# Проверяем что мы в git репозитории
if [ ! -d ".git" ]; then
    echo "❌ Не найден .git репозиторий!"
    echo "Выполните: git init && git remote add origin https://github.com/zoland/AllO_G.git"
    exit 1
fi

# Проверяем что есть remote
if ! git remote | grep -q origin; then
    echo "❌ Не настроен remote origin!"
    echo "Выполните: git remote add origin https://github.com/zoland/AllO_G.git"
    exit 1
fi

# Показываем текущий статус
echo "📋 Текущий статус:"
git status --short

# Добавляем все изменения
echo "📦 Добавляем файлы..."
git add .

# Проверяем что есть изменения для коммита
if git diff --staged --quiet; then
    echo "ℹ️  Нет изменений для коммита"
    exit 0
fi

# Коммитим с временной меткой
COMMIT_MSG="🔄 AllO_G update $(date '+%Y-%m-%d %H:%M:%S')"
echo "💾 Коммитим: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# Пушим на GitHub
echo "🌐 Отправляем на GitHub..."
git push origin main

# Проверяем успешность
if [ $? -eq 0 ]; then
    echo "✅ Деплой успешно завершен!"
    echo "📱 Приложение доступно: https://zoland.github.io/AllO_G/"
    echo "⏱️  Изменения появятся через 1-2 минуты"
else
    echo "❌ Ошибка при деплое!"
    exit 1
fi
