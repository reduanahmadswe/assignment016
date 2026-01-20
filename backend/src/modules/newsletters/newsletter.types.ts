export interface CreateNewsletterInput {
  title: string;
  description?: string;
  thumbnail?: string;
  pdf_link: string;
  start_date?: string;
  end_date?: string;
  is_published?: boolean;
}

export interface UpdateNewsletterInput extends Partial<CreateNewsletterInput> {}
