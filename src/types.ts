export interface Dare {
  id: number;
  author: string;
  text: string;
  location: string | null;
  reward: string | null;
  hypes: number;
  status: 'pending' | 'completed' | 'chickened';
  proof_url: string | null;
  proof_caption: string | null;
  created_at: string;
  board_id: number | null;
  darer_id: number | null;
  dared_id: number | null;
  darer_name?: string;
  dared_name?: string;
}

export interface User {
  id: number;
  email: string;
  username: string;
  display_name: string;
  created_at: string;
}

export interface Board {
  id: number;
  owner_id: number;
  type: 'personal' | 'trip';
  name: string;
  slug: string;
  is_public: number;
  invite_code: string | null;
  created_at: string;
  owner_name?: string;
  member_count?: number;
  dare_count?: number;
}

export interface BoardMember {
  id: number;
  username: string;
  display_name: string;
  role: string;
}
