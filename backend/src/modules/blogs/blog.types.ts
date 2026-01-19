export interface CreateBlogInput {
  title: string;
  excerpt?: string;
  content: string;
  thumbnail?: string;
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
  status?: 'draft' | 'published';
}

export interface UpdateBlogInput extends Partial<CreateBlogInput> {}

export interface BlogFilters {
  status?: string;
  tag?: string;
  search?: string;
}
