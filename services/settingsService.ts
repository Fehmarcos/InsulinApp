import { getDatabase } from '../database/database';

export interface InsulinSettings {
  carbsPerInsulin: number;
  correctionFactor: number;
  insulinIncrement: number;
}

const DEFAULT_SETTINGS: InsulinSettings = {
  carbsPerInsulin: 15,
  correctionFactor: 40,
  insulinIncrement: 1
};

// Busca uma configuração específica do banco de dados
async function getSetting(key: string, defaultValue: string): Promise<string> {
  try {
    const db = getDatabase();
    const result = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      [key]
    );
    return result?.value || defaultValue;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return defaultValue;
  }
}

// Salva uma configuração no banco de dados
async function setSetting(key: string, value: string): Promise<void> {
  try {
    const db = getDatabase();
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      [key, value]
    );
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    throw error;
  }
}

// Busca todas as configurações de insulina
export async function getInsulinSettings(): Promise<InsulinSettings> {
  try {
    const carbsPerInsulin = await getSetting('carbsPerInsulin', DEFAULT_SETTINGS.carbsPerInsulin.toString());
    const correctionFactor = await getSetting('correctionFactor', DEFAULT_SETTINGS.correctionFactor.toString());
    const insulinIncrement = await getSetting('insulinIncrement', DEFAULT_SETTINGS.insulinIncrement.toString());

    return {
      carbsPerInsulin: Number(carbsPerInsulin) || DEFAULT_SETTINGS.carbsPerInsulin,
      correctionFactor: Number(correctionFactor) || DEFAULT_SETTINGS.correctionFactor,
      insulinIncrement: Number(insulinIncrement) || DEFAULT_SETTINGS.insulinIncrement
    };
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    return DEFAULT_SETTINGS;
  }
}

// Salva todas as configurações de insulina
export async function saveInsulinSettings(settings: InsulinSettings): Promise<void> {
  try {
    await setSetting('carbsPerInsulin', settings.carbsPerInsulin.toString());
    await setSetting('correctionFactor', settings.correctionFactor.toString());
    await setSetting('insulinIncrement', settings.insulinIncrement.toString());
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    throw error;
  }
}

export function calculateInsulinForCarbs(totalCarbs: number, carbsPerInsulin: number): number {
  if (carbsPerInsulin <= 0) return 0;
  return totalCarbs / carbsPerInsulin;
}

export function calculateCorrectionInsulin(
  currentGlucose: number,
  targetGlucose: number,
  correctionFactor: number
): number {
  if (correctionFactor <= 0) return 0;
  const difference = currentGlucose - targetGlucose;
  if (difference <= 0) return 0;
  return difference / correctionFactor;
}

export function roundInsulinToIncrement(insulin: number, increment: number): number {
  if (increment <= 0) return insulin;
  return Math.ceil(insulin / increment) * increment;
}
