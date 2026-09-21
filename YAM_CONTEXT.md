# YAM Context

## Концепт
YAM — You Are Magic
Концепт
Что это
YAM — операционная система для управления проектами, командами и людьми.
Не CRM. Не таск-трекер. Не дашборд.
Платформа, где бизнес, команда и человек живут в одном контексте.

Философия
Люди превыше всего. Не задачи, не метрики — человек.

Справедливость важнее оценок. Нет peer review. Спорное → на фасилитацию.

Прозрачность. Всё видно. Всё объяснимо.

Бизнес = игра за выживание. Факап — данные, не приговор.

Why am I? Не «кто я», не «что я», а зачем.

Ядро
Organization → Workspace → Project → Module → Entity → Field → Record

Organization — компания

Workspace — отдел / клиент

Project — вселенная. Всё внутри проекта.

Module — конфигурируемая единица (Задачи, Клиенты, Лиды, своё)

Entity → Field → Record — metadata-driven ядро

Пользователь может создать свой модуль без кода

Модули
1. Artifacts — ресурсы проекта
Сайты, соцсети, документы, дашборды, офлайн-точки. Привязка UTM, задач, метрик.

2. UTM Manager
Справочники: sources, mediums, campaigns

Правила автогенерации

Массовая генерация ссылок

Импорт / экспорт Excel

Привязка к артефактам

3. Marketing Dashboard
36 метрик: воронка, стоимости (CPC, CPL, CAC), ROI/ROMI/ROAS, LTV/CAC, unit-экономика, эффективность, TAM/SAM/SOM.
Формулы + пояснения + цветовая индикация.
Сохранение в БД + история + Excel-экспорт.

4. Scrum
Sprint — 2 недели (настраивается)

Goal — измеримая цель

SprintMetric — метрики успеха (PO задаёт)

Increment — что команда сделала (копилка проекта)

SprintEvent — успех, факап, пивот, пауза, прорыв

Epic — крупные инициативы

Tasks — backlog, канбан, DnD

Sprint Board — задачи спринта

5. Геймификация
Автоматические ачивки — за результаты (закрыл 10 задач, спринт без просрочек)

Ручные ачивки — PO награждает за нестандартное

XP — за задачи, инкременты, цели, события

Ранги — rookie → legend

6. X-Matrix / Skill Graph
Трёхмерная карта человека:

X — Skills (backend, legal, mentorship)

Y — Projects / Sphere (e-commerce, fintech, инвестиции)

Z — Geography (Россия, зарубеж, международный)

Skill растёт:

От закрытых задач с тегом

От экзаменов

От обучения

От внедрений

От помощи коллеге

Ручной подъём (ментор, PO, запрос к руководству)

Уровень зависит от контекста:
backend → senior (в e-commerce), middle (в fintech), middle (за рубежом).

Цель: прозрачный сигнал «пора повысить оклад».

7. Taxonomy
Глобальная система категорий и тегов (как WordPress):

Category — иерархия (проекты, задачи, теги, skills)

Tag — глобальные теги организации (не привязаны к проекту)

Может быть любой тег (даже #джазз, если команда решила)

Тег может быть связан со skill или не быть

8. Team / Users
Пользователь — часть многих проектов

Роли: owner, admin, member, viewer

Автокомплит assignee из команды проекта + внешних

Приглашения в проект

Профиль, аватар

Правила
Один проект — одна вселенная. Всё внутри.

Multi-tenant. Org → Workspace → Project.

Metadata-driven. Пользователь создаёт модули.

Никаких any. Zod везде.

Безопасность банковского уровня. Cookie-based auth, JWT, 2FA, RBAC, tenant isolation.

UUID v7 для всех ID (time-ordered, append-only).

Agile нам в помощь.

Стек
Backend: NestJS + Prisma 7 + PostgreSQL 18 + Redis
Frontend: React + TypeScript + Vite + Lucide
Infra: Docker + Nginx + UUID v7
Auth: httpOnly cookie, JWT, 2FA
Стили: обычный CSS + классы (без inline)

Что уже работает
Auth, Organizations, Workspaces, Projects, Artifacts, UTM (справочники, генератор, ссылки), Marketing Dashboard, Entities/Fields/Records, Views (Kanban с DnD), Sprints, Increments, Metrics, Events, User Module, Profile, X-Matrix core (models + backend).

Что в работе
X-Matrix UI

TeamPage + приглашения

Taxonomy UI (теги, категории)

Эпики UI

Геймификация (автомат + ручные)

Что дальше
Integrations (Яндекс, VK, банки, маркетплейсы), Automations, Reports, Marketplace, Self-hosted.

Итог
YAM — не продукт. YAM — позиция.

Не про выжимание, а про рост

Не про контроль, а про доверие

Не про отчёты, а про смысл

Не про «людей-ресурс», а про людей-игроков

YAM. You Are Magic. 🪄

## Стек
- Backend: NestJS + PostgreSQL 18 + Prisma 7
- Frontend: React + TypeScript + Vite
- Infra: Docker + Nginx

## Что сделано
- Auth (cookie, JWT, 2FA)
- Organizations, Workspaces, Projects
- Artifacts, UTM, Marketing
- Entities/Fields/Records (ядро)
- Views (Kanban)
- Sprints, Increments, Metrics, Events
- X-Matrix core (models + backend)
- User Module
- Profile

## Что в работе
- X-Matrix UI
- Теги
- Эпики
- Приглашения

## Что дальше
- TeamPage
- Gamefication
- Integrations