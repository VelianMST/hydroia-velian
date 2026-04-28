# 📋 PASO 0 — Cuentas que necesitas crear (15 min)

Antes de tocar VS Code, crea estas 6 cuentas. Todas son **gratis** (excepto Anthropic, que requiere $5 USD mínimo).

> **Mientras creas cada cuenta, copia las llaves en un block de notas (cualquier .txt). Las vas a usar después.**

---

## 1. Telegram Bot Token (3 min)

1. Abre **Telegram** en tu celular o computadora
2. Busca el usuario `@BotFather` (es oficial, tiene check azul)
3. Manda el comando `/start`
4. Manda el comando `/newbot`
5. Te pide un nombre: pon **HydroIA Velian**
6. Te pide un username: tiene que terminar en `bot`. Prueba con `HydroIAVelianBot` o `HydroIAMxBot`
7. **Copia el TOKEN** que te da (algo como `7234567890:ABCdef-Ghij_KlmnoPqrs`)

📋 Copia en tu block de notas:
```
TELEGRAM_BOT_TOKEN=AQUÍ_PEGA_EL_TOKEN
```

---

## 2. Anthropic API Key (5 min)

1. Ve a https://console.anthropic.com
2. Crea cuenta con tu correo
3. En **Settings → Billing**, agrega un método de pago y mete **mínimo $5 USD** (te alcanza de sobra)
4. En **Settings → API Keys**, presiona **Create Key**
5. Nombra la llave: `hydroia-velian`
6. **Copia la llave** (empieza con `sk-ant-...`). ⚠️ Solo se muestra una vez.

📋 En tu block de notas:
```
ANTHROPIC_API_KEY=sk-ant-AQUÍ_LA_LLAVE
```

---

## 3. Supabase (3 min)

1. Ve a https://supabase.com
2. Crea cuenta con GitHub o correo
3. Presiona **New Project**
4. Nombre del proyecto: `hydroia-velian`
5. Database Password: inventa una contraseña segura (apúntala)
6. Region: **East US (North Virginia)** (es la más rápida desde México)
7. Espera 2-3 minutos a que se cree
8. Cuando esté listo, ve a **Settings → API**
9. **Copia 2 cosas:**
   - **Project URL** (algo como `https://abcxyz.supabase.co`)
   - **Service Role Key** (la que dice `service_role`, NO la `anon`)

📋 En tu block de notas:
```
SUPABASE_URL=https://abcxyz.supabase.co
SUPABASE_KEY=eyJhbGc...AQUÍ_LA_LLAVE_SERVICE_ROLE
```

---

## 4. GitHub (2 min, si no tienes ya)

1. Ve a https://github.com
2. Crea cuenta gratuita
3. **No necesitas copiar nada todavía.** Solo necesitas estar logueado.

---

## 5. Vercel (2 min)

1. Ve a https://vercel.com
2. Presiona **Sign Up** y elige **Continue with GitHub** (más fácil)
3. **No necesitas copiar nada todavía.** Solo necesitas estar logueado.

Vercel se usará en el Paso 4 para desplegar el dashboard.

---

## 6. Railway (2 min)

1. Ve a https://railway.app
2. Presiona **Login** y usa **GitHub**
3. Te dan $5 USD gratis al mes (suficiente para el bot)
4. **No necesitas copiar nada todavía.**

Railway se usará para desplegar el bot en el Paso 4.

---

## ✅ Checklist de cuentas

Antes de seguir, verifica que tengas en tu block de notas:

- [ ] `TELEGRAM_BOT_TOKEN=...`
- [ ] `ANTHROPIC_API_KEY=sk-ant-...`
- [ ] `SUPABASE_URL=https://...`
- [ ] `SUPABASE_KEY=eyJ...`
- [ ] Cuenta de GitHub activa
- [ ] Cuenta de Vercel activa
- [ ] Cuenta de Railway activa

---

## 🛠️ También necesitas en tu computadora

### Node.js (si no lo tienes)

1. Ve a https://nodejs.org
2. Descarga la versión **LTS** (la verde, izquierda)
3. Instálala (siguiente, siguiente, siguiente)
4. Para verificar: abre terminal y escribe `node -v` → debe darte algo como `v20.x.x`

### Claude Code (en VS Code)

1. Abre VS Code
2. Ve al panel de extensiones (Ctrl + Shift + X)
3. Busca **Claude Code** (de Anthropic)
4. Instala
5. Inicia sesión con tu cuenta de Anthropic (la misma del paso 2)

> **Alternativa:** si prefieres usar Claude Code en terminal, instala con:
> ```
> npm install -g @anthropic-ai/claude-code
> ```
> Luego en cualquier carpeta escribes `claude` y se activa.

---

## 🎯 Listo? Pasa a `01_PROMPT_BOT_BASICO.md`
