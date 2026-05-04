Fake It 'Til You Make It es una técnica en el desarrollo guiado por pruebas (TDD) donde, al no tener clara la implementación de una funcionalidad, se "finge" la implementación inicial. Esto se hace devolviendo valores estáticos esperados para pasar el test. Esta técnica permite a los desarrolladores avanzar en el proceso de TDD sin estar bloqueados por la incertidumbre de la implementación. Una vez que el test inicial pasa, se va refinando la implementación hasta que sea funcional y correcta.

Es uno de los tres Green Bar Patterns definidos por Kent Beck en TDD by Example: Obvious Implementation (cuando sabes exactamente qué código escribir), Fake It (cuando no tienes clara la implementación) y Triangulation (cuando necesitas forzar la generalización añadiendo un segundo test). Fake It es la técnica más útil cuando el siguiente paso no está claro o cuando quieres validar primero el contrato antes de pensar en la lógica.

Ventajas:
Reduce la incertidumbre: Permite continuar con el desarrollo incluso si no se tiene una solución completa desde el principio.

Facilita el enfoque incremental: Permite construir la funcionalidad de forma gradual y mejorarla iterativamente.

Acelera el ciclo de feedback: Proporciona feedback rápido sobre los tests, asegurando que la dirección del desarrollo es correcta.

Es la base del Test-First Prompting con IA: En 2026, escribir el test primero y pedir a un agente de IA que implemente el código mínimo para pasarlo se ha convertido en la forma más efectiva de dirigir agentes como Claude Code, GitHub Copilot o Cursor. El test actúa como especificación ejecutable que la IA puede usar como objetivo binario.

Desventajas:
Riesgo de complacencia: Si no se continúa refinando la implementación, se puede quedar con código incompleto o incorrecto.

Código temporal: La implementación inicial es temporal y debe ser reemplazada, lo que requiere disciplina para evitar dejar código "fake" en producción.

Con IA el riesgo se amplifica: Los agentes de IA tienden a generar tests que validan lo que el código hace en vez de lo que debería hacer. Si no tienes disciplina, la IA puede incluso modificar tus tests para que pasen en lugar de arreglar la implementación. La regla de oro: el humano define el test (el qué), la IA implementa el código (el cómo).

Ejemplo Práctico:
Consideremos una función que debe obtener el nombre completo de un usuario. Usamos Vitest (compatible con la misma sintaxis de Jest) como framework de testing. Primero, escribimos un test que verifica el comportamiento esperado:

// users.test.js
import { describe, it, expect } from 'vitest';
import { getFullName } from './users.js';

describe('getFullName', () => {
  it('obtiene el nombre completo del usuario', () => {
    expect(getFullName('John', 'Doe')).toBe('John Doe');
  });
});
Para pasar el test, devolvemos un valor estático:

// users.js - Implementación falsa
export function getFullName(firstName, lastName) {
  return 'John Doe'; // Fake implementation
}
En este ejemplo, aunque la función getFullName no está implementada correctamente, pasa el test inicial devolviendo el valor esperado de forma estática. A medida que avanzamos, reemplazamos la implementación "fake" por una que utilice los parámetros proporcionados:

// users.js - Implementación refinada
export function getFullName(firstName, lastName) {
  return `${firstName} ${lastName}`;
}
Con esta implementación refinada, la función ahora cumple con los requisitos y pasa el test de manera correcta y dinámica.

Fake It con Agentes de IA: el flujo moderno
En 2026, la técnica Fake It toma una nueva dimensión cuando trabajas con agentes de IA. El flujo recomendado para aprovechar al máximo la combinación TDD + IA:

Tú escribes el test (defines el comportamiento esperado). Puedes pedir ayuda a la IA para redactarlo, pero la revisión es tuya.

Pides a la IA la implementación mínima (el "Fake It"). La IA generará código con valores hardcodeados — exactamente el patrón que buscas.

Añades un segundo test para forzar la generalización (Triangulation). La IA ya no puede hardcodear; se ve forzada a derivar una estructura real.

Refactorizas hacia producción manteniendo todos los tests verdes.

Regla crítica: nunca permitas que el agente modifique tus tests sin revisión explícita. Protege los tests como si fueran la especificación firmada del cliente — porque lo son.

Configura tus herramientas para que respeten TDD
Los agentes de IA no siguen TDD por defecto; tienden a escribir el código primero y los tests después (o a escribir ambos a la vez sin disciplina). Para imponer el flujo correcto, usa archivos de configuración:

Claude Code: crea un archivo CLAUDE.md en la raíz del proyecto con las reglas del ciclo Red-Green-Refactor.

Cursor: usa .cursorrules con instrucciones equivalentes.

GitHub Copilot: usa .github/copilot-instructions.md para su agent mode.

Ejemplo mínimo de reglas:

## Reglas de desarrollo
- Sigue siempre el ciclo TDD: Red → Green → Refactor
- Escribe el test más simple que falle primero
- Implementa solo el código mínimo para pasar el test (puedes hardcodear — Fake It)
- Nunca modifiques tests existentes sin aprobación explícita
- Un test a la vez, commits frecuentes
Importancia en el Desarrollo Ágil:
La técnica Fake It 'Til You Make It es especialmente valiosa en entornos de desarrollo ágil donde los requisitos pueden cambiar rápidamente y es crucial mantener el ritmo de desarrollo. Este enfoque permite a los desarrolladores obtener una "victoria rápida" al ver que los tests pasan desde el inicio, lo cual puede ser motivador y ayuda a mantener el progreso constante. En equipos ágiles, la capacidad de adaptarse y evolucionar rápidamente es fundamental, y esta técnica proporciona una manera estructurada de manejar la incertidumbre sin detener el flujo de trabajo.

