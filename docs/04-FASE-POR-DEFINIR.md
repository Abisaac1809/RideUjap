# Fase 4 — `[POR DEFINIR]`

**Estado:** ⏸️ bloqueada hasta aprobar el documento de la [Fase 3](./03-FASE-ANALISIS-REQUERIMIENTOS.md).

---

## Qué se definirá aquí

Una vez el cliente apruebe el análisis y los requerimientos, esta fase se convertirá en el plan de desarrollo del producto real. El roadmap se extenderá con fases numeradas y con deadlines propios.

## Candidatos probables (a validar con el análisis)

Sin comprometer alcance todavía, los bloques de trabajo que con más probabilidad saldrán del análisis son:

1. **Autenticación** — registro/login, posiblemente restringido a correos institucionales UJAP.
2. **Mapa real** — integración de la librería seleccionada, geolocalización de origen/destino.
3. **Gestión de viajes** — publicar viaje (conductor), buscar/solicitar cupo (pasajero), estados del viaje.
4. **Tarifas con tasa BCV** — mostrar precios Bs/USD con la tasa oficial de [bcv.org.ve](https://www.bcv.org.ve).
5. **Deploy productivo** — implementación de la plataforma elegida (Railway o Render) con PostgreSQL gestionado, migraciones de Drizzle en CI, y variables de entorno por ambiente.
6. **Calidad** — testing (unitario en `shared`/`api`, E2E básico en móvil), CI con Turborepo aprovechando caché remoto.

## Checklist para activar esta fase

- [ ] Documento de la Fase 3 aprobado por el cliente.
- [ ] Librería de mapas decidida.
- [ ] Plataforma de deploy decidida.
- [ ] Backlog priorizado convertido en fases con estimaciones y deadlines.
- [ ] Actualizar `00-ROADMAP.md` y `gantt-roadmap.mermaid` con las nuevas fases.
