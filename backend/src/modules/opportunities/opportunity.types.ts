export interface CreateOpportunityInput {
  title: string;
  description?: string;
  type: string;
  location?: string;
  duration?: string;
  deadline?: string;
  banner?: string;
}

export interface UpdateOpportunityInput extends Partial<CreateOpportunityInput> {
  status?: string;
}

export interface ApplyOpportunityInput {
  name: string;
  email: string;
  phone?: string;
  cvLink: string;
  imageLink?: string;
  portfolioLink?: string;
}
