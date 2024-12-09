export interface TablesDefinition {
  follows: {
    Row: {
      created_at: string | null;
      follower_id: string;
      following_id: string;
    };
    Insert: {
      created_at?: string | null;
      follower_id: string;
      following_id: string;
    };
    Update: {
      created_at?: string | null;
      follower_id?: string;
      following_id?: string;
    };
  };
  likes: {
    Row: {
      created_at: string | null;
      post_id: string;
      user_id: string;
    };
    Insert: {
      created_at?: string | null;
      post_id: string;
      user_id: string;
    };
    Update: {
      created_at?: string | null;
      post_id?: string;
      user_id?: string;
    };
  };
  posts: {
    Row: {
      content: string;
      created_at: string | null;
      id: string;
      media_type: string | null;
      media_url: string | null;
      title: string;
      updated_at: string | null;
      user_id: string;
      tags: string[] | null;
      is_ai_generated: boolean | null;
      reposted_from_id: string | null;
      reposted_from_user_id: string | null;
      likes_count: number | null;
      comments_count: number | null;
    };
    Insert: {
      content: string;
      created_at?: string | null;
      id?: string;
      media_type?: string | null;
      media_url?: string | null;
      title?: string;
      updated_at?: string | null;
      user_id: string;
      tags?: string[] | null;
      is_ai_generated?: boolean | null;
      reposted_from_id?: string | null;
      reposted_from_user_id?: string | null;
      likes_count?: number | null;
      comments_count?: number | null;
    };
    Update: {
      content?: string;
      created_at?: string | null;
      id?: string;
      media_type?: string | null;
      media_url?: string | null;
      title?: string;
      updated_at?: string | null;
      user_id?: string;
      tags?: string[] | null;
      is_ai_generated?: boolean | null;
      reposted_from_id?: string | null;
      reposted_from_user_id?: string | null;
      likes_count?: number | null;
      comments_count?: number | null;
    };
  };
  profiles: {
    Row: {
      avatar_url: string | null;
      bio: string | null;
      created_at: string | null;
      full_name: string | null;
      id: string;
      updated_at: string | null;
      user_id: string;
      username: string;
    };
    Insert: {
      avatar_url?: string | null;
      bio?: string | null;
      created_at?: string | null;
      full_name?: string | null;
      id?: string;
      updated_at?: string | null;
      user_id: string;
      username: string;
    };
    Update: {
      avatar_url?: string | null;
      bio?: string | null;
      created_at?: string | null;
      full_name?: string | null;
      id?: string;
      updated_at?: string | null;
      user_id?: string;
      username?: string;
    };
  };
  comments: {
    Row: {
      id: string;
      post_id: string | null;
      user_id: string | null;
      content: string;
      parent_comment_id: string | null;
      created_at: string | null;
      updated_at: string | null;
    };
    Insert: {
      id?: string;
      post_id?: string | null;
      user_id?: string | null;
      content: string;
      parent_comment_id?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
    Update: {
      id?: string;
      post_id?: string | null;
      user_id?: string | null;
      content?: string;
      parent_comment_id?: string | null;
      created_at?: string | null;
      updated_at?: string | null;
    };
  };
}