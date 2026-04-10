// backend/setupMpPlans.js
// Script de configuración — ejecutar UNA SOLA VEZ:
//   node setupMpPlans.js
//
// Crea los planes Pro y Enterprise en MercadoPago y guarda
// sus IDs (mp_plan_id) en la tabla `planes` de la BD.

import dotenv from 'dotenv';
dotenv.config();

import { pool } from './db.js';
import { createMpPlan } from './services/mpService.js';

const PLANES_PAGOS = [
  { nombre: 'Starter', monto: 5000  },  // $5.000 ARS
  { nombre: 'Pro',     monto: 25000 },  // $25.000 ARS
  { nombre: 'Premium', monto: 50000 },  // $50.000 ARS
];

async function setup() {
  console.log('🚀 Configurando planes en MercadoPago...\n');

  if (!process.env.MP_ACCESS_TOKEN) {
    console.error('❌ MP_ACCESS_TOKEN no está definido en .env');
    process.exit(1);
  }

  for (const plan of PLANES_PAGOS) {
    try {
      console.log(`📦 Creando plan "${plan.nombre}" ($${plan.monto} ARS/mes)...`);

      const mpPlan = await createMpPlan({
        reason: `InmobiliariaVane - Plan ${plan.nombre}`,
        monto: plan.monto,
      });

      await pool.query(
        'UPDATE planes SET mp_plan_id = ? WHERE nombre = ?',
        [mpPlan.id, plan.nombre]
      );

      console.log(`✅ Plan "${plan.nombre}" creado. mp_plan_id: ${mpPlan.id}\n`);
    } catch (err) {
      console.error(`❌ Error con plan "${plan.nombre}":`, err.message);
    }
  }

  const [rows] = await pool.query('SELECT nombre, precio_mensual, mp_plan_id FROM planes ORDER BY precio_mensual ASC');
  console.log('\nEstado actual de los planes:');
  console.table(rows);

  process.exit(0);
}

setup();