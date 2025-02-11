package groups

import(
	"fmt"
	d "socialNetwork/database"
	"socialNetwork/Profile"
)

type group_data struct{
	ID         		int        
	Name       		string     
	Description     string     
	Owner		    int
	Created_At      string
}

func createGroup(name,description string,owner int) int {
	query := "INSERT INTO groups (name,description,owner_id) VALUES(?,?,?);";
	res,err := d.ExecQuery(query,name,description,owner);
	if err != nil {
		return -1;
	}else{
		id, _ := res.LastInsertId();
		return int(id);
	}
}

func getAllGroups() []group_data {
	groupsList := make([]group_data, 0);
	query := "select * from groups";
	data_Rows , err := d.SelectQuery(query);
	if err != nil {
		return nil;
	}
	for data_Rows.Next() {
		MyGroup := group_data{}; 
		_ = data_Rows.Scan(&MyGroup.ID,&MyGroup.Name,&MyGroup.Description,&MyGroup.Owner,&MyGroup.Owner);
		fmt.Printf("Name : %s\n",MyGroup.Name);
		groupsList = append(groupsList,MyGroup);
	}
	return groupsList;
}

func IsMember(userId,groupId int) bool {
	query := ""
}

func getAllMembers(groupID int) []profiles. {
	
}