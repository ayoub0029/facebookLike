# API Documentation

## Authentication
- `POST /auth/signup` → Register a new user  
- `POST /auth/login` → Log in the user  
- `POST /auth/logout` → Log out the user  
- `GET /auth/status` → Check if logged in  
- `GET /auth/callback` → OAuth2 authentication callback  
- `GET /auth/github/callback` → GitHub OAuth callback  

---

## Posts, Comments & Reactions
- `POST /posts` → Create a new post (regular / in group)
- `PUT /posts` → Edit a post  
- `DELETE /posts?post_id=789` → Delete a post  
- `GET /posts?user_id=123&page=1` → Get posts by user (pagination) _(Includes all data necessaire)_  
- `GET /posts?group_id=456&page=1` → Get posts for a group _(Same structure as above)_  
- `GET /posts/comments?post_id=456&page=1` → Get comments for a post _(Includes all data necessaire)_  
- `POST /posts/comments` → Add a comment  
- `PUT /posts/comments` → Edit a comment  
- `DELETE /posts/comments?comment_id=789` → Delete a comment  
- `POST /posts/reactions` → React to a post or comment _(Pass `post_id` or `comment_id` to react accordingly)_  
---

## Groups & Events 
- `POST /groups` → Create a group
- `GET /groups?page=1` → Get all groups (pagination)
- `GET /groups/members?group_id=12&page=1` → Get group members  
- `POST /groups/join` → Request to join a group  
- `POST /groups/leave` → Leave a group 
- `POST /groups/invite` → Accept/decline a group invitation  
- `GET /groups/events?group_id=12&page=1` → Get group events
- `POST /groups/events` → Create an event
- `GET /groups/events?page=1` → Get all events (pagination)
- `POST /groups/events/vote` → Vote on an event  
---
## Chats
- `GET /chats/private?receiver_id=321&page=1` → Get private chat messages  
- `WS /chats/private` → Send a private message via WebSocket  
- `GET /chats/group?group_id=12&page=1` → Get group chat messages  
- `WS /chats/group` → Send a group chat message via WebSocket  

---

## Profiles & Followers
- `GET /profiles?user_id=123` → Get user profile  
- `POST /profiles/update` → Update profile details  
- `POST /profiles/follow` → Send follow request  
- `POST /profiles/unfollow` → Unfollow a user  
- `GET /profiles/followers?user_id=123&page=1` → Get followers of a user  
- `GET /profiles/following?user_id=123&page=1` → Get users the user follows  
- `POST /profiles/follow/accept` → Accept/reject follow request  
- `GET /profiles/follow/status?user_id=123` → Check follow status  

---

## Notifications
- `GET /notifications?user_id=123&page=1` → Get user notifications  
- `POST /notifications/seen` → Mark a notification as seen  
- `WS /notifications` → Real-time notifications via WebSocket  

## Search
- `GET /search/usersGroups?query=john&page=1` → Search for users and groups  
---
