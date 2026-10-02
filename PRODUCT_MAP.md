# YAM — Карта продукта

> Актуально на: 27 сентября 2026
> Версия: MVP (в разработке)

---

## Что такое YAM

**YAM (You Are Magic)** — операционная система для управления проектами, командами и людьми.

Не CRM. Не таск-трекер. Не дашборд.
Платформа, где **бизнес, команда и человек** живут в одном контексте.

**Ядро:** Organization → Workspace → Project → Module → Entity → Field → Record.

---

## Философия

- **Люди превыше всего.** Не задачи, не метрики — человек.
- **Справедливость важнее оценок.** Нет peer review. Спорное → на фасилитацию.
- **Прозрачность.** Всё видно. Всё объяснимо.
- **Бизнес = игра за выживание.** Факап — данные, не приговор.
- **Why am I?** Не «кто я», не «что я», а зачем.

---

## Стек

| Слой | Технологии |
|------|------------|
| **Backend** | NestJS, Prisma 7, PostgreSQL 18, Redis |
| **Frontend** | React, TypeScript, Vite, Lucide |
| **Infra** | Docker, Nginx |
| **Auth** | httpOnly cookie, JWT, 2FA |
| **Безопасность** | RBAC, tenant isolation, argon2, Zod, UUID v7 |

---

## Легенда

- ✅ **Готово** — работает в MVP.
- 🟡 **В работе** — частично, есть базовая версия.
- ⬜ **В планах** — не начато.
- ❌ **Не создано** — папки нет.

---

## Уровень 1: ЯДРО (Core)

### Multi-tenant
| Компонент | Статус |
|-----------|--------|
| Organization | ✅ |
| OrganizationMember (OWNER/ADMIN/MEMBER) | ✅ |
| Workspace | ✅ |
| WorkspaceMember (owner/admin/member/viewer) | ✅ |
| Project | ✅ |
| ProjectMember (owner/admin/member/viewer) | ✅ |

### Metadata-driven ядро
| Компонент | Статус |
|-----------|--------|
| ProjectModule | ✅ модель |
| Entity | ✅ |
| Field (text, number, date, boolean, select, user, tags, checklist, user-list) | ✅ |
| Record (JSONB data) | ✅ |
| RecordIndex (типизированные индексы) | ✅ |
| FieldTypeRegistry | ✅ |
| EntityTemplates (task, client, lead, order, content) | ✅ |

### Auth & Security
| Компонент | Статус |
|-----------|--------|
| Регистрация (email + пароль) | ✅ |
| Верификация email (6-значный код) | ✅ |
| Логин + 2FA (новое устройство) | ✅ |
| httpOnly cookie (access + refresh) | ✅ |
| Refresh-токен с rotation + reuse detection | ✅ |
| Сессии (список устройств, revoke) | ✅ |
| Logout | ✅ |
| Argon2 (пароли + коды) | ✅ |
| Throttler (rate limiting) | ✅ |
| Zod-валидация везде | ✅ |
| JwtAuthGuard + @Public() | ✅ |
| AllExceptionsFilter | ✅ |
| MembershipService (проверка ролей) | ✅ |
| **Автологин после verifyEmail** | ✅ |
| **Сброс пароля** | ⬜ |

### RBAC
| Компонент | Статус |
|-----------|--------|
| OrgRole (OWNER, ADMIN, MEMBER) | ✅ |
| WorkspaceRole (owner, admin, member, viewer) | ✅ |
| ProjectRoleEnum (owner, admin, member, viewer) | ✅ |
| PRIVILEGED_ROLES / EDIT_ROLES / DESTRUCTIVE_ROLES | ✅ |

---

## Уровень 2: МОДУЛИ

### 🎯 Scrum (Ядро продукта)

| Модуль | Backend | Frontend |
|--------|---------|----------|
| Спринты (Sprint) | ✅ | ✅ |
| Статусы (PLANNED/ACTIVE/COMPLETED/CANCELLED) | ✅ | ✅ |
| Спринт-борд (KanbanView с фильтром) | ✅ | ✅ |
| **Цели спринта** (SprintGoal) | ✅ | ✅ |
| **Ретроспектива** (SprintRetro, 6 критериев 1-10) | ✅ | ✅ |
| Метрики спринта (SprintMetric) | ✅ | ✅ |
| Авторасчёт isAchieved | ✅ | — |
| Recalculate из дашборда | ✅ | ✅ |
| Инкременты (Increment) | ✅ | ✅ |
| События (SprintEvent, 6 типов) | ✅ | ✅ |
| Эпики (Epic) | ✅ | ✅ |
| **Завершение спринта** (флоу с переносом целей) | ⬜ | ⬜ |
| **Связь Epic ↔ Sprint ↔ Record** | ✅ | ✅ |