En el contexto de desarrollo asistido por IA, su valor se multiplica. Kent Beck (autor original de TDD) distingue entre "vibe coding" — pedir a la IA que genere código y esperar que funcione — y "augmented coding" — mantener la disciplina de ingeniería (tests primero, implementación después, refactorización continua) mientras se aprovecha la velocidad de la IA. Fake It es una de las técnicas puente entre ambos mundos: te permite avanzar rápido sin perder el control sobre el diseño.

Colaboración y Confianza:
Además, Fake It 'Til You Make It es útil cuando se trabaja en colaboración con otros desarrolladores — o con agentes de IA como colaboradores. Al tener pruebas que pasan, incluso con implementaciones temporales, se facilita la integración continua y se mantiene la confianza en que el código base no está roto. Esto es crucial en proyectos grandes donde múltiples equipos pueden estar trabajando en diferentes partes del sistema simultáneamente. Mantener un código base estable y que pase todos los tests es vital para la coordinación y la eficiencia del equipo.

Disciplina y Mejora Continua:
Es importante no quedarse con la implementación falsa por mucho tiempo. La verdadera implementación debe seguir tan pronto como sea posible para asegurar que el código final sea robusto y funcional. La disciplina en TDD requiere que los desarrolladores sigan refinando su código hasta que cumpla con todos los requisitos especificados en las pruebas. Este enfoque incremental y disciplinado no solo mejora la calidad del código, sino que también asegura que cada funcionalidad esté completamente probada y validada antes de considerarla completa.

Esta disciplina es aún más crítica con IA: los agentes pueden completar features enteras en minutos, y si no pones barreras (tests primero, revisión de cambios en tests, commits atómicos) terminarás con código que "parece funcionar" pero que nadie — ni tú ni la IA — entiende realmente.

Ejemplo de Evolución: endpoint Express con Supertest
Consideremos un caso más complejo donde se necesita implementar un endpoint Node.js + Express para calcular el total de una factura. Usamos Supertest para testear el endpoint HTTP. Empezamos con una implementación falsa para pasar el test inicial:

// invoices.test.js
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from './app.js';

describe('POST /invoices/calculate', () => {
  it('calcula el total de la factura', async () => {
    const response = await request(app)
      .post('/invoices/calculate')
      .send({ items: [100, 200, 300] });

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(600);
  });
});
// app.js - Implementación falsa
import express from 'express';

export const app = express();
app.use(express.json());

app.post('/invoices/calculate', (req, res) => {
  res.json({ total: 600 }); // Fake implementation
});
Aunque esta implementación pasa el test, no es funcional. Añadimos un segundo test (Triangulation) para forzar la generalización:

it('calcula el total con valores diferentes', async () => {
  const response = await request(app)
    .post('/invoices/calculate')
    .send({ items: [50, 75, 25] });

  expect(response.body.total).toBe(150);
});
Ahora la implementación hardcodeada falla. Refinamos:

// app.js - Implementación refinada
import express from 'express';

export const app = express();
app.use(express.json());

app.post('/invoices/calculate', (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'items must be an array' });
  }

  const total = items.reduce((sum, item) => sum + item, 0);
  res.json({ total });
});
Este ejemplo muestra cómo Fake It 'Til You Make It, combinado con Triangulation, permite comenzar con una solución simple y luego iterar hacia una implementación correcta y robusta — guiados siempre por los tests.

🧪 Prueba esto ahora (5 minutos)
Abre tu proyecto Node + Express y practica el ciclo completo con tu agente de IA preferido:

Crea items.test.js y escribe un test con Vitest + Supertest para GET /items/1 que espere { id: 1, name: 'Widget' }.

Pide a Claude Code / Copilot / Cursor: "Implementa el endpoint Express más simple posible que haga pasar este test. Puedes hardcodear."

Verifica que el test pasa. Observa cómo la IA hardcodeó la respuesta.

Añade un segundo test para GET /items/2 que espere { id: 2, name: 'Gadget' }.

Pide: "Modifica la implementación para que ambos tests pasen sin modificar los tests."

Observa cómo la IA se ve forzada a usar un objeto, Map o array real.

Bonus (React): repite el ejercicio con un componente <UserBadge userId={1} /> usando Vitest + React Testing Library. El primer test espera que renderice "John Doe"; implementa con JSX hardcodeado. El segundo test con userId={2} espera "Jane Smith" — fuerza a la IA a añadir un fetch o prop real.

Si el agente intenta modificar tus tests en el paso 5, detenlo. Ese es el antipatrón más común. Tú eres el dueño de la especificación.

Conclusión:
Fake It 'Til You Make It es una estrategia poderosa dentro de TDD que permite avanzar de manera efectiva y eficiente en el desarrollo de software, manteniendo siempre un ciclo de feedback rápido y constante. Esta técnica es especialmente útil en entornos ágiles y colaborativos, donde la adaptabilidad y la integración continua son clave para el éxito del proyecto.

En 2026, además, se ha convertido en la base del Test-First Prompting: la práctica de definir el comportamiento esperado con tests antes de pedir a la IA que implemente. Este enfoque permite avanzar con la velocidad de los agentes de IA sin renunciar a la disciplina de ingeniería. Recuerda: tú defines el qué (los tests), la IA implementa el cómo (el código). Nunca al revés.