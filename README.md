Кэширование:
1 час - список валют (в памяти)

5 минут - повторные запросы от одного пользователя (в памяти)

24 часа - курсы валют для пар base-target (в БД)

Структура:
currency-converter-be/
├── src/
│   ├── config/               # Конфигурация (БД, env)
│   ├── middlewares/           # Промежуточные обработчики
│   │   └── auth.middleware.ts # Авторизация через cookie
│   ├── modules/               # Модули приложения
│   │   ├── currency/          # Валюты и курсы
│   │   └── user/              # Пользователи и настройки
│   ├── utils/                 # Утилиты
│   │   ├── api.utils.ts       # Работа с внешним API
│   │   └── cache.utils.ts     # Кэширование в памяти
│   ├── app.ts                  # Настройка Express
│   └── server.ts               # Запуск сервера
├── demo/                       # Скриншоты для демонстрации
├── .env.example                 # Пример переменных окружения
├── .eslintrc.json               # Конфигурация линтера
├── .gitignore                   # Исключения для Git
├── .nvmrc                       # Версия Node.js
├── .prettierrc                  # Настройки форматирования
├── package.json                  # Зависимости
├── README.md                     # Документация
└── tsconfig.json                 # Конфигурация TypeScript

Скриншоты:
Все скриншоты работы приложения находятся в папке /demo:
Swagger документация - главная страница API
GET /api/currencies - список всех валют
GET /api/user - настройки пользователя (первый запрос)
POST /api/user - обновление настроек
GET /api/user - настройки после обновления
GET /api/rates - курсы валют
Повторный GET /api/rates - демонстрация кэширования
Cookie в браузере - httpOnly cookie
Таблицы Supabase - структура БД


Использовалось:
Frankfurter API - бесплатные курсы валют
Supabase - отличная PostgreSQL БД
Swagger - документация API