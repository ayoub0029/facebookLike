
## Authentication
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout` 
- `GET /auth/status`
- `GET /auth/githublogin`
- `GET /auth/github/callback`

#### `bensba /auth/github/callback ghadi ykon redirect lapage  /complete-registration?`
#### `o ghadi ykono params f query`
#### `f front 7awl dir password random o machi dima nfs password`
#### `f submit dyal completing khas ydoz lform l /auth/signup ila ja ok`
#### `men be3d 3awd redirect /auth/githublogin`
#### `haka ykon kml signup b github `
#### `hadchi f awel mera ytsejel men be3d yb9a ydoz direct `

<!-- data := url.Values{
    "email":     {newUser.Email},
    "firstName": {newUser.FirstName},
    "lastName":  {newUser.LastName},
    "avatar":    {newUser.Avatar},
    "nickname":  {newUser.Nickname},
    "aboutMe":   {newUser.AboutMe},
    "githubid":  {fmt.Sprintf("%d", newUser.GithubID)},
}

redirectURL := "/complete-registration?" + data.Encode()
http.Redirect(w, r, redirectURL, http.StatusSeeOther) -->