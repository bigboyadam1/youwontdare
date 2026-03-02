import { Router } from 'express';
import { posts, postsBySlug } from '../blog/index.js';
import { renderBlogPost, renderBlogIndex } from '../blog/template.js';

const router = Router();

router.get('/', (_req, res) => {
  res.type('html').send(renderBlogIndex(posts));
});

router.get('/:slug', (req, res, next) => {
  const post = postsBySlug.get(req.params.slug);
  if (!post) { next(); return; }
  res.type('html').send(renderBlogPost(post));
});

export default router;
