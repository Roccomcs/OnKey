import { useState } from 'react';

/**
 * Hook para validar contraseña con OWASP requirements
 * Retorna: validez, errors, estado de cada requisito
 */
export function usePasswordValidation(password) {
  const requirements = {
    minLength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const isValid = Object.values(requirements).every(req => req);
  
  const errors = [];
  if (!requirements.minLength) errors.push('Mínimo 12 caracteres');
  if (!requirements.hasUppercase) errors.push('1 mayúscula (A-Z)');
  if (!requirements.hasLowercase) errors.push('1 minúscula (a-z)');
  if (!requirements.hasNumber) errors.push('1 número (0-9)');
  if (!requirements.hasSymbol) errors.push('1 símbolo (!@#$% etc)');

  return { isValid, errors, requirements };
}

/**
 * Componente visual de validación de contraseña
 * Muestra requisitos con checkmark/X en tiempo real
 */
export function PasswordValidator({ password, label = "Validar contraseña" }) {
  const { isValid, requirements } = usePasswordValidation(password);

  return (
    <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">{label}</p>
      
      <div className="space-y-1">
        {/* Mínimo 12 caracteres */}
        <div className="flex items-center gap-2 text-sm">
          <span className={requirements.minLength ? "text-green-600" : "text-gray-400"}>
            {requirements.minLength ? "✓" : "○"}
          </span>
          <span className={requirements.minLength ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
            Mínimo 12 caracteres
          </span>
        </div>

        {/* 1 mayúscula */}
        <div className="flex items-center gap-2 text-sm">
          <span className={requirements.hasUppercase ? "text-green-600" : "text-gray-400"}>
            {requirements.hasUppercase ? "✓" : "○"}
          </span>
          <span className={requirements.hasUppercase ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
            1 mayúscula (A-Z)
          </span>
        </div>

        {/* 1 minúscula */}
        <div className="flex items-center gap-2 text-sm">
          <span className={requirements.hasLowercase ? "text-green-600" : "text-gray-400"}>
            {requirements.hasLowercase ? "✓" : "○"}
          </span>
          <span className={requirements.hasLowercase ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
            1 minúscula (a-z)
          </span>
        </div>

        {/* 1 número */}
        <div className="flex items-center gap-2 text-sm">
          <span className={requirements.hasNumber ? "text-green-600" : "text-gray-400"}>
            {requirements.hasNumber ? "✓" : "○"}
          </span>
          <span className={requirements.hasNumber ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
            1 número (0-9)
          </span>
        </div>

        {/* 1 símbolo */}
        <div className="flex items-center gap-2 text-sm">
          <span className={requirements.hasSymbol ? "text-green-600" : "text-gray-400"}>
            {requirements.hasSymbol ? "✓" : "○"}
          </span>
          <span className={requirements.hasSymbol ? "text-green-700 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}>
            1 símbolo (!@#$%^&* etc)
          </span>
        </div>
      </div>

      {/* Barra de fortaleza */}
      <div className="mt-3 h-2 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all ${
            !password ? 'w-0' :
            Object.values(requirements).filter(Boolean).length === 1 ? 'w-1/5 bg-red-500' :
            Object.values(requirements).filter(Boolean).length === 2 ? 'w-2/5 bg-orange-500' :
            Object.values(requirements).filter(Boolean).length === 3 ? 'w-3/5 bg-yellow-500' :
            Object.values(requirements).filter(Boolean).length === 4 ? 'w-4/5 bg-lime-500' :
            'w-full bg-green-500'
          }`}
        ></div>
      </div>
    </div>
  );
}
