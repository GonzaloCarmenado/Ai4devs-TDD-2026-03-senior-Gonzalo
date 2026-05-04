# Prompts iniciales — Ejercicio TDD

## Herramienta utilizada
Claude Code (CLI) con el modelo claude-sonnet-4-6.

---

## Prompt 1 — Análisis del proyecto y configuración del entorno

**Objetivo:** Entender el proyecto y preparar la infraestructura de tests.

```
Lee el ejercicio.md y los documentos de la carpeta docs/ para entender
el contexto del proyecto y qué hay que hacer. Después configura el proyecto
para que npm test funcione usando ts-jest.
```

**Resultado:** 
- Creación de `backend/jest.config.js` con preset `ts-jest`
- Instalación de dependencias (`jest`, `ts-jest`, `@types/jest`)
- Verificación de que `npm test` funciona desde consola

---

## Prompt 2 — Suite de tests del validador (Familia 1)

**Objetivo:** Cubrir toda la lógica de validación de datos del formulario.

```
Analiza backend/src/application/validator.ts e identifica todos los casos
que hay que testear. Crea una suite completa en validator.test.ts siguiendo
el patrón AAA, con test.each para casos parametrizados y nombres descriptivos
que expliquen el comportamiento esperado, no el nombre de la función.
```

**Resultado:**
- 56 tests cubriendo: firstName, lastName, email, phone, address, educations,
  workExperiences y cv
- Uso de `test.each` para agrupar casos similares
- Casos límite incluidos (longitudes máximas, formatos de fecha, caracteres especiales)

---

## Prompt 3 — Suite de tests del servicio (Familia 2 — lógica de guardado)

**Objetivo:** Testear la orquestación del servicio sin tocar la base de datos.

```
Crea tests unitarios para candidateService.ts. Los modelos Candidate,
Education, WorkExperience y Resume hacen llamadas a Prisma, así que hay
que mockearlos. Verifica que el servicio: guarda el candidato, asigna el
candidateId a cada entidad relacionada, y maneja correctamente el error P2002
de email duplicado.
```

**Resultado:**
- Mock de las 4 clases de dominio con `jest.MockedClass`
- Verificación de la asignación de `candidateId` a educaciones, experiencias y CV
- Cobertura de errores: P2002 (email duplicado) y errores inesperados

---

## Prompt 4 — Suite de tests del endpoint HTTP (Familia 2 — capa API)

**Objetivo:** Testear el endpoint POST /candidates con Supertest.

```
Instala supertest y crea tests para el endpoint POST /candidates usando
la app de Express. Mockea addCandidate para no depender de la BD.
Cubre: respuesta 201 en éxito, 400 cuando el servicio lanza un Error conocido,
y 500 para errores inesperados.
```

**Ajuste manual aplicado:**
- Se añadió el guard `if (process.env.NODE_ENV !== 'test')` en `index.ts`
  para evitar que el servidor arranque en el puerto 3010 durante los tests.
  Jest setea `NODE_ENV=test` automáticamente.

**Resultado:**
- 5 tests HTTP con Supertest
- Sin dependencia de BD ni de red real

---

## Decisiones técnicas destacadas

| Decisión | Motivo |
|---|---|
| Mockear modelos de dominio, no Prisma directamente | Más sencillo y aislado; evita configurar PrismaClient mock completo |
| Dejar `validateCandidateData` sin mock en los tests del servicio | Es lógica pura, correrla real aumenta la confianza sin coste |
| `test.each` en el validador | Reduce duplicación; añadir un caso nuevo es una sola línea |
| Guard `NODE_ENV !== 'test'` en lugar de separar `app` y `server` | Cambio mínimo en el código existente; suficiente para el objetivo |
