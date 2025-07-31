export class InternsCountResponse {
  total: number;
  totalFields: number;
  completed: number;
  inProgress: number;
  onboarding: number;
}

export class MonthlyInternsCountResponse {
  month: string;
  count: number;
}

export class FieldInternsCountResponse {
  field: string;
  count: number;
}

export class MentorInternsCountResponse {
  mentorName: string;
  count: number;
}
