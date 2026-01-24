import prisma from './src/config/db.js';

async function testCategoryUpdate() {
  try {
    // Get first blog post
    const post = await prisma.blogPost.findFirst();
    console.log('Found post:', post?.id, post?.title);
    
    if (!post) {
      console.log('No posts found');
      return;
    }

    // Update with category
    const updated = await prisma.blogPost.update({
      where: { id: post.id },
      data: { category: 'Test Category' },
    });
    
    console.log('Updated post category:', updated.category);
    
    // Verify
    const verified = await prisma.blogPost.findUnique({
      where: { id: post.id },
      select: { id: true, title: true, category: true },
    });
    
    console.log('Verified:', verified);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCategoryUpdate();
