# API Documentation

## Authentication
- `POST /api/signup` → Register a new user  
- `POST /api/login` → Log in the user  
- `POST /api/logout` → Log out the user  
- `GET /api/auth/status` → Check if logged in  
- `GET /api/auth/callback` → OAuth2 authentication callback  
- `GET /api/auth/github/callback` → GitHub OAuth callback  

---

## Posts, Comments & Reactions
- `POST /api/posts` → Create a new post (regular / in group)
- `PUT /api/posts` → Edit a post  
- `DELETE /api/posts?post_id=789` → Delete a post  
- `GET /api/posts?user_id=123&page=1` → Get posts by user (pagination) _(Includes all data necessaire)_  
- `GET /api/posts?group_id=456&page=1` → Get posts for a group _(Same structure as above)_  
- `GET /api/comments?post_id=456&page=1` → Get comments for a post _(Includes all data necessaire)_  
- `POST /api/comments` → Add a comment  
- `PUT /api/comments` → Edit a comment  
- `DELETE /api/comments?comment_id=789` → Delete a comment  
- `POST /api/reactions` → React to a post or comment _(Pass `post_id` or `comment_id` to react accordingly)_  
---

## Groups & Events 
- `POST /api/groups` → Create a group  
- `GET /api/groups?page=1` → Get all groups (pagination)  
- `GET /api/groups/members?group_id=12&page=1` → Get group members  
- `POST /api/groups/join` → Request to join a group  
- `POST /api/groups/leave` → Leave a group  
- `POST /api/groups/invite` → Accept/decline a group invitation  
- `GET /api/groups/events?group_id=12&page=1` → Get group events  
- `POST /api/events` → Create an event  
- `GET /api/events?page=1` → Get all events (pagination)  
- `POST /api/events/vote` → Vote on an event  

---

## Chats
- `GET /api/chats/private?receiver_id=321&page=1` → Get private chat messages  
- `WS /api/chats/private` → Send a private message via WebSocket  
- `GET /api/chats/group?group_id=12&page=1` → Get group chat messages  
- `WS /api/chats/group` → Send a group chat message via WebSocket  

---

## Profiles & Followers
- `GET /api/profiles?user_id=123` → Get user profile  
- `POST /api/profiles/update` → Update profile details  
- `POST /api/follow` → Send follow request  
- `POST /api/unfollow` → Unfollow a user  
- `GET /api/followers?user_id=123&page=1` → Get followers of a user  
- `GET /api/following?user_id=123&page=1` → Get users the user follows  
- `POST /api/follow/accept` → Accept/reject follow request  
- `GET /api/follow/status?user_id=123` → Check follow status  

---

## Search & Notifications
- `GET /api/notifications?user_id=123&page=1` → Get user notifications  
- `POST /api/notifications/seen` → Mark a notification as seen  
- `GET /api/search/usersGroups?query=john&page=1` → Search for users and groups  
- `WS /api/notifications` → Real-time notifications via WebSocket  

---
