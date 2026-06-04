// Contratos de envio (Payloads)
export interface LoginRequest {
  login: string;
  password: string;
}

export interface RegisterRequest {
  login: string;
  password: string;
  role: 'tecnico' | 'adm' | 'atleta';
  team?: string; // Opcional se for ADM puro
  name?: string;
}

// Contratos de resposta (Responses)`
export interface LoginResponse {
  token: string;
}