### 📊 UTM
| Компонент | Backend | Frontend |
|-----------|---------|----------|
| Sources | ✅ | ✅ |
| Mediums | ✅ | ✅ |
| Campaigns | ✅ | ✅ |
| Rules (автогенерация) | ✅ | ✅ |
| Links (генерация) | ✅ | ✅ |
| URL builder | ✅ | — |
| Дефолтные справочники | ✅ | — |

### 🔗 Artifacts
| Компонент | Backend | Frontend |
|-----------|---------|----------|
| CRUD артефактов | ✅ | ✅ |
| 8 типов (WEBSITE, SOCIAL, DOCUMENT, DASHBOARD, VIDEO, FILE, OFFLINE, CUSTOM) | ✅ | ✅ |
| Привязка к UTM-ссылкам | ✅ | — |

### 📈 Marketing Dashboard
| Компонент | Backend | Frontend |
|-----------|---------|----------|
| 36 метрик (воронка, стоимости, ROI, LTV, юнит-экономика) | ✅ | ✅ |
| История периодов | ✅ | — |
| Excel-экспорт | ✅ | ✅ |
| Цветовая индикация | — | ✅ |
| **Импорт из Excel/CSV** | ⬜ | ⬜ |

### 🧬 Taxonomy
| Компонент | Backend | Frontend |
|-----------|---------|----------|
| Categories (PROJECT/TASK/TAG/SKILL) | ✅ | ⬜ |
| Tags (глобальные) | ✅ | ✅ |
| Skills (HARD/SOFT) | ✅ | ✅ |
| UserSkills (уровни + контекст) | ✅ | ✅ |
| SkillEvidence (7 типов доказательств) | ✅ | ✅ |
| **Categories UI** | ✅ | ⬜ |

### 🎮 X-Matrix / Skill Graph
| Компонент | Backend | Frontend |
|-----------|---------|----------|
| Skill (многомерный: skills × sphere × geo) | ✅ модель | ⬜ |
| UserSkill (уровень + контекст) | ✅ | ✅ |
| SkillEvidence | ✅ | ✅ |
| **X-Matrix UI (3D-граф)** | ⬜ | ⬜ |
| **Автоматический рост от задач** | ✅ | — |

### 🎲 Геймификация
| Компонент | Backend | Frontend |
|-----------|---------|----------|
| XP (в моделях: Event, Increment, Metric) | ✅ | — |
| Автоматические ачивки | ⬜ | ⬜ |
| Ручные ачивки (PO награждает) | ⬜ | ⬜ |
| Ранги (rookie → legend) | ⬜ | ⬜ |
| **Агрегация XP пользователя** | ⬜ | ⬜ |

### 👥 Team & Users
| Компонент | Backend | Frontend |
|-----------|---------|----------|
| Users | ✅ | ✅ |
| Profile (имя, аватар) | ✅ | ✅ |
| Search users (autocomplete) | ✅ | ✅ |
| Project members | ✅ | ✅ |
| AddMemberModal | — | ✅ |
| **Invitations** | ✅ | ✅ |
| **TeamPage + приглашения** | ✅ | ✅ |

### 🚀 Onboarding
| Компонент | Backend | Frontend |
|-----------|---------|----------|
| Demo-структура (Org → Workspace → Project → Epic → Sprint → Goals → Tasks → Metrics → Artifacts) | ✅ | ✅ |
| Кнопка «Создать демо-проект» | ✅ | ✅ |
| **Онбординг-тур (пошаговый)** | ⬜ | ⬜ |
| **InfoPopup везде** | — | 🟡 |

### 📦 Entities (Metadata-driven ядро)
| Компонент | Backend | Frontend |
|-----------|---------|----------|
| Entity CRUD | ✅ | ✅ |
| Field CRUD (9 типов) | ✅ | ✅ |
| Record CRUD + валидация | ✅ | ✅ |
| RecordIndex (sort/filter) | ✅ | — |
| Views (KANBAN, TABLE, CALENDAR, LIST) | ✅ | ✅ |
| KanbanView с DnD | — | ✅ |
| TaskQuickForm | — | ✅ |
| TaskDetailPopup | — | ✅ |
| ViewsManager | — | ✅ |
| **Календарь-вью** | ⬜ | ⬜ |
| **Таблица-вью** | ⬜ | ⬜ |
| **Список-вью** | ⬜ | ⬜ |

---

## Уровень 3: ИНФРАСТРУКТУРА

