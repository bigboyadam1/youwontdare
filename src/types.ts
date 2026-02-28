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
  // Phase 2: Reactions + Spice
  react_fire?: number;
  react_skull?: number;
  react_crying?: number;
  spice_avg?: number | null;
  spice_count?: number;
  // Phase 3: Timer
  deadline?: string | null;
  // Phase 6: Anonymous
  is_anonymous?: number;
  revealed?: number;
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
  type: 'personal' | 'group';
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
