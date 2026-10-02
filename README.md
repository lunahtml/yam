# YAM — You Are Magic 🪄

> **Операционная система для управления проектами, командами и людьми.**

Не CRM. Не таск-трекер. Не дашборд.
Платформа, где **бизнес, команда и человек** живут в одном контексте.

[![Status](https://img.shields.io/badge/status-MVP%20in%20progress-yellow)](./PRODUCT_MAP.md)
[![Backend](https://img.shields.io/badge/backend-NestJS%20%2B%20Prisma%207-red)]()
[![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20TS%20%2B%20Vite-blue)]()
[![Database](https://img.shields.io/badge/database-PostgreSQL%2018-336791)]()

---

## Что такое YAM

**YAM (You Are Magic)** — это операционная система для управления проектами, командами и людьми.

Традиционные инструменты (Jira, Asana, Notion, KPI-системы) решают **одну задачу** — управление задачами или оценку. YAM решает **три**:
1. **Управление проектами** — спринты, эпики, задачи, метрики, цели.
2. **Управление командой** — роли, приглашения, прозрачность.
3. **Управление человеком** — навыки, рост, честная оценка без peer review.

**Ядро:** `Organization → Workspace → Project → Module → Entity → Field → Record`.

Всё расширяемо: пользователь создаёт **свой модуль без кода**.

---

## Философия

- **Люди превыше всего.** Не задачи, не метрики — человек.
- **Справедливость важнее оценок.** Нет peer review. Спорное → на фасилитацию.
- **Прозрачность.** Всё видно. Всё объяснимо.
- **Бизнес = игра за выживание.** Факап — данные, не приговор.
- **Why am I?** Не «кто я», не «что я», а зачем.

> YAM — не продукт. YAM — позиция.
> Не про выжимание, а про рост.
> Не про контроль, а про доверие.
> Не про отчёты, а про смысл.
> Не про «людей-ресурс», а про людей-игроков.

---

## Стек

| Слой | Технологии |
|------|------------|
| **Backend** | NestJS, Prisma 7, PostgreSQL 18, Redis |
| **Frontend** | React, TypeScript, Vite, Lucide |
| **Infra** | Docker, Nginx |
| **Auth** | httpOnly cookie, JWT, 2FA |
| **Безопасность** | RBAC, tenant isolation, argon2, Zod, UUID v7 |
| **Валидация** | Zod везде (никаких `any`) |

---

## Быстрый старт

### Требования

- Docker + Docker Compose
- Node.js 20+ (для локальной разработки)
- Git

### Запуск

```bash
# 1. Клонировать репозиторий
git clone <url>
cd yam

# 2. Запустить все сервисы
docker-compose up -d

# 3. Применить миграции Prisma
docker-compose exec backend npx prisma migrate deploy

# 4. Открыть в браузере
# http://localhost