### Infra
| Компонент | Статус |
|-----------|--------|
| Docker Compose (postgres, redis, mailhog, backend, frontend, nginx) | ✅ |
| Nginx reverse proxy | ✅ |
| MailHog (dev SMTP) | ✅ |
| Redis | ✅ (запущен, но не используется) |
| **BullMQ / queue** | ⬜ |
| **Redis-кэш** | ⬜ |

### Email
| Компонент | Статус |
|-----------|--------|
| EmailService (nodemailer) | ✅ |
| Верификация email | ✅ |
| 2FA-код | ✅ |
| Приглашение в проект (HTML) | ✅ |
| **Шаблоны через Handlebars** | 🟡 (1 шаблон) |

### Common
| Компонент | Статус |
|-----------|--------|
| ZodValidationPipe | ✅ |
| JwtAuthGuard | ✅ |
| AllExceptionsFilter | ✅ |
| MembershipService | ✅ |
| **Interceptors (logger, transform)** | ⬜ |

---

## Уровень 4: НЕ СОЗДАНО

### Модули (папки нет)
| Модуль | Назначение |
|--------|------------|
| teams/ | Управление командами |
| roles/ | Кастомные роли |
| permissions/ | Гранулярные права |
| workflows/ | Модель есть, модуля нет |
| automations/ | Автоматизации (триггеры → действия) |
| comments/ | Модель есть, модуля нет |
| activity/ | ActivityLog есть, модуля нет |
| files/ | Модель есть, модуля нет |
| modules/ | Управление ProjectModule |

### Фичи (в концепте, не начаты)
| Фича | Приоритет |
|------|-----------|
| Интеграции (Яндекс.Директ, VK Ads, Google Ads) | Средний |
| Интеграции (банки: Тинькофф, Сбер, Точка) | Низкий |
| Интеграции (маркетплейсы: Ozon, WB) | Низкий |
| Integrations (OAuth + CryptoService) | Средний |
| Импорт из Excel/CSV | Высокий |
| Reports (PDF/Excel) | Средний |
| Marketplace модулей | Низкий |
| Self-hosted установка | Высокий |
| Real-time (WebSocket) | Низкий |
| Мобильное приложение | Низкий |
| ИИ-ассистент | Низкий |

---

## Дорожная карта (Roadmap)

### Фаза 1: MVP — «Работает и понятно» (текущая)
- ✅ Auth, Multi-tenant, RBAC
- ✅ Metadata-driven ядро
- ✅ Scrum (спринты, эпики, цели, ретро, метрики)
- ✅ UTM, Artifacts, Marketing
- ✅ Onboarding с демо
- 🟡 InfoPopup везде
- ⬜ Онбординг-тур
- ⬜ README + база знаний
- ⬜ Завершение спринта (флоу)

### Фаза 2: «Полезно команде»
- ⬜ Импорт Excel
- ⬜ Геймификация (XP, ачивки, ранги)
- ⬜ X-Matrix UI
- ⬜ Categories UI
- ⬜ Comments
- ⬜ Activity Log UI
- ⬜ Files (загрузка)
- ⬜ Завершение спринта

### Фаза 3: «Работает само»
- ⬜ Интеграции (OAuth + CryptoService)
- ⬜ Automations
- ⬜ Reports
- ⬜ Redis-кэш
- ⬜ BullMQ (фоновые задачи)

### Фаза 4: «Масштаб»
- ⬜ Marketplace
- ⬜ Self-hosted
- ⬜ Real-time
- ⬜ ИИ-ассистент
- ⬜ Мобильное приложение

---

## Безопасность — текущий статус

| Область | Статус |
|---------|--------|
| Auth | ✅ Банковский уровень |
| RBAC | ✅ |
| Tenant isolation | ✅ |
| Транспорт (HTTPS через nginx в проде) | ✅ |
| Шифрование токенов интеграций | ⬜ |
| OAuth flow | ⬜ |
| Rate limiting (Throttler) | ✅ |
| Аудит (ActivityLog) | 🟡 Частично |
| Шифрование паролей (argon2) | ✅ |
| 2FA | ✅ |
| httpOnly cookie | ✅ |
| UUID v7 | ✅ |
| Zod везде | ✅ |

---

## Что уже можно показать

**YAM готов к демонстрации:**
- Регистрация → верификация → автологин.
- Создание демо-проекта одной кнопкой.
- Полный цикл Scrum: эпик → спринт → цели → задачи → метрики → ретро.
- UTM-генератор с правилами.
- Marketing Dashboard с 36 метриками и Excel-экспортом.
- Команда с приглашениями.
- X-Matrix core (профиль навыков).

**Что не хватает для полного запуска:**
- Онбординг-тур.
- Импорт из Excel.
- Геймификация.
- Интеграции (для автоматизации метрик).

---

## Лицензия

TBD

## Контакты

TBD