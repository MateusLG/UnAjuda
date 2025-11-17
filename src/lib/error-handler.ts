/**
 * Error handler utility to sanitize and provide user-friendly error messages
 * Prevents leaking sensitive information from raw error messages
 */

interface ErrorMap {
  [key: string]: string;
}

// Common Supabase error messages mapped to user-friendly versions
const AUTH_ERROR_MESSAGES: ErrorMap = {
  "Invalid login credentials": "Email ou senha incorretos",
  "User already registered": "Este email já está cadastrado",
  "Email not confirmed": "Por favor, confirme seu email antes de fazer login",
  "Password should be at least 6 characters":
    "A senha deve ter pelo menos 6 caracteres",
  "Unable to validate email address":
    "Endereço de email inválido",
  "Signup requires a valid password": "Uma senha válida é obrigatória",
  "User not found": "Usuário não encontrado",
  "Email rate limit exceeded":
    "Muitas tentativas. Por favor, aguarde alguns minutos",
  "Invalid Refresh Token": "Sessão expirada. Por favor, faça login novamente",
  "Token has expired": "Sessão expirada. Por favor, faça login novamente",
  "Invalid token": "Token inválido. Por favor, faça login novamente",
  "New password should be different from the old password":
    "A nova senha deve ser diferente da senha atual",
};

const DATABASE_ERROR_MESSAGES: ErrorMap = {
  "duplicate key value violates unique constraint":
    "Este valor já está em uso",
  "violates foreign key constraint": "Referência inválida",
  "violates not-null constraint": "Campo obrigatório não preenchido",
  "permission denied": "Você não tem permissão para realizar esta ação",
  "row-level security": "Você não tem permissão para acessar este recurso",
};

/**
 * Sanitizes error messages to prevent information leakage
 * @param error - The error object from Supabase or other sources
 * @param defaultMessage - Default message if no match is found
 * @returns User-friendly error message
 */
export function sanitizeErrorMessage(
  error: unknown,
  defaultMessage: string = "Ocorreu um erro. Por favor, tente novamente."
): string {
  if (!error) return defaultMessage;

  // Handle error objects
  const errorMessage =
    typeof error === "string" ? error : error.message || error.error_description;

  if (!errorMessage) return defaultMessage;

  // Check for exact matches in auth errors
  if (AUTH_ERROR_MESSAGES[errorMessage]) {
    return AUTH_ERROR_MESSAGES[errorMessage];
  }

  // Check for database errors (partial match)
  for (const [key, value] of Object.entries(DATABASE_ERROR_MESSAGES)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Check for network errors
  if (
    errorMessage.includes("fetch") ||
    errorMessage.includes("network") ||
    errorMessage.includes("Network request failed")
  ) {
    return "Erro de conexão. Verifique sua internet e tente novamente.";
  }

  // Check for timeout errors
  if (errorMessage.includes("timeout")) {
    return "A operação demorou muito. Por favor, tente novamente.";
  }

  // In development, log the original error for debugging
  if (import.meta.env.DEV) {
    console.error("Original error:", error);
  }

  // Default fallback message (don't expose raw error)
  return defaultMessage;
}

/**
 * Validates input to prevent common injection attacks
 * @param input - The input string to validate
 * @returns Sanitized input
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";

  // Remove null bytes
  let sanitized = input.replace(/\0/g, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Checks if an error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (!error) return false;

  const message =
    typeof error === "string" ? error : error.message || "";

  return (
    message.includes("validation") ||
    message.includes("invalid") ||
    message.includes("required")
  );
}

/**
 * Logs errors securely without exposing sensitive data
 */
export function logError(error: unknown, context?: string): void {
  if (import.meta.env.DEV) {
    console.error(`[Error${context ? ` - ${context}` : ""}]:`, error);
  } else {
    // In production, you would send this to an error tracking service
    // like Sentry, LogRocket, etc.
    // For now, we just log a sanitized version
    console.error(
      `[Error${context ? ` - ${context}` : ""}]:`,
      sanitizeErrorMessage(error)
    );
  }
}
