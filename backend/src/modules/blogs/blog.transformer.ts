export class BlogTransformer {
  /**
   * Transform single blog post - extract code from relation objects
   */
  transform(post: any) {
    return {
      ...post,
      status: post.status.code,
      author: post.authorName ? {
        name: post.authorName,
        avatar: post.authorImage,
        website: post.authorWebsite,
      } : (post.author ? {
        name: post.author.name,
        avatar: post.author.avatar,
        website: post.authorWebsite,
      } : null),
    };
  }

  /**
   * Transform blog post list
   */
  transformList(posts: any[]) {
    return posts.map(post => ({
      ...post,
      status: post.status.code,
      author: post.authorName ? {
        name: post.authorName,
        avatar: post.authorImage,
        website: post.authorWebsite,
      } : (post.author ? {
        name: post.author.name,
        avatar: post.author.avatar,
        website: post.authorWebsite,
      } : null),
    }));
  }
}

export const blogTransformer = new BlogTransformer();
