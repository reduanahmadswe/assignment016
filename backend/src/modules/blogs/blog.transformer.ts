export class BlogTransformer {
  /**
   * Transform single blog post - extract code from relation objects
   */
  transform(post: any) {
    return {
      ...post,
      status: post.status.code,
      author_name: post.author?.name,
    };
  }

  /**
   * Transform blog post list
   */
  transformList(posts: any[]) {
    return posts.map(post => ({
      ...post,
      status: post.status.code,
      author_name: post.author?.name,
    }));
  }
}

export const blogTransformer = new BlogTransformer();
