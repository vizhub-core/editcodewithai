export interface Result {
  challenge: string;
  model: string;
  passFail: string;
  type: string;
  technical?: number;
  aesthetics?: number;
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  code?: string;
}
