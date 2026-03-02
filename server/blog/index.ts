export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  publishedAt: string; // ISO date string
  body: string; // HTML
}

// Import all posts
import { post as stagDoDareIdeas } from './posts/stag-do-dare-ideas.js';
import { post as henPartyDareIdeas } from './posts/hen-party-dare-ideas.js';
import { post as freshersWeekDareGames } from './posts/freshers-week-dare-games.js';
import { post as bestGroupDareApp } from './posts/best-group-dare-app.js';
import { post as dareIdeasForFriends } from './posts/dare-ideas-for-friends.js';

export const posts: BlogPost[] = [
  dareIdeasForFriends,
  stagDoDareIdeas,
  henPartyDareIdeas,
  freshersWeekDareGames,
  bestGroupDareApp,
];

// Sort newest first
posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export const postsBySlug = new Map(posts.map(p => [p.slug, p]));
